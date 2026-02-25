# BudgetLens -- System Architecture

**Stack:** NestJS 11 + Prisma 7 + PostgreSQL

---

## 1. Overview

BudgetLens is a backend REST API for personal expense tracking, built for the Argentine economic context. It handles inflation-adjusted amounts, installment-based credit card purchases, multi-currency transactions, weekly cashflow breakdowns, and inter-family debt tracking.

The API is a single NestJS application that communicates with a PostgreSQL database via Prisma ORM. All endpoints return JSON and are documented via Swagger.

---

## 2. System Diagram

```
                          ┌─────────────────────────────────────────────┐
                          │            NestJS Application               │
                          │                                             │
  Client (Swagger/App)    │  ┌─────────┐   ┌──────────┐   ┌────────┐  │
  ───── HTTP/JSON ──────> │  │ Guards   │──>│Controllers│──>│Services│  │
                          │  │(Auth,    │   │  (REST)   │   │(Logic) │  │
                          │  │ Ledger,  │   └──────────┘   └───┬────┘  │
                          │  │ Roles)   │                      │       │
                          │  └─────────┘               ┌──────┴─────┐  │
                          │                            │ Repository  │  │
                          │                            │  (Prisma)   │  │
                          │                            └──────┬─────┘  │
                          └───────────────────────────────────┼────────┘
                                                              │
                                                              ▼
                                                    ┌──────────────────┐
                                                    │   PostgreSQL     │
                                                    └──────────────────┘
```

---

## 3. Request Lifecycle

Every HTTP request passes through this pipeline:

```
Request
  │
  ▼
Global Pipes (ValidationPipe: class-validator + class-transformer)
  │
  ▼
AuthGuard (global APP_GUARD)
  │── @Public() routes ──> skip
  │── All other routes ──> validate JWT, attach user to request
  │
  ▼
LedgerAccessGuard (global APP_GUARD)
  │── No @LedgerFrom() and no :ledgerId param ──> skip
  │── Resolves ledger from entity or route param
  │── Verifies user is owner or collaborator
  │── Attaches ledger to request
  │
  ▼
RolesGuard (controller-level, only on admin endpoints)
  │── Checks @Roles() metadata
  │
  ▼
Controller ──> Service ──> Repository ──> Prisma ──> PostgreSQL
  │
  ▼
Response (DTO mapped from entity)
```

---

## 4. Module Architecture

Each domain module follows the same layered pattern:

```
Module/
├── module.ts              # NestJS module declaration
├── controller.ts          # HTTP endpoints, Swagger annotations
├── service.ts             # Business logic
├── repository.ts          # Prisma queries
├── dto/
│   ├── create-*.dto.ts    # Input validation (class-validator)
│   ├── update-*.dto.ts    # Partial update DTO
│   └── *-response.dto.ts  # Output shape (Swagger + mapping target)
└── entities/              # Typed Prisma includes, request interfaces
```

### Module Dependency Graph

```
AppModule
├── AuthGuard (global)
├── LedgerAccessGuard (global)
│
├── AuthModule ──────────> UsersModule
├── LedgersModule ───────> UsersModule, CategoryTemplatesModule, InflationIndexesModule
├── TransactionsModule ──> LedgersModule, PaymentMethodsModule,
│                          TransactionsBreakDownModule, InflationIndexesModule
├── CollaborationsModule ─> (standalone)
├── CategoriesModule ────> (standalone)
├── GroupsModule ────────> (standalone)
├── PaymentMethodsModule ─> (standalone)
├── DebtOwnersModule ────> (standalone)
├── DebtsModule ─────────> DebtOwnersModule
├── InflationIndexesModule > (standalone)
├── CategoryTemplatesModule > (standalone)
└── SharedModule (global) ─> ConfigModule, JwtModule
```

---

## 5. Domain Modules

| Module                | Scope        | Description                                                                 |
|-----------------------|--------------|-----------------------------------------------------------------------------|
| **Auth**              | Public       | Sign up (bcrypt hash) and sign in (JWT issue)                              |
| **Users**             | Public       | User CRUD with soft-delete                                                  |
| **Ledgers**           | Owner/Collab | Core budget books; auto-seeds categories from templates on creation         |
| **Transactions**      | Ledger       | Expenses and incomes with installment, merge, and debt assignment logic     |
| **TransactionsBreakDown** | Auth     | Weekly W1--W4 amount updates per transaction                                |
| **Categories**        | Ledger       | Ledger-scoped transaction categories (seeded from templates)               |
| **CategoryTemplates** | Admin        | Global category templates seeded into new ledgers                          |
| **Groups**            | Ledger       | Ledger-scoped transaction groupings                                        |
| **PaymentMethods**    | User         | User-scoped payment methods (cash, bank, credit card, etc.)                |
| **Collaborations**    | Ledger       | Share ledger access with other users                                       |
| **DebtOwners**        | Ledger       | People involved in debt splits                                             |
| **Debts**             | Ledger       | Individual debt records (created atomically via transactions)              |
| **InflationIndexes**  | Admin/Auth   | Monthly CPI data per currency; used for real-amount calculations           |

---

## 6. Authentication and Authorization

### Guards (execution order)

| Guard              | Scope      | Responsibility                                            |
|--------------------|------------|-----------------------------------------------------------|
| `AuthGuard`        | Global     | JWT validation. Skips `@Public()` routes. Sets `request.user`. |
| `LedgerAccessGuard`| Global     | Ledger ownership/collaboration check via `@LedgerFrom()` or `:ledgerId` param. |
| `RolesGuard`       | Controller | Role-based access (`@Roles(Role.ADMIN)`) for admin endpoints. |

### Custom Decorators

| Decorator                  | Purpose                                                    |
|----------------------------|------------------------------------------------------------|
| `@Public()`                | Skip `AuthGuard` on route/controller                       |
| `@Roles(...roles)`         | Restrict to specific roles                                 |
| `@LedgerFrom(type, param?)` | Tell `LedgerAccessGuard` how to resolve the ledger        |
| `@GetUser(field?)`         | Extract user or field from JWT payload on `request.user`   |

---

## 7. Key Business Logic

### Transaction Creation (Expense)

Three paths, determined automatically:

1. **Current-month merge** -- If transaction date is current month, a matching transaction exists (same category + group + payment method + currency), and payment method is not `CREDIT_CARD`: merges into the existing transaction by updating weekly breakdown and totals.

2. **Installment flow** -- If `installments > 1`: creates N separate transactions, each with `paymentMonth` incremented by one month. Debt assignments are duplicated per installment.

3. **Single transaction** -- Default. One transaction with optional debt assignments.

All paths create 4 `TransactionBreakDown` rows (W1--W4, initialized to 0).

### Inflation Adjustment

```
realMonthlyAmount = (monthlyAmount / cpiIndex) * baseCpiIndex
```

- `cpiIndex` is looked up from `InflationIndex` for the payment month and currency
- `baseCpiIndex` is stored on the ledger at creation time (defaults to 100)

### Date Conventions

| Field              | Format       | Parser         | Example        |
|--------------------|-------------|----------------|----------------|
| `transactionDate`  | `YYYY-MM-DD`| `parseDate()`  | `2026-02-13`   |
| `paymentMonthValue`| `YYYY-MM`   | `parsePeriod()`| `2026-02`      |

Both are parsed into UTC `Date` objects before any database operation. When `paymentMonthValue` is omitted, it defaults to `transactionDate`.

### Status Lifecycle

Determined automatically from `transactionDate`:

| Status    | Condition                    |
|-----------|------------------------------|
| `CURRENT` | Same month as today          |
| `CLOSED`  | Past month                   |
| `FUTURE`  | Future month (installments)  |

---

## 8. Data Model Summary

Core entities and their relationships:

```
User (UUID)
├── owns: Ledger[]
├── owns: PaymentMethod[]
├── owns: Group[]
└── participates: Collaboration[]

Ledger (auto-increment)
├── has: Transaction[]
├── has: Category[] (seeded from CategoryTemplate[])
├── has: Group[]
├── has: DebtOwner[]
├── has: Collaboration[]
└── linked: PaymentMethod[] (M:N via LedgerPaymentMethod)

Transaction (auto-increment)
├── belongs to: Ledger, Category, Group, PaymentMethod
├── has: TransactionBreakDown[4] (W1--W4)
└── has: TransactionDebtOwner[] ──> each has one Debt

InflationIndex
└── unique on: (currency, period)
```

Full schema details are in the Prisma schema file (`prisma/schema.prisma`) and documented in `CLAUDE.md`.

---

## 9. Project Structure

```
src/
├── decorators/              @GetUser, @LedgerFrom, @Public, @Roles
├── guards/                  AuthGuard (global), LedgerAccessGuard (global), RolesGuard
├── helpers/
│   ├── dates.ts             Date parsing and period utilities (Day.js UTC)
│   ├── errors.ts            Prisma error handlers
│   └── mappers/             Entity-to-DTO mappers per domain
├── modules/
│   ├── auth/                Sign up / sign in (JWT + bcrypt)
│   ├── categories/          Ledger-scoped CRUD
│   ├── category-templates/  Global templates (admin-only)
│   ├── collaborations/      Ledger sharing between users
│   ├── debt-owners/         Ledger-scoped CRUD
│   ├── debts/               Read/update/delete (created via transactions)
│   ├── groups/              Ledger-scoped CRUD
│   ├── inflation-indexes/   CPI data management (admin)
│   ├── ledgers/             Core budget books
│   ├── payment-methods/     User-scoped CRUD
│   ├── shared/              ConfigModule, JwtModule (global)
│   ├── transactions/        Expenses, incomes, installments, merge logic
│   ├── transactions-break-down/  Weekly W1--W4 amounts
│   └── users/               User CRUD with soft-delete
├── prisma/                  PrismaService, PrismaModule (global)
├── seed/                    Database seeders (users, ledgers, groups, etc.)
├── services/
│   └── data-collection/     DataCollectionService
├── types/
│   ├── entities/            Prisma typed includes
│   └── payload/             JwtPayload interface
└── app.module.ts            Root module, global guard registration
```

---

## 10. Environment Variables

| Variable       | Required | Description                  |
|----------------|----------|------------------------------|
| `DATABASE_URL` | Yes      | PostgreSQL connection string |
| `JWT_SECRET`   | Yes      | Secret for signing JWT tokens|
| `PORT`         | No       | API port (default: 3000)     |

---

## 11. API Documentation

All endpoints are annotated with `@nestjs/swagger` decorators. Swagger UI is served at `/api` when the application is running.

Full endpoint reference with DTOs, guard requirements, and examples is available in `CLAUDE.md`.
