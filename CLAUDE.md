# CLAUDE.md — Budget Lens: Expense Tracker

## Context

Personal expense tracking application using **NestJS + Prisma + PostgreSQL**. Replicates an Excel-based tracker designed for the **Argentine economic context** (high inflation, installment-based credit card purchases, multi-currency tracking, inter-family debt ledger).

---

## Architecture

- **Backend**: NestJS with modular structure
- **ORM**: Prisma with PostgreSQL
- **Auth**: JWT-based (`bcrypt` password hashing, `@nestjs/jwt`)
- **Pattern**: Controller → Service → Repository → Prisma, with DTOs, entities, mappers, and typed includes
- **Validation**: `class-validator` + `class-transformer` for DTO validation
- **Docs**: Swagger via `@nestjs/swagger` — all controllers annotated

---

## Data Model (Prisma Schema)

### Enums

| Enum | Values |
|------|--------|
| `Gender` | `MALE`, `FEMALE` |
| `Role` | `ADMIN`, `USER` |
| `EntryType` | `INCOME`, `EXPENSE` |
| `Currency` | `ARS`, `USD` |
| `Status` | `CLOSED`, `CURRENT`, `FUTURE` |
| `TransactionType` | `FIXED`, `VARIABLE` |
| `PaymentType` | `CASH`, `BANK`, `WALLET`, `CREDIT_CARD`, `OTHER` |
| `CreditBrand` | `VISA`, `AMEX`, `MASTER`, `OTHER` |
| `DebtDirection` | `OWED_TO_ME`, `OWED_BY_ME` |
| `CategoryScope` | `GLOBAL` |

### Models and Relationships

```
User (UUID PK)
├── name, email (unique), birthDate, password, gender, role (ADMIN/USER), isActive
├── 1:N → Ledger (as owner)
├── 1:N → Collaboration
├── 1:N → PaymentMethod
└── 1:N → Group

Ledger (auto-increment PK)
├── name, description?, currency, ownerId (FK→User), isActive
├── 1:N → Transaction
├── 1:N → Category
├── 1:N → Group
├── 1:N → DebtOwner
├── 1:N → Collaboration
└── M:N → PaymentMethod (via LedgerPaymentMethod join)

Transaction (auto-increment PK)
├── ledgerId, status, entryType, categoryId, groupId, paymentMethodId
├── transactionDate, paymentMonth, installments, installment
├── comment?, currency, exchangeRate?, totalAmount, monthlyAmount
├── isPaid, impactsCashflow, cpiIndex?, realMonthlyAmount?, type (FIXED/VARIABLE)
├── N:1 → Ledger, Category, Group, PaymentMethod
├── 1:N → TransactionBreakDown (weekly W1-W4)
└── 1:N → TransactionDebtOwner (many-to-many with DebtOwner via pivot)

TransactionDebtOwner (composite PK: transactionId + debtOwnerId)
├── amount, direction (DebtDirection), debtId (unique FK→Debt)
├── N:1 → Transaction
├── N:1 → DebtOwner
└── 1:1 → Debt

Debt (auto-increment PK)
├── period, description?
└── 1:1 ← TransactionDebtOwner

DebtOwner (auto-increment PK)
├── name, ledgerId (unique constraint: ledgerId + name)
├── N:1 → Ledger
└── 1:N → TransactionDebtOwner

TransactionBreakDown (auto-increment PK)
├── transactionId, weekNumber (1-4), amount
└── N:1 → Transaction

PaymentMethod (auto-increment PK)
├── name, type (PaymentType), brand? (CreditBrand), color?, icon?, currency?, isActive
├── userId (unique constraint: userId + name)
├── N:1 → User
├── 1:N → Transaction
└── M:N → Ledger (via LedgerPaymentMethod)

LedgerPaymentMethod (composite PK: paymentMethodId + ledgerId)
├── assignedAt, assignedBy
├── N:1 → PaymentMethod
└── N:1 → Ledger

Category (auto-increment PK)
├── name, description?, ledgerId, templateId?
├── N:1 → Ledger, CategoryTemplate?
└── 1:N → Transaction

CategoryTemplate (auto-increment PK)
├── name (unique), description?, scope (GLOBAL)
└── 1:N → Category

Group (auto-increment PK)
├── name, ledgerId, userId (unique constraint: ledgerId + name)
├── N:1 → Ledger, User
└── 1:N → Transaction

Collaboration (auto-increment PK)
├── name, isActive, userId, ledgerId (unique constraint: userId + ledgerId)
├── N:1 → User
└── N:1 → Ledger

InflationIndex (auto-increment PK)
├── currency, period (unique constraint: currency + period)
├── monthlyRate, cpiIndex
└── createdAt, updatedAt
```

---

## Authentication & Authorization

### Auth Flow

1. **Sign Up** (`POST /auth/signup`): Creates user with bcrypt-hashed password. Returns user DTO.
2. **Sign In** (`POST /auth/signin`): Validates email/password, returns `{ token, user }` where token is a JWT.

### JWT Payload

```typescript
{ id: string (UUID), email: string, role: Role }
```

### Guard Chain

Three guards, applied in order:

1. **`AuthGuard`** — Validates JWT token, attaches `user` (JwtPayload) to `request.user`. Applied via `@UseGuards(AuthGuard)` on each controller.

2. **`RolesGuard`** — Checks `@Roles()` decorator metadata. If no `@Roles()` present, passes through. Used alongside `AuthGuard` on InflationIndexes controller for ADMIN-only mutation endpoints.

3. **`LedgerAccessGuard`** — Registered globally as `APP_GUARD` in `AppModule`. Resolves ledger ownership from route context, verifying the user is ledger owner or collaborator.
   - **Skip logic**: If no `@LedgerFrom()` metadata AND no `:ledgerId` route param → skips silently (returns `true`).
   - **Resolution via `@LedgerFrom(type, param?)`** (param defaults to `'id'`): Loads entity by ID from route param, derives `ledgerId`. Supported types: `ledger`, `group`, `category`, `debtOwner`, `collaboration`, `transaction`, `debt`.
   - **Resolution via route param**: Falls back to `request.params.ledgerId` for ledger-scoped routes like `POST ledgers/:ledgerId/expenses`.
   - Attaches the loaded `ledger` to `request.ledger` for downstream use.

### Custom Decorators

- **`@Roles(...roles: Role[])`** — Sets metadata for `RolesGuard`
- **`@LedgerFrom(type, param?)`** — Sets metadata for `LedgerAccessGuard` to resolve ledger from entity
- **`@GetUser(field?)`** — Extracts user or specific field from JWT payload on `request.user`

---

## API Reference

All endpoints require `Authorization: Bearer <token>` unless noted. Base URL is configurable.

### Auth (`/auth`) — No auth required

| Method | Route | Body | Response | Description |
|--------|-------|------|----------|-------------|
| POST | `/auth/signup` | `CreateUserDto` | `{ message, user: UserResponseDto }` | Register new user |
| POST | `/auth/signin` | `{ email, password }` | `{ token, user }` | Login, get JWT |

### Users (`/users`) — No auth guard (public)

| Method | Route | Body | Response | Description |
|--------|-------|------|----------|-------------|
| POST | `/` | `CreateUserDto` | `UserResponseDto` | Create user |
| GET | `/` | — | `UserResponseDto[]` | List all users |
| GET | `/:id` | — | `UserResponseDto` | Get user by UUID |
| PATCH | `/:id` | `UpdateUserDto` | `UserResponseDto` | Update user |
| DELETE | `/:id` | — | 204 | Soft-delete (deactivate) |

**CreateUserDto**: `{ name, email, birthDate, rawPassword, repeatPassword, gender }`
**UserResponseDto**: `{ id, name, email, birthDate, gender, role, createdAt, updatedAt, isActive }`

### Ledgers (`/ledgers`) — AuthGuard + LedgerAccessGuard on `:id` routes

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/` | `CreateLedgerDto` | `LedgerDashboardResponseDto` | Auth | Create ledger |
| GET | `/` | `?skip&take` | `LedgerDashboardResponseDto[]` | Auth | List user's ledgers |
| GET | `/:id` | — | `LedgerResponseDto` | Auth+Ledger | Full ledger detail |
| PATCH | `/:id` | `UpdateLedgerDto` | `LedgerDashboardResponseDto` | Auth+Ledger | Update ledger |
| DELETE | `/:id` | — | 200 | Auth+Ledger | Delete ledger |

**CreateLedgerDto**: `{ name, currency, description? }`
**LedgerResponseDto** (detail): `{ id, name, description, currency, ownerId, collaborations[], groups[], transactions[], paymentMethods[], categories[], createdAt, updatedAt }`

### Collaborations (`/collaborations`) — AuthGuard + LedgerAccessGuard on ledger-scoped and mutation routes

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/ledgers/:ledgerId` | `{ email }` | `CollaborationResponseDto` | Auth+Ledger | Invite collaborator |
| GET | `/users/:userId` | — | `CollaborationResponseDto[]` | Auth | List user's collaborations |
| GET | `/ledgers/:ledgerId` | — | `CollaborationResponseDto[]` | Auth+Ledger | List ledger's collaborations |
| GET | `/:id` | — | `CollaborationResponseDto` | Auth | Get collaboration |
| PATCH | `/:id` | `UpdateCollaborationDto` | `CollaborationResponseDto` | Auth+Ledger | Update collaboration |
| DELETE | `/:id` | — | 204 | Auth+Ledger | Soft-delete collaboration |
| PATCH | `/:id/reactivate` | — | 204 | Auth+Ledger | Reactivate collaboration |

### Categories (`/categories`) — AuthGuard + LedgerAccessGuard on ledger-scoped and `:id` routes

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/ledgers/:ledgerId` | `CreateCategoryDto` | `CategoryResponseDto` | Auth+Ledger | Create category |
| GET | `/ledgers/:ledgerId` | — | `CategoryResponseDto[]` | Auth+Ledger | List ledger categories |
| GET | `/ledgers/:ledgerId/search?name=` | — | `CategoryResponseDto` | Auth+Ledger | Find by name |
| GET | `/:id` | — | `CategoryResponseDto` | Auth+Ledger | Get by ID |
| PATCH | `/:id` | `UpdateCategoryDto` | `CategoryResponseDto` | Auth+Ledger | Update |
| DELETE | `/:id` | — | 204 | Auth+Ledger | Delete |

### Groups (`/groups`) — AuthGuard + LedgerAccessGuard on ledger-scoped and `:id` routes

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/ledgers/:ledgerId` | `CreateGroupDto` | `GroupResponseDto` | Auth+Ledger | Create group |
| GET | `/ledgers/:ledgerId` | — | `GroupResponseDto[]` | Auth+Ledger | List ledger groups |
| GET | `/ledgers/:ledgerId/search?name=` | — | `GroupResponseDto` | Auth+Ledger | Find by name |
| GET | `/:id` | — | `GroupResponseDto` | Auth+Ledger | Get by ID |
| PATCH | `/:id` | `UpdateGroupDto` | `GroupResponseDto` | Auth+Ledger | Update |
| DELETE | `/:id` | — | 204 | Auth+Ledger | Delete |

### Payment Methods (`/payment-methods`) — AuthGuard, user-scoped

| Method | Route | Body | Response | Description |
|--------|-------|------|----------|-------------|
| POST | `/` | `CreatePaymentMethodDto` | `PaymentMethodResponseDto` | Create |
| GET | `/` | — | `PaymentMethodResponseDto[]` | List user's methods |
| GET | `/:id` | — | `PaymentMethodResponseDto` | Get by ID |
| GET | `/name/:name` | — | `PaymentMethodResponseDto` | Get by name |
| GET | `/type/:type` | — | `PaymentMethodResponseDto[]` | Filter by PaymentType |
| PATCH | `/:id` | `UpdatePaymentMethodDto` | `PaymentMethodResponseDto` | Update |
| DELETE | `/:id` | — | 204 | Delete |

**CreatePaymentMethodDto**: `{ name, type (PaymentType), brand? (CreditBrand), color?, icon?, currency? (Currency) }`

### Transactions (`/transactions`) — AuthGuard + LedgerAccessGuard

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/ledgers/:ledgerId/expenses` | `CreateTransactionDto` | `TransactionResponseDto` or `[]` | Auth+Ledger | Create expense |
| POST | `/ledgers/:ledgerId/incomes` | `CreateIncomeDto` | `TransactionResponseDto` | Auth+Ledger | Create income |
| GET | `/ledgers/:ledgerId` | `?skip&take` | `TransactionResponseDto[]` | Auth+Ledger | List by ledger |
| GET | `/:id` | — | `TransactionResponseDto` | Auth+Ledger | Get by ID |
| PATCH | `/:id/breakdown` | `AssignBreakDownDto` | `TransactionResponseDto` | Auth+Ledger | Assign W1-W4 |
| PATCH | `/:id/category/:targetId` | — | `TransactionResponseDto` | Auth+Ledger | Change category |
| PATCH | `/:id/group/:targetId` | — | `TransactionResponseDto` | Auth+Ledger | Change group |
| PATCH | `/:id/payment-method/:targetId` | — | `TransactionResponseDto` | Auth+Ledger | Change payment method |

**CreateTransactionDto** (expense):
```
{ categoryId, groupId, paymentMethodId, transactionDate, currency, totalProvidedAmount,
  paymentMonthValue?, installments?, comment?, exchangeRate?, weekNumber? (1-4),
  impactsCashflow?, debtAssignments?: DebtAssignmentDto[] }
```

**DebtAssignmentDto**: `{ debtOwnerId, amount, direction (OWED_TO_ME|OWED_BY_ME) }`

**CreateIncomeDto**: Same as expense but without `installments`, `weekNumber`, `debtAssignments`.

**TransactionResponseDto**:
```
{ id, ledgerId, status, entryType, transactionDate, paymentMonth, installments,
  installment, comment?, currency, exchangeRate?, totalAmount, monthlyAmount,
  isPaid, impactsCashflow, cpiIndex?, realMonthlyAmount?,
  debtOwners?: TransactionDebtOwnerResponseDto[],
  category: CategoryResponseDto, group?: GroupResponseDto,
  paymentMethod: PaymentMethodResponseDto,
  transactionsBreakDown?: TransactionBreakDownResponseDto[] }
```

### Transactions Break Down (`/transactions-break-down`) — AuthGuard only

| Method | Route | Body | Response | Description |
|--------|-------|------|----------|-------------|
| PATCH | `/:id` | `UpdateTransactionBreakDownDto` | `TransactionBreakDownResponseDto` | Update single breakdown |

### Debt Owners (`/debt-owners`) — AuthGuard + LedgerAccessGuard

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/ledgers/:ledgerId` | `CreateDebtOwnerDto` | `DebtOwnerResponseDto` | Auth+Ledger | Create |
| GET | `/ledgers/:ledgerId` | `?skip&take` | `DebtOwnerResponseDto[]` | Auth+Ledger | List by ledger |
| GET | `/:id` | — | `DebtOwnerResponseDto` | Auth+Ledger | Get by ID |
| GET | `/ledgers/:ledgerId/by-name/:name` | — | `DebtOwnerResponseDto` | Auth+Ledger | Find by name |
| PATCH | `/:id` | `UpdateDebtOwnerDto` | `DebtOwnerResponseDto` | Auth+Ledger | Update |
| DELETE | `/:id` | — | 204 | Auth+Ledger | Delete |

### Debts (`/debts`) — AuthGuard + LedgerAccessGuard

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| GET | `/owner/:ownerId` | `?skip&take&orderBy` | `DebtResponseDto[]` | Auth+Ledger | List by owner |
| GET | `/:id` | — | `DebtResponseDto` | Auth+Ledger | Get by ID |
| PATCH | `/:id` | `UpdateDebtDto` | `DebtResponseDto` | Auth+Ledger | Update |
| DELETE | `/:id` | — | 204 | Auth+Ledger | Delete |

**DebtResponseDto**: `{ id, period, description? }`

### Inflation Indexes (`/inflation-indexes`) — AuthGuard + RolesGuard

| Method | Route | Body | Response | Roles | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/` | `CreateInflationIndexDto` | `InflationIndexResponseDto` | ADMIN | Create index |
| GET | `/` | `?currency&skip&take&startPeriod&endPeriod&orderBy` | `InflationIndexResponseDto[]` | Any | List by currency |
| GET | `/:id` | — | `InflationIndexResponseDto` | Any | Get by ID |
| PATCH | `/:id` | `UpdateInflationIndexDto` | `InflationIndexResponseDto` | ADMIN | Update |
| DELETE | `/:id` | — | 204 | ADMIN | Delete |

---

## Key Business Logic

### Transaction Creation (Expense)

The `createExpense` flow has three paths:

1. **Current-month merge** — If `transactionDate` is current month AND a matching transaction exists (same category + group + payment method + currency + entry type) AND payment method is NOT `CREDIT_CARD`: merges into existing transaction by updating the weekly breakdown amount and total. Debt assignments are still created independently.

2. **Installment flow** — If `installments > 1`: creates N separate transactions (one per installment), each with a `paymentMonth` incremented by one month. If `debtAssignments` provided, creates `TransactionDebtOwner` + `Debt` records for each assignment per installment.

3. **Single transaction** — Default path. Creates one transaction with optional debt assignments.

All paths create 4 `TransactionBreakDown` rows (W1-W4, initialized to 0) per transaction.

### Debt Model

Debts are created atomically with `TransactionDebtOwner` via Prisma nested create:
```typescript
prisma.transactionDebtOwner.create({
  data: {
    transaction: { connect: { id: transactionId } },
    debtOwner: { connect: { id: debtOwnerId } },
    amount, direction,
    debt: { create: { period, description } },
  },
});
```
A single transaction can have multiple debt owners (e.g., splitting a dinner bill). Each `TransactionDebtOwner` has exactly one `Debt`.

### Inflation Adjustment

When a transaction is created, the service looks up the `InflationIndex` for the payment month and currency. If found:
- `cpiIndex` = the CPI value (base 100 = Jan 2024)
- `realMonthlyAmount` = `(monthlyAmount / cpiIndex) * 100` — inflation-adjusted to constant Jan 2024 pesos

### Status Lifecycle

Transaction status is auto-determined from `transactionDate`:
- `CURRENT` — same month as today
- `CLOSED` — past month
- `FUTURE` — future month (projected installments)

### Multi-Currency

Transactions can be in a different currency than the ledger. When `currency !== ledger.currency`, the `exchangeRate` is required and `totalAmount = totalProvidedAmount * exchangeRate`.

---

## Project Structure

```
src/
├── decorators/         # @GetUser, @LedgerFrom, @Roles
├── guards/             # AuthGuard, RolesGuard, LedgerAccessGuard
├── helpers/
│   ├── dates.ts        # parsePeriod, checkCurrentMonth, isPastMonth, increaseMonthByInstallment
│   ├── errors.ts       # handleP2025, handleLedgerFromRequest
│   └── mappers/        # Entity → DTO mappers (transaction, debt, debt-owner, ledger, user, etc.)
├── modules/
│   ├── auth/           # AuthController, AuthService (signup/signin)
│   ├── categories/     # CRUD, ledger-scoped
│   ├── collaborations/ # CRUD + reactivate, ledger-scoped
│   ├── category-templates/ # Seeded global templates
│   ├── debt-owners/    # CRUD, ledger-scoped
│   ├── debts/          # CRUD (read/update/delete only; creation via transactions)
│   ├── groups/         # CRUD, ledger-scoped
│   ├── inflation-indexes/ # CRUD, admin-managed CPI data
│   ├── ledgers/        # CRUD, owner-scoped
│   ├── payment-methods/# CRUD, user-scoped (linked to ledgers via M:N)
│   ├── shared/         # Global module: ConfigModule, JwtModule
│   ├── transactions/   # Complex CRUD with installments, merging, debt assignments
│   ├── transactions-break-down/ # Weekly breakdown update
│   └── users/          # CRUD with soft-delete
├── prisma/             # PrismaService, PrismaModule (global)
├── services/
│   └── data-collection/ # DataCollectionService
├── types/
│   ├── entities/       # Prisma typed includes (TransactionDetailView, DebtOwnerWithTransactions, etc.)
│   └── payload/        # JwtPayload interface
└── app.module.ts       # Root module, APP_GUARD registration
```

---

## Excel Structure Reference

### SHEET: "BASE GASTOS" (Core Transaction Ledger)

Single source of truth. One row per installment per month.

| Column | Field | Type | Maps To |
|--------|-------|------|---------|
| A | STATUS | Enum | `Transaction.status` (CLOSED/CURRENT/FUTURE) |
| C | Impacto | Boolean | `Transaction.impactsCashflow` |
| D | Pagado | Boolean | `Transaction.isPaid` |
| E | Titular | String | `DebtOwner.name` via `TransactionDebtOwner` |
| F | Ingreso/Egreso | Enum | `Transaction.entryType` (INCOME/EXPENSE) |
| G | Grupo de Gasto | String | `PaymentMethod.name` / `Group.name` |
| H | Agrupador | String | Sub-category → `Group.name` |
| I | Concepto | String | `Category.name` |
| J | Detalle | String | `Transaction.comment` |
| K | Fecha transaccion | Date | `Transaction.transactionDate` |
| L | Mes Pago | Date | `Transaction.paymentMonth` |
| M | Cuotas | Int | `Transaction.installments` |
| N | N Cuota | Int | `Transaction.installment` |
| R | Importe Total Pesos | Decimal | `Transaction.totalAmount` |
| S | Importe mensual | Decimal | `Transaction.monthlyAmount` |
| U-X | W1-W4 | Decimal | `TransactionBreakDown.amount` (weekNumber 1-4) |
| Z | Index | Decimal | `Transaction.cpiIndex` |
| AA | Inicial mes real | Decimal | `Transaction.realMonthlyAmount` |

### Other Sheets

- **"Infla"**: Monthly CPI → `InflationIndex` table
- **"CASHFLOW"**: Pivot by EntryType → PaymentMethod → Category → month (derived from transactions)
- **"TD Deudas"**: Pivot by DebtOwner → month, with isPaid filter (derived from TransactionDebtOwner)
- **"Evolucion Gastos"**: Monthly category breakdown, nominal + real (derived from transactions)

---

## Key Analytical Capabilities to Replicate in Frontend

1. **Inflation-adjusted tracking** — Nominal → real (constant-peso) via CPI index
2. **Installment amortization** — One row per installment per month with correct paymentMonth
3. **Multi-dimensional categorization** — PaymentMethod x Category x Group x Comment
4. **Weekly intra-month cashflow** — W1-W4 distribution via TransactionBreakDown
5. **Forward projection** — FUTURE status for cashflow forecasting
6. **Inter-person debt ledger** — Multi-person per transaction, per-owner amounts and direction
7. **Cashflow pivot** — Monthly income vs expense by payment method
8. **Category evolution** — Nominal + real, % of total breakdowns
9. **Status lifecycle** — FUTURE → CURRENT → CLOSED
