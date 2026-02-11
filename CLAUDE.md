# CLAUDE.md — Budget Lens: Expense Tracker

## Context

Personal expense tracking application using **NestJS + Prisma + PostgreSQL**. Replicates an Excel-based tracker (`Gastos_Mati_Claude.xlsx`) designed for the **Argentine economic context** (high inflation, installment-based credit card purchases, multi-currency tracking, inter-family debt ledger).

---

## Current Project State (as of 2026-02-08)

### Architecture

- **Framework**: NestJS with modular structure
- **ORM**: Prisma with PostgreSQL
- **Auth**: JWT-based with `AuthGuard`, `RolesGuard` (ADMIN/USER), and `LedgerAccessGuard` for multi-tenant ledger access
- **Pattern**: Controller → Service → Repository → Prisma, with DTOs, entities, mappers, and typed includes

### Modules Implemented

| Module | Controller | Service | Repository | Status |
|--------|-----------|---------|------------|--------|
| Users | Yes | Yes | Yes | Complete |
| Auth | Yes | Yes | - | Complete |
| Ledgers | Yes | Yes | Yes | Complete |
| Collaborations | Yes | Yes | Yes | Complete |
| Categories | Yes | Yes | Yes | Complete |
| Groups | Yes | Yes | Yes | Complete |
| Payment Methods | Yes | Yes | Yes | Complete |
| Inflation Indexes | Yes | Yes | Yes | Complete (controller just added) |
| Transactions | Yes | Yes | Yes | Controller added, service needs debt refactor |
| Transactions Break Down | Yes | Yes | Yes | Controller added (update only) |
| Debts | Partial | Yes | Yes | **Needs refactor for new schema** |
| Debt Owners | Yes | Yes | Yes | **Needs refactor for new schema** |

### Controllers Recently Added

All controllers follow these patterns:
- `@ApiBearerAuth()`, `@ApiTags()`, `@UseGuards()` at class level
- Swagger decorators (`@ApiOperation`, `@ApiOkResponse`, `@ApiParam`, etc.) per endpoint
- `ParseIntPipe` for `:id` params, `ParseEnumPipe` for enum params
- `@HttpCode(HttpStatus.NO_CONTENT)` for DELETE endpoints

**Inflation Indexes Controller** (`inflation-indexes.controller.ts`):
- `@UseGuards(AuthGuard, RolesGuard)` — all endpoints require auth, `@Roles(Role.ADMIN)` on POST/PATCH/DELETE
- Endpoints: `POST /`, `GET /` (with currency, pagination, period range, orderBy), `GET /:id`, `PATCH /:id`, `DELETE /:id`

**Transactions Controller** (`transactions.controller.ts`):
- `@UseGuards(AuthGuard, LedgerAccessGuard)` — ledger-scoped access control
- Ledger-scoped routes use `ledgers/:ledgerId/...` (guard resolves via `request.params.ledgerId`)
- Transaction-scoped routes use `@LedgerFrom('transaction', 'id')` (guard loads transaction → derives ledgerId)
- Endpoints: `POST .../expenses`, `POST .../incomes`, `GET ledgers/:ledgerId`, `GET /:id`, `PATCH /:id/breakdown`, `PATCH /:id/category/:targetId`, `PATCH /:id/group/:targetId`, `PATCH /:id/payment-method/:targetId`

**Transactions Break Down Controller** (`transactions-break-down.controller.ts`):
- `@UseGuards(AuthGuard)` only (LedgerAccessGuard doesn't support breakdown entity type)
- Single endpoint: `PATCH /:id`

### Guards & Decorators

- **`AuthGuard`**: JWT token validation
- **`RolesGuard`**: Checks `@Roles()` metadata; passes through if no decorator present
- **`LedgerAccessGuard`**: Multi-tenant authorization — resolves ledgerId from various entity types via `@LedgerFrom(type, param)` decorator, verifies user is owner or collaborator
  - Supported types: `ledger`, `group`, `category`, `debtOwner`, `collaboration`, `transaction`, `debt`
  - NOT supported: `transactionBreakDown` (would need extension)
- **`@Roles(...roles)`**: Sets metadata for RolesGuard
- **`@LedgerFrom(type, param)`**: Sets metadata for LedgerAccessGuard to resolve ledger from entity
- **`@GetUser(field?)`**: Extracts user/field from JWT payload

---

## Recent Schema Change: Many-to-Many Debt Model

### What Changed

The `Transaction ↔ DebtOwner` relationship was changed from a direct 1:N FK to a **many-to-many with payload** through a `TransactionDebtOwner` join table:

```
Transaction ←→ TransactionDebtOwner ←→ DebtOwner
                       ↓
                      Debt
```

**Old model**: `Transaction` had optional `debtOwnerId` FK. `Debt` had `debtOwnerId`, `direction`, `amount`.

**New model** (current `schema.prisma`):
- `Transaction` has `debtOwners: TransactionDebtOwner[]`
- `TransactionDebtOwner` is the pivot: composite PK `(transactionId, debtOwnerId)`, carries `amount`, `direction` (DebtDirection), and `debtId` (1:1 link to Debt)
- `Debt` is simplified: only `id`, `period`, `description` (plus back-relation to TransactionDebtOwner)
- `DebtOwner` has `transactions: TransactionDebtOwner[]` instead of direct `debts`/`transactions` relations

### Files Already Updated (entities, DTOs, mappers, types)

**New files created:**
- `src/modules/transactions/entities/transaction-debt-owner.entity.ts` — TransactionDebtOwner entity
- `src/modules/transactions/dto/debt-assignment.dto.ts` — Input DTO for debt assignments (replaces single debtOwnerId/debtAmount/debtDirection)
- `src/modules/transactions/dto/transaction-debt-owner-response.dto.ts` — Response DTO (transactionId, debtOwnerId, debtOwnerName, amount, direction, nested debt)

**Updated entities:**
- `transaction.entity.ts` — removed `debtOwnerId`, added `debtOwners: TransactionDebtOwnerEntity[]`
- `debt.entity.ts` — stripped to `id`, `period`, `description`
- `debt-owner.entity.ts` — `transactions: TransactionDebtOwnerEntity[]` replaces `debts`/`transactions`

**Updated DTOs:**
- `create-transaction.dto.ts` — replaced `debtOwnerId`/`debtAmount`/`debtDirection` with `debtAssignments?: DebtAssignmentDto[]` (uses `@ValidateNested` + `@Type` from class-transformer)
- `transaction-response.dto.ts` — replaced `debtOwner?: string` with `debtOwners?: TransactionDebtOwnerResponseDto[]`
- `create-debt.dto.ts` — removed `direction`, `amount` (now on join table); keeps `periodString`, `description`
- `debt-response.dto.ts` — removed `debtOwnerId`, `direction`, `amount`; keeps `id`, `period`, `description`
- `debt-owner-response.dto.ts` — `transactions?: TransactionDebtOwnerResponseDto[]` replaces `debts: DebtResponseDto[]`

**Updated types:**
- `transaction.types.ts` — `TransactionIncludes.detail` uses `debtOwners: { include: { debtOwner: true, debt: true } }`
- `debt.types.ts` — `DebtOwnerWithDebts` renamed to `DebtOwnerWithTransactions`, includes `transactions: { include: { debt: true } }`
- `ledger.types.ts` — `LedgerIncludes.detail` transactions include updated to match

**Updated mappers:**
- `transaction.mapper.ts` — maps `debtOwners` array via `transactionDebtOwnerToResponseDto`
- `debt.mapper.ts` — simplified to map `id`, `period`, `description`
- `debt-owner.mapper.ts` — traverses `transactions: TransactionDebtOwner[]` with nested debt

**Updated repositories:**
- `ledgers.repository.ts` — both `findLedgerById` and `findLedgerByName` includes updated

**Dependency added:** `class-transformer` (for `@Type(() => DebtAssignmentDto)`)

### PENDING: Service & Repository Changes for Debt Refactor

The following files still reference the old schema and need updating:

#### `TransactionsRepository` (`transactions.repository.ts`)
- **4 methods** (`create`, `findById`, `findAllByPaginated`, `update`) have hardcoded `debtOwner: true` in includes → change to `debtOwners: { include: { debtOwner: true, debt: true } }`

#### `TransactionsService` (`transactions.service.ts`)
- **`handleDebtOwner` method** (lines 61-76): Creates standalone Debt via debtsService. Needs rewrite — debts are now created as part of TransactionDebtOwner records, not independently
- **`createExpense`**: Destructures old `debtOwnerId`/`debtAmount`/`debtDirection` → should use `debtAssignments` array
- **`createExpense` single with debt** (lines 364-392): Uses `debtOwner: { connect: { id } }` in create input → create transaction first, then create TransactionDebtOwner + Debt for each assignment
- **`createExpense` merge path** (lines 312-324): Calls `handleDebtOwner` with single debt owner → iterate `debtAssignments`
- **`handleInstallments`** (lines 100-202): Takes `debtOwnerId`/`debtAmount`/`debtDirection` params → accept `debtAssignments?: DebtAssignmentDto[]`, loop per installment
- **`handleInstallments` create input** (line 152): Uses `debtOwner: { connect: { id } }` → link via join table after creation

#### `DebtsRepository` (`debts.repository.ts`)
- **`findAllByOwnerId`** (line 17): Filters by `debtOwnerId` which no longer exists on Debt → needs rethinking (query through join table or remove)
- **`create`** (line 28): Accepts `DebtCreateInput` with old fields → now just `{ period, description }`

#### `DebtsService` (`debts.service.ts`)
- **`parsedOrderBy`** (line 27): Allows sorting by `amount`, `direction` which no longer exist on Debt → only `period` valid
- **`create`** (lines 36-52): Destructures `direction`, `amount` and connects to `debtOwner` → simplify to `period` + `description`
- **`findAllByOwnerId`** (lines 54-68): Delegates to repo method that filters by `debtOwnerId` → breaks

#### `DebtOwnersRepository` (`debt-owners.repository.ts`)
- **Import** (line 5): Uses old type `DebtOwnerWithDebts` → rename to `DebtOwnerWithTransactions`
- **3 query methods** (`findAllByLedgerId`, `findById`, `findByNameInLedger`): Include `{ debts: true }` → `{ transactions: { include: { debt: true } } }`

#### `LedgerAccessGuard` (`ledger-access.guard.ts`)
- **`debt` resolution** (line 119): Accesses `debt.debtOwnerId` to find ledger → Debt no longer has that FK. Must resolve through TransactionDebtOwner → DebtOwner → ledgerId

---

## Excel Structure Reference

### SHEET: "BASE GASTOS" (Core Transaction Ledger) — ~5,500 rows

Single source of truth. One row per installment per month.

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | `STATUS` | Enum | `Cerrado`, `Actual`, `Futuro` |
| B | `STATUS & WEEK` | Derived | STATUS + week number for weekly pivots |
| C | `Impacto` | Boolean | Whether transaction impacts cashflow |
| D | `Pagado` | Boolean | Whether paid/settled |
| E | `Titular` | Enum/String | Debt owner: `Yani`, `Sofi`, `Susana`, `Pau`, `Celi`, `Otros` |
| F | `Ingreso / Egreso` | Enum | Income or Expense |
| G | `Grupo de Gasto` | Enum | Payment method/instrument |
| H | `Agrupador` | String | Sub-category (~80 values) |
| I | `Concepto` | Enum | High-level category |
| J | `Detalle` | String | Free-text description |
| K | `Fecha transacción` | Date | Purchase date |
| L | `Mes Pago` | Date | Payment month (advances for installments) |
| M | `Cuotas` | Integer | Total installments |
| N | `N° Cuota` | Integer | Current installment number |
| O | `Cuotas Pendientes` | Integer | Remaining installments |
| P | `Importe Total USD` | Decimal | Total in USD |
| Q | `TC Estimado` | Decimal | Exchange rate |
| R | `Importe Total Pesos` | Decimal | Total in ARS |
| S | `Importe estimado mensual` | Decimal | Monthly installment amount |
| T | `Inicial Mes` | Decimal | Signed monthly amount for pivots |
| U-X | `W1`-`W4` | Decimal | Weekly distribution |
| Y | `Balance Mes` | Decimal | Running monthly balance |
| Z | `Index` | Decimal | CPI index (base 100 = Jan 2024) |
| AA | `Inicial mes real` | Decimal | Inflation-adjusted amount |

**Key rules:**
- Installment purchases: one row per installment per month
- `Futuro` = projected future installments
- Negative amounts on Egreso = reimbursements/contra-entries

### SHEET: "Infla" (Inflation Table)
Monthly CPI from Jan 2024–Dec 2026. Columns: Mes, monthly rate, cumulative CPI (base 100), YTD accumulated, year-over-year.

### SHEET: "CASHFLOW"
Pivot: Ingreso/Egreso → Payment method → Category → Detail, by month. Shows income/expense totals and net.

### SHEET: "TD Deudas"
Pivot: Titular → Detail items, by month. Net balances per person. Pagado filter for settled vs pending.

### SHEET: "Evolución Gastos"
Monthly breakdown by category, nominal + inflation-adjusted (% of total).

### SHEET: "GRAPH Evol. de gastos" / "GRAPH Evol reales detallado"
Aggregated/detailed monthly totals for charting.

### SHEET: "Lista"
Dropdown reference lists for data validation.

> **Ignore:** "Paritarias", "Hoja1", "Osde", "Expectativa mínima de salario", "Calcular %", "Sheet1" — personal notes, not in scope.

---

## Key Analytical Capabilities to Replicate

1. **Inflation-adjusted tracking**: Nominal → real (constant-peso) via CPI index
2. **Installment amortization**: One row per installment per month with correct Mes Pago and N° Cuota
3. **Multi-dimensional categorization**: Payment method × Category × Sub-category × Detail
4. **Weekly intra-month cashflow**: W1–W4 distribution
5. **Forward projection**: Futuro status for cashflow forecasting
6. **Inter-person debt ledger**: Multi-person per transaction, itemized debts, payment status
7. **Cashflow pivot**: Monthly income vs expense by payment method
8. **Category evolution**: Nominal + real, % of total breakdowns
9. **Status lifecycle**: Futuro → Actual → Cerrado
