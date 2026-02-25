# BudgetLens -- Project Proposal

## Project Overview

### Project Name
**BudgetLens**

### Team Members
Matias Tailler -- Full Stack Developer (Solo Project)

---

## Business Case

**Context:**
BudgetLens operates in the *personal finance* and *financial planning* sector, specifically designed for the Argentine economic context. In high-inflation economies, traditional expense trackers fall short -- they record what was spent but ignore the erosion of purchasing power over time. Users need a tool that tracks expenses in both nominal and real (inflation-adjusted) terms, handles the complexity of installment-based credit card purchases, and provides weekly cashflow visibility.

**Purpose:**
BudgetLens is a backend REST API that replicates and extends an Excel-based personal finance tracker. It digitalizes the structured budgeting workflow that was previously managed across multiple spreadsheet tabs, adding multi-user collaboration, automated inflation adjustment, and installment management.

**Problem Solved:**
- Manual Excel tracking is error-prone and doesn't scale across devices or users
- Credit card installment tracking requires manually creating one row per month per purchase
- Inflation adjustment requires manual CPI lookups and formula updates each month
- Sharing a family budget via spreadsheets creates version conflicts

**Added Value:**
BudgetLens automates what previously required manual spreadsheet work: installment amortization across months, CPI-based real-amount calculations, weekly cashflow breakdowns, and inter-person debt tracking. It turns a single-user Excel file into a collaborative, API-driven platform ready for any frontend.

---

## Functionalities

### Core Features (Implemented)

| Feature | Description |
|---------|-------------|
| **JWT Authentication** | User registration with bcrypt password hashing and JWT-based session management. Global auth guard with public route opt-out via `@Public()` decorator. |
| **Ledger System** | Independent budget books per user. Each ledger has its own categories, groups, transactions, and debt owners. Supports collaboration with other users. |
| **Expense Tracking** | Full transaction CRUD with automatic status lifecycle (CURRENT/CLOSED/FUTURE), multi-currency support with exchange rate conversion, and weekly W1-W4 cashflow breakdown. |
| **Income Tracking** | Separate income entry flow with the same currency, inflation, and period handling as expenses. |
| **Installment Management** | Credit card purchases automatically split into N monthly transactions, each with its own payment month and status. |
| **Current-Month Merge** | Non-credit-card expenses in the same month with matching category/group/payment method are merged into a single transaction, updating weekly breakdowns. |
| **Inflation Adjustment** | Transactions store both nominal and real (CPI-adjusted) amounts. Real amounts are calculated using a base CPI index captured at ledger creation. |
| **Multi-Currency** | Transactions can differ from ledger currency. Exchange rate is required and applied automatically when currencies don't match. |
| **Inter-Person Debt Ledger** | Transactions can be split across multiple debt owners with per-person amounts and direction (owed to me / owed by me). Debts are created atomically with transactions. |
| **Collaboration** | Ledgers can be shared with other users via collaborations. Access control verifies ownership or active collaboration on every ledger-scoped request. |
| **Role-Based Access** | Admin-only endpoints for managing global category templates and inflation indexes. Enforced via `RolesGuard`. |
| **API Documentation** | All endpoints annotated with Swagger decorators. Interactive documentation served at `/api`. |

### Authorization Model

Three guards execute in order on every request:

1. **AuthGuard** (global) -- Validates JWT, attaches user to request. Skips `@Public()` routes.
2. **LedgerAccessGuard** (global) -- Verifies user is ledger owner or collaborator. Resolves ledger from route params or entity lookups.
3. **RolesGuard** (controller-level) -- Restricts admin endpoints via `@Roles()` decorator.

---

## User Stories

### Authentication
- As a user, I can register with my email and password to create an account.
- As a user, I can sign in and receive a JWT token to access protected endpoints.

### Ledger Management
- As a user, I can create multiple ledgers (budget books), each with its own currency and base CPI index.
- As a user, I can view a full detail of my ledger including all transactions, categories, groups, and payment methods.
- As a user, I can invite other users to collaborate on my ledger.

### Transaction Management
- As a user, I can record expenses with category, group, payment method, and optional weekly breakdown.
- As a user, I can record incomes with the same structure as expenses.
- As a user, I can create installment purchases that automatically generate one transaction per month.
- As a user, I can see my expenses merged when they share the same category, group, payment method, and month (non-credit-card).
- As a user, I can assign debt splits to a transaction, tracking who owes what and in which direction.

### Organization
- As a user, I can create and manage categories, groups, and payment methods to organize my transactions.
- As a user, I can change a transaction's category, group, or payment method after creation.
- As a user, I can assign weekly amounts (W1-W4) to a transaction for intra-month cashflow tracking.

### Inflation & Currency
- As a user, my transactions automatically include CPI-adjusted real amounts when inflation data is available.
- As a user, I can record transactions in a different currency than my ledger, with automatic exchange rate conversion.

### Administration
- As an admin, I can manage global category templates that are seeded into new ledgers.
- As an admin, I can manage inflation index data (monthly CPI by currency).

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js + TypeScript |
| Framework | NestJS 11 |
| ORM | Prisma 7 with PostgreSQL adapter (`@prisma/adapter-pg`) |
| Database | PostgreSQL |
| Authentication | JWT (`@nestjs/jwt` + `bcrypt`) |
| Validation | `class-validator` + `class-transformer` |
| Date Handling | Day.js (UTC mode) |
| API Documentation | Swagger (`@nestjs/swagger`) |
| Testing | Jest + Supertest |
| Version Control | Git + GitHub |

---

## Architecture

### System Diagram

```
                          +---------------------------------------------+
                          |            NestJS Application                |
                          |                                             |
  Client (Swagger/App)    |  +---------+   +----------+   +--------+   |
  ----- HTTP/JSON ------> |  | Guards  |-->|Controllers|-->|Services|   |
                          |  |(Auth,   |   |  (REST)   |   |(Logic) |   |
                          |  | Ledger, |   +----------+   +---+----+   |
                          |  | Roles)  |                      |        |
                          |  +---------+               +------+-----+  |
                          |                            | Repository  |  |
                          |                            |  (Prisma)   |  |
                          |                            +------+-----+  |
                          +-------------------------------------------+
                                                              |
                                                              v
                                                    +------------------+
                                                    |   PostgreSQL     |
                                                    +------------------+
```

### Module Pattern

Each domain module follows a consistent layered structure:

```
Module/
+-- module.ts              # NestJS module declaration
+-- controller.ts          # HTTP endpoints, Swagger annotations
+-- service.ts             # Business logic
+-- repository.ts          # Prisma queries
+-- dto/
|   +-- create-*.dto.ts    # Input validation (class-validator)
|   +-- update-*.dto.ts    # Partial update DTO
|   +-- *-response.dto.ts  # Output shape (Swagger + mapping)
+-- entities/              # Typed Prisma includes, request interfaces
```

### Domain Modules

| Module | Scope | Description |
|--------|-------|-------------|
| Auth | Public | Sign up (bcrypt hash) and sign in (JWT issue) |
| Users | Public | User CRUD with soft-delete |
| Ledgers | Owner/Collab | Core budget books; auto-seeds categories from templates |
| Transactions | Ledger | Expenses and incomes with installment, merge, and debt logic |
| TransactionsBreakDown | Auth | Weekly W1-W4 amount updates per transaction |
| Categories | Ledger | Ledger-scoped transaction categories (seeded from templates) |
| CategoryTemplates | Admin | Global category templates seeded into new ledgers |
| Groups | Ledger | Ledger-scoped transaction groupings |
| PaymentMethods | User | User-scoped payment methods (cash, bank, credit card, etc.) |
| Collaborations | Ledger | Share ledger access with other users |
| DebtOwners | Ledger | People involved in debt splits |
| Debts | Ledger | Individual debt records (created atomically via transactions) |
| InflationIndexes | Admin/Auth | Monthly CPI data per currency |

---

## Data Model

Core entities and relationships:

```
User (UUID)
+-- owns: Ledger[]
+-- owns: PaymentMethod[]
+-- owns: Group[]
+-- participates: Collaboration[]

Ledger (auto-increment)
+-- has: Transaction[]
+-- has: Category[] (seeded from CategoryTemplate[])
+-- has: Group[]
+-- has: DebtOwner[]
+-- has: Collaboration[]
+-- linked: PaymentMethod[] (M:N via LedgerPaymentMethod)

Transaction (auto-increment)
+-- belongs to: Ledger, Category, Group, PaymentMethod
+-- has: TransactionBreakDown[4] (W1-W4)
+-- has: TransactionDebtOwner[] --> each has one Debt

InflationIndex
+-- unique on: (currency, period)
```

Full schema details are in the Prisma schema file (`prisma/schema.prisma`).

---

## Key Business Logic

### Transaction Creation (Expense)

Three paths, determined automatically:

1. **Current-month merge** -- If transaction date is current month, a matching transaction exists (same category + group + payment method + currency), and payment method is not CREDIT_CARD: merges into the existing transaction by updating weekly breakdown and totals.

2. **Installment flow** -- If installments > 1: creates N separate transactions, each with paymentMonth incremented by one month. Debt assignments are duplicated per installment.

3. **Single transaction** -- Default. One transaction with optional debt assignments.

### Inflation Adjustment

```
realMonthlyAmount = (monthlyAmount / cpiIndex) * baseCpiIndex
```

- `cpiIndex` is looked up from InflationIndex for the payment month and currency
- `baseCpiIndex` is stored on the ledger at creation time (defaults to 100)

### Status Lifecycle

| Status | Condition |
|--------|-----------|
| CURRENT | Same month as today |
| CLOSED | Past month |
| FUTURE | Future month (installments) |

---

## Project Documentation

- **API Documentation** -- Swagger UI served at `/api` with full endpoint descriptions, DTOs, and examples
- **Architecture Document** -- `docs/architecture.md` covering system design, request lifecycle, and module dependencies
- **Project Instructions** -- `CLAUDE.md` with complete data model, API reference, and business logic documentation
- **Database Schema** -- `prisma/schema.prisma` as the single source of truth for the data model

---

## Excel Structure Reference

BudgetLens digitalizes a multi-tab Excel tracker. The key analytical capabilities replicated:

| Capability | Implementation |
|------------|----------------|
| Inflation-adjusted tracking | Nominal to real (constant-peso) via CPI index |
| Installment amortization | One transaction per installment per month with correct paymentMonth |
| Multi-dimensional categorization | PaymentMethod x Category x Group x Comment |
| Weekly intra-month cashflow | W1-W4 distribution via TransactionBreakDown |
| Forward projection | FUTURE status for cashflow forecasting |
| Inter-person debt ledger | Multi-person per transaction, per-owner amounts and direction |
| Status lifecycle | FUTURE to CURRENT to CLOSED |

---

## Vision Statement

> **BudgetLens** brings structure to personal finance in high-inflation economies. It replaces fragile spreadsheets with a robust, collaborative API that handles the real complexity of Argentine household budgeting -- installments, inflation, multiple currencies, and shared expenses -- so users can focus on understanding their money, not managing their formulas.
