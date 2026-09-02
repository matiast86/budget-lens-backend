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
├── isPaid, impactsCashflow, cpiIndex?, realMonthlyAmount?, plannedAmount?, transactionType (FIXED/VARIABLE, default VARIABLE)
├── N:1 → Ledger, Category, Group, PaymentMethod
├── 1:N → TransactionBreakDown (weekly W1-W4)
└── 1:N → TransactionDebtOwner (many-to-many with DebtOwner via pivot)

TransactionDebtOwner (composite PK: transactionId + debtOwnerId)
├── amount, direction (DebtDirection), debtId (unique FK→Debt)
├── N:1 → Transaction
├── N:1 → DebtOwner
└── 1:1 → Debt

Debt (auto-increment PK)
├── period, description (NOT NULL)
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

Three global/controller-level guards. The first two are registered as `APP_GUARD` in `AppModule` (order matters):

1. **`AuthGuard`** *(global `APP_GUARD`)* — Validates JWT token, attaches `user` (JwtPayload) to `request.user`. Skips routes decorated with `@Public()`. Runs first so `request.user` is available to downstream guards.

2. **`LedgerAccessGuard`** *(global `APP_GUARD`)* — Resolves ledger ownership from route context, verifying the user is ledger owner or collaborator.
   - **Skip logic**: If no `@LedgerFrom()` metadata AND no `:ledgerId` route param → skips silently (returns `true`). Also skips `@Public()` routes since `AuthGuard` already skipped.
   - **Resolution via `@LedgerFrom(type, param?)`** (param defaults to `'id'`): Loads entity by ID from route param, derives `ledgerId`. Supported types: `ledger`, `group`, `category`, `debtOwner`, `collaboration`, `transaction`, `debt`.
   - **Resolution via route param**: Falls back to `request.params.ledgerId` for ledger-scoped routes like `POST ledgers/:ledgerId/expenses`.
   - Attaches the loaded `ledger` to `request.ledger` for downstream use.

3. **`RolesGuard`** *(controller-level)* — Checks `@Roles()` decorator metadata. If no `@Roles()` present, passes through. Applied via `@UseGuards(RolesGuard)` on InflationIndexes and CategoryTemplates controllers for ADMIN-only endpoints.

### Custom Decorators

- **`@Public()`** — Marks route/controller as public; `AuthGuard` skips token validation. Applied to `AuthController` and `UsersController`.
- **`@Roles(...roles: Role[])`** — Sets metadata for `RolesGuard`
- **`@LedgerFrom(type, param?)`** — Sets metadata for `LedgerAccessGuard` to resolve ledger from entity
- **`@GetUser(field?)`** — Extracts user or specific field from JWT payload on `request.user`

---

## API Reference

All endpoints require `Authorization: Bearer <token>` unless noted. Base URL is configurable.

### Auth (`/auth`) — `@Public()`

| Method | Route | Body | Response | Description |
|--------|-------|------|----------|-------------|
| POST | `/auth/signup` | `CreateUserDto` | `{ message, user: UserResponseDto }` | Register new user |
| POST | `/auth/signin` | `SignInAuthDto` | `SignInResponseDto` | Login, get JWT |

**SignInAuthDto**: `{ email, password }`
**SignInResponseDto**: `{ token: string, user: UserDashboardViewDto }`
- `token` — signed JWT, send as `Authorization: Bearer <token>`
- `user` — full dashboard view including owned ledgers

### Users (`/users`) — `@Public()`

| Method | Route | Body | Response | Description |
|--------|-------|------|----------|-------------|
| POST | `/` | `CreateUserDto` | `UserResponseDto` | Create user |
| GET | `/` | — | `UserResponseDto[]` | List all users |
| GET | `/:id` | — | `UserResponseDto` | Get user by UUID |
| PATCH | `/:id` | `UpdateUserDto` | `UserResponseDto` | Update user |
| DELETE | `/:id` | — | 204 | Soft-delete (deactivate) |

**CreateUserDto**: `{ name, email, birthDate, rawPassword, repeatPassword, gender }`
**UserResponseDto**: `{ id, name, email, birthDate, gender, role, createdAt, updatedAt, isActive }`

### Ledgers (`/ledgers`) — LedgerAccessGuard on `:id` routes

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/` | `CreateLedgerDto` | `LedgerDashboardResponseDto` | — | Create ledger |
| GET | `/` | `?skip&take` | `LedgerDashboardResponseDto[]` | — | List user's ledgers |
| GET | `/:id` | — | `LedgerResponseDto` | Ledger | Full ledger detail |
| PATCH | `/:id` | `UpdateLedgerDto` | `LedgerDashboardResponseDto` | Ledger | Update ledger |
| DELETE | `/:id` | — | 200 | Ledger | Delete ledger |

**CreateLedgerDto**: `{ name, currency, description? }`
**LedgerResponseDto** (detail): `{ id, name, description, currency, ownerId, collaborations[], groups[], transactions[], paymentMethods[], categories[], createdAt, updatedAt }`

### Collaborations (`/collaborations`) — LedgerAccessGuard on ledger-scoped and mutation routes

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/ledgers/:ledgerId` | `{ email }` | `CollaborationResponseDto` | Ledger | Invite collaborator |
| GET | `/users/:userId` | — | `CollaborationResponseDto[]` | — | List user's collaborations |
| GET | `/ledgers/:ledgerId` | — | `CollaborationResponseDto[]` | Ledger | List ledger's collaborations |
| GET | `/:id` | — | `CollaborationResponseDto` | — | Get collaboration |
| PATCH | `/:id` | `UpdateCollaborationDto` | `CollaborationResponseDto` | Ledger | Update collaboration |
| DELETE | `/:id` | — | 204 | Ledger | Soft-delete collaboration |
| PATCH | `/:id/reactivate` | — | 204 | Ledger | Reactivate collaboration |

### Categories (`/categories`) — LedgerAccessGuard on ledger-scoped and `:id` routes

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/ledgers/:ledgerId` | `CreateCategoryDto` | `CategoryResponseDto` | Ledger | Create category |
| GET | `/ledgers/:ledgerId` | — | `CategoryResponseDto[]` | Ledger | List ledger categories |
| GET | `/ledgers/:ledgerId/search?name=` | — | `CategoryResponseDto` | Ledger | Find by name |
| GET | `/:id` | — | `CategoryResponseDto` | Ledger | Get by ID |
| PATCH | `/:id` | `UpdateCategoryDto` | `CategoryResponseDto` | Ledger | Update |
| DELETE | `/:id` | — | 204 | Ledger | Delete |

### Groups (`/groups`) — LedgerAccessGuard on ledger-scoped and `:id` routes

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/ledgers/:ledgerId` | `CreateGroupDto` | `GroupResponseDto` | Ledger | Create group |
| GET | `/ledgers/:ledgerId` | — | `GroupResponseDto[]` | Ledger | List ledger groups |
| GET | `/ledgers/:ledgerId/search?name=` | — | `GroupResponseDto` | Ledger | Find by name |
| GET | `/:id` | — | `GroupResponseDto` | Ledger | Get by ID |
| PATCH | `/:id` | `UpdateGroupDto` | `GroupResponseDto` | Ledger | Update |
| DELETE | `/:id` | — | 204 | Ledger | Delete |

### Payment Methods (`/payment-methods`) — user-scoped

| Method | Route | Body | Response | Description |
|--------|-------|------|----------|-------------|
| POST | `/` | `CreatePaymentMethodDto` | `PaymentMethodResponseDto` | Create + auto-assign to all user ledgers |
| GET | `/` | — | `PaymentMethodResponseDto[]` | List user's methods |
| GET | `/:id` | — | `PaymentMethodResponseDto` | Get by ID |
| GET | `/name/:name` | — | `PaymentMethodResponseDto` | Get by name |
| GET | `/type/:type` | — | `PaymentMethodResponseDto[]` | Filter by PaymentType |
| PATCH | `/:id` | `UpdatePaymentMethodDto` | `PaymentMethodResponseDto` | Update |
| DELETE | `/:id` | — | 204 | Delete |

**CreatePaymentMethodDto**: `{ name, type (PaymentType), brand? (CreditBrand), color?, icon?, currency? (Currency) }`

**PM auto-assignment invariant** — PMs belong to the user, not to individual ledgers. Two events keep `LedgerPaymentMethod` fully cross-joined:
- **Ledger created** → `LedgersService.create` calls `PaymentMethodsService.addToLedger`, assigning all existing user PMs
- **PM created** → `PaymentMethodsService.create` calls `UsersService.findOneById` (which includes `ledgers[]`), then calls `addToLedger` for each — new cards/wallets are immediately available across all ledgers

`PaymentMethodsModule` imports `UsersModule` (which exports `UsersService`) to support this.

### Transactions (`/transactions`) — LedgerAccessGuard

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/ledgers/:ledgerId/expenses` | `CreateFixedExpenseDto` | `TransactionResponseDto` or `[]` | Ledger | Create expense (or a FIXED bundle → `[]`) |
| POST | `/ledgers/:ledgerId/incomes` | `CreateFixedIncomeDto` | `TransactionResponseDto` or `[]` | Ledger | Create income (or a FIXED bundle → `[]`) |
| GET | `/ledgers/:ledgerId` | `?skip&take&status&entryType&categoryId&groupId&paymentMethodId&paymentMonth&isPaid` | `TransactionResponseDto[]` | Ledger | List by ledger (filterable, default take=50) |
| GET | `/:id` | — | `TransactionResponseDto` | Ledger | Get by ID |
| PATCH | `/:id/flags` | `UpdateTransactionFlagsDto` | `TransactionResponseDto` | Ledger | Toggle isPaid / impactsCashflow |
| PATCH | `/:id` | `UpdateTransactionCoreDto` | `TransactionResponseDto` | Ledger | Full core update; recalculates inflation if amount or paymentMonth changes |
| DELETE | `/:id` | — | 204 | Ledger | Delete transaction |
| PATCH | `/:id/breakdown` | `AssignBreakDownDto` | `TransactionResponseDto` | Ledger | Assign W1-W4 |
| PATCH | `/:id/category/:targetId` | — | `TransactionResponseDto` | Ledger | Change category |
| PATCH | `/:id/group/:targetId` | — | `TransactionResponseDto` | Ledger | Change group |
| PATCH | `/:id/payment-method/:targetId` | — | `TransactionResponseDto` | Ledger | Change payment method |

**CreateTransactionDto** (expense):
```
{ categoryId, groupId, paymentMethodId, transactionDate, currency, totalProvidedAmount,
  paymentMonthValue?, installments?, comment?, exchangeRate?, weekNumber? (1-4),
  transactionTypeEntry? (FIXED|VARIABLE — maps to Transaction.transactionType; default VARIABLE),
  impactsCashflow?, debtAssignments?: DebtAssignmentDto[] }
```

**DebtAssignmentDto**: `{ debtOwnerId, amount, direction (OWED_TO_ME|OWED_BY_ME) }`

**CreateIncomeDto**: Same as expense but without `installments`, `weekNumber`, `debtAssignments`.

**CreateFixedExpenseDto / CreateFixedIncomeDto** — the real `@Body()` type of the two POST endpoints: `IntersectionType(CreateTransactionDto|CreateIncomeDto, FixedBundleDto)`. The controller passes the same object to the service twice (as the create DTO and as the bundle DTO).

**FixedBundleDto** (all fields optional; only read when `transactionTypeEntry === FIXED`):
```
{ bundleTo?   (YYYY-MM end period — currently END-EXCLUSIVE; DTO validates @IsDateString, parser wants YYYY-MM),
  increaseRate?        (fraction, 0.1 = +10% per step; default 0 → no escalation),
  increaseEveryMonths? (>= 1; default 1 → escalate every month) }
```

> **NestJS has no global `ValidationPipe`** (`main.ts` / no `APP_PIPE`), so none of the `class-validator` decorators run at runtime yet — DTO constraints are documentation + Swagger only.

**UpdateTransactionFlagsDto**: `{ isPaid?: boolean, impactsCashflow?: boolean }`

**UpdateTransactionCoreDto**: `{ comment?, totalProvidedAmount?, transactionDate?, paymentMonthValue?, categoryId?, groupId?, paymentMethodId? }`
- `paymentMonth` filter uses `YYYY-MM` → converted to date range `[startOfMonth, startOfNextMonth)` in service
- When `totalProvidedAmount` or `paymentMonthValue` change, `cpiIndex` and `realMonthlyAmount` are recalculated

**FilterTransactionsDto** (query params for `GET /ledgers/:id`):
`{ status?, entryType?, categoryId?, groupId?, paymentMethodId?, paymentMonth? (YYYY-MM), isPaid? (boolean string) }`

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

### Transactions Break Down (`/transactions-break-down`)

| Method | Route | Body | Response | Description |
|--------|-------|------|----------|-------------|
| PATCH | `/:id` | `UpdateTransactionBreakDownDto` | `TransactionBreakDownResponseDto` | Update single breakdown |

### Debt Owners (`/debt-owners`) — LedgerAccessGuard

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/ledgers/:ledgerId` | `CreateDebtOwnerDto` | `DebtOwnerResponseDto` | Ledger | Create |
| GET | `/ledgers/:ledgerId` | `?skip&take` | `DebtOwnerResponseDto[]` | Ledger | List by ledger |
| GET | `/:id` | — | `DebtOwnerResponseDto` | Ledger | Get by ID |
| GET | `/ledgers/:ledgerId/by-name/:name` | — | `DebtOwnerResponseDto` | Ledger | Find by name |
| PATCH | `/:id` | `UpdateDebtOwnerDto` | `DebtOwnerResponseDto` | Ledger | Update |
| DELETE | `/:id` | — | 204 | Ledger | Delete |

### Debts (`/debts`) — LedgerAccessGuard

| Method | Route | Body | Response | Guard | Description |
|--------|-------|------|----------|-------|-------------|
| GET | `/owner/:ownerId` | `?skip&take&orderBy` | `DebtResponseDto[]` | Ledger | List by owner |
| GET | `/:id` | — | `DebtResponseDto` | Ledger | Get by ID |
| PATCH | `/:id` | `UpdateDebtDto` | `DebtResponseDto` | Ledger | Update |
| DELETE | `/:id` | — | 204 | Ledger | Delete |

**DebtResponseDto**: `{ id, period, description }`

### Inflation Indexes (`/inflation-indexes`) — RolesGuard

| Method | Route | Body | Response | Roles | Description |
|--------|-------|------|----------|-------|-------------|
| POST | `/` | `CreateInflationIndexDto` | `InflationIndexResponseDto` | ADMIN | Create index |
| GET | `/` | `?currency&skip&take&startPeriod&endPeriod&orderBy` | `InflationIndexResponseDto[]` | Any | List by currency |
| GET | `/:id` | — | `InflationIndexResponseDto` | Any | Get by ID |
| PATCH | `/:id` | `UpdateInflationIndexDto` | `InflationIndexResponseDto` | ADMIN | Update |
| DELETE | `/:id` | — | 204 | ADMIN | Delete |

### Reports (`/reports`) — LedgerAccessGuard (ledgerId from route param)

All report endpoints accept `?from=YYYY-MM&to=YYYY-MM` query params.

| Method | Route | Response | Description |
|--------|-------|----------|-------------|
| GET | `/ledgers/:ledgerId/cashflow` | `CashflowReportDto` | Income + expense pivot by payment method → category → group per period |
| GET | `/ledgers/:ledgerId/debts` | `DebtReportDto` | Debt totals by owner + description per period |
| GET | `/ledgers/:ledgerId/category-evolution` | `CategoryEvolutionReportDto` | Nominal + real amounts + share per category per period |

**CategoryEvolutionReportDto**:
```
{
  meta: { periods: string[], from: string, to: string, currency: Currency }
  categories: [{ id, name, amounts: [{ period, nominalAmount, realAmount: number|null, share: 0-1 }] }]
  totalPerPeriod: [{ period, totalNominalAmount, totalRealAmount: number|null }]
}
```

Business rules for category evolution:
- Only `EXPENSE` transactions included (no income)
- `OWED_TO_ME` debt amounts subtracted from `monthlyAmount` before accumulation (effective cost)
- `realAmount` / `totalRealAmount` = `null` for a period if **any** transaction in that period lacks `cpiIndex`
- `share` = `nominalAmount / totalNominalAmount` for the period (0 if total is 0)
- Categories with zero transactions in the range still appear with empty amounts arrays

---

## Key Business Logic

### Transaction Creation (Expense)

The `createExpense` flow has four paths (checked in this order):

1. **Current-month merge** — If `transactionDate` is current month AND a matching transaction exists (same category + group + payment method + currency + entry type) AND payment method is NOT `CREDIT_CARD`: merges into existing transaction by updating the weekly breakdown amount and total. Debt assignments are still created independently.

2. **Installment flow** — If `installments > 1`: creates N separate transactions (one per installment), each with a `paymentMonth` incremented by one month. If `debtAssignments` provided, creates `TransactionDebtOwner` + `Debt` records for each assignment per installment.

3. **FIXED bundle** — If `transactionTypeEntry === FIXED` (requires `fixedBundleDto.bundleTo`, else 400): delegates to `createBundle`, which generates one standalone 1-of-1 transaction per month from `paymentMonth` **through `bundleTo` inclusive** (`monthRange()` in `helpers/dates.ts` — UTC month-floored; throws `BadRequestException` if `bundleTo < paymentMonth`). Per-month amount = `assignTotalAmount(bundleAmountForMonth(base, monthOffset, increaseRate, increaseEveryMonths), …)` where `bundleAmountForMonth` = `base * (1 + increaseRate) ** floor(monthOffset / max(increaseEveryMonths, 1))` (month 0 stays at `base`; `increaseRate` default 0, `increaseEveryMonths` default 1 → escalate every month), then FX-converted. All bundle rows are forced `impactsCashflow: false`. The whole bundle runs inside one `runInTransaction` (`{ timeout: 30_000 }`), sequential loop. `createIncome` has the same FIXED branch (no debt assignments). Checked AFTER paths 1–2, so a current-month FIXED can still merge, and FIXED + `installments > 1` goes to the installment path instead.

4. **Single transaction** — Default path. Creates one transaction with optional debt assignments.

All paths create 4 `TransactionBreakDown` rows (W1-W4, initialized to 0) per transaction, and every create path now runs inside a DB transaction — see **Write Atomicity** below.

> **`createBundle` remaining caveats** (the original correctness bugs — double debt insert, local-time date math, exclusive/empty range, missing FX, wrong `getInflationData` args, no transaction — are all fixed): the debt-branch response DTOs are built from the freshly-created row, not re-fetched, so bundle rows come back **without `debtOwners`** populated (breakdown rows are); `getInflationData` runs as a read *inside* the transaction loop (perf, not correctness — ideally pre-fetch the CPI range in one query); `FixedBundleDto.bundleTo` is validated `@IsDateString()` but parsed with `parsePeriod` (`YYYY-MM`) — the two disagree (moot until a global `ValidationPipe` exists).

### Write Atomicity

`TransactionsRepository.runInTransaction<T>(fn, options?)` wraps `prisma.$transaction(fn, options)` (interactive). Write methods on `TransactionsRepository` / `TransactionsBDRepository` take a trailing `client: Prisma.TransactionClient = this.prisma` — call with the `tx` from `runInTransaction` to enlist, omit for a standalone write. `TransactionsService.handleDebtOwners` / `createTransactionsBD` thread the same client and `handleDebtOwners` loops sequentially (no `Promise.all` on an interactive tx client). Every `createExpense` / `createIncome` create path is wrapped so a transaction + its W1–W4 breakdown (+ debt rows) commit together. **`handleInstallments` wraps each installment separately** → per-installment atomicity, not per-request (installment 4 failing leaves 1–3 committed). Reads (`getInflationData`) still go through the pooled client. `Prisma.TransactionClient` typing now appears in the service layer as a result.

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
- `cpiIndex` = the CPI value for the payment month
- `realMonthlyAmount` = `(monthlyAmount / cpiIndex) * baseCpiIndex` — inflation-adjusted to constant pesos at ledger creation time
- `baseCpiIndex` is stored on the `Ledger` at creation time (from the CPI of the current month, defaults to 100)

> **UTC rule (critical)**: All date construction and comparison must use UTC. CPI periods are stored as UTC midnight via `parsePeriod`. A local-time `new Date(year, month, 1)` on UTC-3 produces `T03:00:00.000Z`, which does not match `T00:00:00.000Z` — causing `getCpiIndex` to return `null`. The same applies to the comparison helpers in `dates.ts`: `checkCurrentMonth`, `isPastMonth`, `isFutureMonth`, and `increaseMonthByInstallment` all use `dayjs.utc()`. Never use `new Date(...)` with local year/month parts or bare `dayjs(date)` for anything touching DB-stored dates.

### Status Lifecycle

Transaction status is auto-determined from `paymentMonth` (not `transactionDate`):
- `CURRENT` — same month as today
- `CLOSED` — past month
- `FUTURE` — future month (projected installments)

This is intentional: an installment purchase made today but billed in June must be `FUTURE`, not `CURRENT`. Using `transactionDate` was a bug.

On `updateCore`, status is recalculated whenever `paymentMonthValue` or `transactionDate` is provided. Falls back to `transaction.paymentMonth` from DB when neither is provided — so a comment-only patch leaves status untouched.

### Date Parsing

Two date formats are used in the API:
- **`transactionDate`**: `YYYY-MM-DD` string → parsed via `parseDate()` into a UTC Date
- **`paymentMonthValue`**: `YYYY-MM` string → parsed via `parsePeriod()` into the first of the month (UTC)

When `paymentMonthValue` is omitted, it defaults to the `transactionDate` parsed as a Date. Both `createExpense` and `createIncome` parse string inputs into proper `Date` objects before passing to Prisma.

### Multi-Currency

Transactions can be in a different currency than the ledger. When `currency !== ledger.currency`, the `exchangeRate` is required and `totalAmount = totalProvidedAmount * exchangeRate`.

---

## Project Structure

```
src/
├── decorators/         # @GetUser, @LedgerFrom, @Public, @Roles
├── guards/             # AuthGuard, RolesGuard, LedgerAccessGuard
├── helpers/
│   ├── dates.ts        # parsePeriod (YYYY-MM), parseDate (YYYY-MM-DD), checkCurrentMonth, isPastMonth, isFutureMonth, increaseMonthByInstallment, monthRange (inclusive UTC month list, throws if end<start), getWeekofMonth
│   │                   # ALL comparison helpers use dayjs.utc() — never bare dayjs() — to avoid UTC-3 local-time mismatch against UTC-midnight DB dates
│   ├── errors.ts       # handleP2025, handleLedgerFromRequest
│   ├── reports.ts      # Pure report helpers — all use Map-based O(M) single-pass accumulation:
│   │                   #   Cashflow:           extractPeriodsFromTransactions, getPlannedEffectiveAmount,
│   │                   #                       getBalanceEffectiveAmount(tx, currentWeek), createCashflowPeriodAmount(periods, txs, currentWeek)
│   │                   #   Debt:               extractPeriodsFromOwners, extractDebtPeriodAmount(txs, periods)
│   │                   #   Category Evolution: extractPeriodsFromCategories(txs: TransactionByCategoryReport[])
│   │                   #                       extractCategoryTotalPeriodDto(txs, periods, baseCpiIndex) → CategoryTotalPeriodDto[]
│   │                   #                         subtracts OWED_TO_ME debt amounts; realAmount=null if any tx lacks cpiIndex
│   │                   #                       extractCategoryEvolutionPeriodAmount(txs, periods, totalPerPeriod, baseCpiIndex) → CategoryEvolutionPeriodDto[]
│   │                   #                         same debt/real logic; share = nominalAmount / periodTotal (0 if total is 0)
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
│   ├── reports/        # Analytical reports (cashflow, debt, category evolution)
│   │   ├── reports.controller.ts  # GET /reports/ledgers/:ledgerId/{cashflow,debts,category-evolution}
│   │   ├── reports.service.ts     # Orchestrates report assembly from repository data
│   │   │                          #   Cashflow:           currentWeek computed once, passed through call chain;
│   │   │                          #                       groups via Map<pm,Map<cat,Map<grp,[]>>> in one pass; no filter at any level
│   │   │                          #   getCategoryEvolution: flattens category.transactions for period extraction + totals;
│   │   │                          #                         loops per category → extractCategoryEvolutionPeriodAmount;
│   │   │                          #                         returns CategoryEvolutionReportDto { meta, categories[], totalPerPeriod[] }
│   │   ├── reports.repository.ts  # Injects PrismaService directly; optimised select queries
│   │   │                          #   getCashflowData:          paymentMonth filter, select only needed fields
│   │   │                          #   getDebtData:              queries debtOwner, filters transactions by debt.period
│   │   │                          #   getCategoryEvolutionData: parallel — ledger(currency+baseCpiIndex) + category.findMany;
│   │   │                          #                             category pre-groups txs; filter: paymentMonth range + EXPENSE only;
│   │   │                          #                             debtOwners filter: OWED_TO_ME + period range; returns {categories, currency, baseCpiIndex}
│   │   └── dto/
│   │       ├── cashflow-report.dto.ts              # Root + cashflow/ subfolder (meta, entry-type, payment-method, category, group, period-amount)
│   │       ├── debt-report.dto.ts                  # Root + debt/ subfolder (meta, owner, detail, period-amount)
│   │       └── category-evolution-report.dto.ts    # Root DTO: { meta: CategoryEvolutionMetaDto, categories: CategoryEvolutionRowDto[], totalPerPeriod: CategoryTotalPeriodDto[] }
│   │           # category-evolution/ subfolder:
│   │           #   category-evolution-meta.dto.ts     { periods: string[], from, to, currency }
│   │           #   category-evolution-row.dto.ts      { id, name, amounts: CategoryEvolutionPeriodDto[] }
│   │           #   category-evolution-period.dto.ts   { period, nominalAmount, realAmount (null if no CPI data), share (0-1) }
│   │           #   category-total-period.dto.ts       { period, totalNominalAmount, totalRealAmount (null if no CPI data) }
│   ├── shared/         # Global module: ConfigModule, JwtModule
│   ├── transactions/   # Complex CRUD with installments, merging, debt assignments
│   │   ├── dto/
│   │   │   ├── create-transaction.dto.ts        # expense creation (+ transactionTypeEntry?)
│   │   │   ├── create-income.dto.ts             # income creation (+ transactionTypeEntry?)
│   │   │   ├── bundle-dtos/                      # FIXED recurring-transaction ("bundle") DTOs
│   │   │   │   ├── fixed-bundle.dto.ts          # bundleTo?, increaseRate?, increaseEveryMonths? (all optional)
│   │   │   │   ├── create-fixed-expense.dto.ts  # IntersectionType(CreateTransactionDto, FixedBundleDto) — @Body() of POST expenses
│   │   │   │   └── create-fixed-income.dto.ts   # IntersectionType(CreateIncomeDto, FixedBundleDto) — @Body() of POST incomes
│   │   │   ├── filter-transactions.dto.ts        # GET query params: status, entryType, categoryId, groupId, paymentMethodId, paymentMonth, isPaid
│   │   │   ├── update-transaction-flags.dto.ts   # PATCH :id/flags — isPaid?, impactsCashflow?
│   │   │   └── update-transaction-core.dto.ts    # PATCH :id — comment?, totalProvidedAmount?, transactionDate?, paymentMonthValue?, relations
│   │   ├── transactions.controller.ts           # all endpoints including new flags/core/delete
│   │   ├── transactions.service.ts              # createExpense/createIncome (4 paths incl. FIXED bundle), createBundle, bundleAmountForMonth, findAllByLedgerId, updateFlags, updateCore, deleteTransaction
│   │   └── transactions.repository.ts           # create/createTransactionDebtOwner take optional client=this.prisma; runInTransaction(fn, options?) wraps prisma.$transaction
│   ├── transactions-break-down/ # Weekly breakdown update; repo create/createBundle take optional client=this.prisma
│   └── users/          # CRUD with soft-delete
├── prisma/             # PrismaService, PrismaModule (global)
├── seed/               # Database seeders (users, ledgers, categories, groups, payment-methods, debt-owners, inflation-indexes)
├── types/
│   ├── entities/       # Prisma typed includes:
│   │                   #   transaction.types.ts: TransactionDetailView, TransactionBreakDownsAndGroups, TransactionReport,
│   │                   #                         TransactionCategoryReport (select: paymentMonth, monthlyAmount, cpiIndex, debtOwners{amount}),
│   │                   #                         TransactionByCategoryReport (Prisma.TransactionGetPayload<typeof TransactionCategoryReport.detail>)
│   │                   #   debt.types.ts: DebtOwnersReport (DebtOwner with nested TransactionDebtOwner + Debt)
│   │                   #   transaction-debt-owner.ts: TransactionDebtOwnerWithBasicDebt
│   └── payload/        # JwtPayload interface
└── app.module.ts       # Root module, APP_GUARD registration (AuthGuard → LedgerAccessGuard)
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
