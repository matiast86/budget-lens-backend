# BudgetLens -- Roadmap

> **Goal:** Backend REST API for personal expense tracking in the Argentine economic context, replicating and extending an Excel-based finance tracker.

---

## Phase 1 -- Project Foundation (Completed)

**Goal:** Establish the technical foundation and core infrastructure.

- [x] Initialize NestJS 11 project with TypeScript
- [x] Integrate Prisma 7 with PostgreSQL (`@prisma/adapter-pg`)
- [x] Configure global validation pipes (`class-validator` + `class-transformer`)
- [x] Set up Swagger API documentation (`@nestjs/swagger`)
- [x] Create base modules (`AppModule`, `PrismaModule`, `SharedModule`)
- [x] Configure environment variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`)

---

## Phase 2 -- Authentication & User Management (Completed)

**Goal:** Secure multi-user access with JWT-based authentication.

- [x] Implement User model with UUID primary key, soft-delete support
- [x] User CRUD endpoints (`/users`) with `class-validator` DTOs
- [x] Password hashing with `bcrypt`
- [x] JWT authentication (`@nestjs/jwt`) -- sign up and sign in
- [x] Global `AuthGuard` registered as `APP_GUARD` with `@Public()` opt-out
- [x] Role-based access control (`ADMIN`/`USER`) with `RolesGuard`
- [x] Custom decorators: `@GetUser()`, `@Public()`, `@Roles()`

---

## Phase 3 -- Ledger System & Collaboration (Completed)

**Goal:** Core budget book structure with multi-user sharing.

- [x] Ledger model with currency, base CPI index, and owner relationship
- [x] Ledger CRUD endpoints with dashboard and detail response DTOs
- [x] Global `LedgerAccessGuard` -- ownership and collaboration verification
- [x] `@LedgerFrom()` decorator for resolving ledger from entity lookups
- [x] Collaboration model -- invite users to shared ledger access
- [x] Collaboration CRUD with soft-delete and reactivation

---

## Phase 4 -- Categories, Groups & Payment Methods (Completed)

**Goal:** Organization entities for multi-dimensional transaction categorization.

- [x] Category model (ledger-scoped) with CRUD and search-by-name
- [x] CategoryTemplate model (admin-managed, global scope) for seeding new ledgers
- [x] Auto-seed categories from templates on ledger creation
- [x] Group model (ledger-scoped) with CRUD and search-by-name
- [x] PaymentMethod model (user-scoped) with type, brand, currency, color, icon
- [x] M:N relationship between Ledger and PaymentMethod via `LedgerPaymentMethod`
- [x] Filter payment methods by type and name

---

## Phase 5 -- Transaction Engine (Completed)

**Goal:** Full expense and income tracking with Argentine economic context features.

- [x] Transaction model with status lifecycle (CURRENT/CLOSED/FUTURE)
- [x] Expense creation with three automatic paths:
  - [x] Current-month merge (non-credit-card, matching category/group/payment method)
  - [x] Installment flow (N transactions with incremented payment months)
  - [x] Single transaction (default)
- [x] Income creation with currency and inflation handling
- [x] Weekly cashflow breakdown (W1-W4) per transaction
- [x] Breakdown assignment endpoint for updating weekly amounts
- [x] Relation change endpoints (category, group, payment method)
- [x] Multi-currency support with exchange rate conversion
- [x] Inflation adjustment via CPI index lookup (`realMonthlyAmount` calculation)
- [x] Date parsing: `YYYY-MM-DD` for transaction dates, `YYYY-MM` for payment months

---

## Phase 6 -- Debt Tracking (Completed)

**Goal:** Inter-person debt ledger for shared expenses.

- [x] DebtOwner model (ledger-scoped) with CRUD and search-by-name
- [x] Debt model with period and description
- [x] TransactionDebtOwner pivot with amount, direction (OWED_TO_ME/OWED_BY_ME)
- [x] Atomic debt creation during transaction creation (nested Prisma create)
- [x] Multi-person debt splits per transaction
- [x] Debt duplication per installment in installment flow
- [x] Debt CRUD endpoints (read, update, delete)

---

## Phase 7 -- Inflation Indexes (Completed)

**Goal:** CPI data management for inflation-adjusted tracking.

- [x] InflationIndex model with currency, period, monthly rate, CPI index
- [x] Admin-only CRUD endpoints (via `RolesGuard`)
- [x] Query filtering by currency, period range, and sort order
- [x] Integration with transaction creation for automatic real-amount calculation
- [x] Base CPI index stored on ledger at creation time

---

## Phase 8 -- Database Seeders (Completed)

**Goal:** Reproducible development data for testing.

- [x] User seeder (default user with known credentials)
- [x] Ledger seeder with category auto-seeding from templates
- [x] Group seeder (Hogar, Transporte, Salud, Entretenimiento, Educacion)
- [x] Payment method seeder
- [x] Debt owner seeder
- [x] Inflation index seeder
- [x] Unified seed runner (`npx tsx src/seed/index.ts`)

---

## Phase 9 -- Testing (Planned)

**Goal:** Comprehensive test coverage for business logic and API endpoints.

- [ ] Unit tests for transaction service (merge, installment, single creation)
- [ ] Unit tests for date parsing helpers (`parseDate`, `parsePeriod`, `checkCurrentMonth`)
- [ ] Unit tests for inflation calculation logic
- [ ] Unit tests for entity-to-DTO mappers
- [ ] Integration tests for auth flow (signup, signin, JWT validation)
- [ ] Integration tests for ledger access guard (owner, collaborator, unauthorized)
- [ ] E2E tests for expense creation (all three paths)
- [ ] E2E tests for income creation
- [ ] E2E tests for debt assignment flow

---

## Phase 10 -- Query & Reporting Endpoints (Planned)

**Goal:** Analytical endpoints that replicate the Excel pivot tables and summaries.

- [ ] Monthly cashflow summary (income vs expense by payment method)
- [ ] Category evolution report (nominal + real amounts, % of total, by month)
- [ ] Transaction filtering (by status, entry type, category, group, payment method, date range)
- [ ] Debt summary by owner (total owed to me, total owed by me, net balance)
- [ ] Ledger monthly totals (aggregate expenses and incomes per period)
- [ ] Pagination improvements (cursor-based for large datasets)

---

## Phase 11 -- Transaction Management Enhancements (Planned)

**Goal:** Complete CRUD operations and batch workflows.

- [ ] Transaction update endpoint (edit amount, comment, date)
- [ ] Transaction delete endpoint (cascade to breakdowns and debt records)
- [ ] Bulk transaction creation (batch import from external sources)
- [ ] Transaction duplication (copy to next month for recurring non-installment expenses)
- [ ] Mark transactions as paid/unpaid
- [ ] Recalculate inflation when CPI data is updated retroactively

---

## Phase 12 -- Deployment & CI/CD (Planned)

**Goal:** Production-ready deployment with automated pipelines.

- [ ] Deploy backend to Render / Railway (NestJS + PostgreSQL)
- [ ] Configure production environment variables
- [ ] Run Prisma migrations automatically on deploy
- [ ] GitHub Actions CI pipeline (lint, type-check, test)
- [ ] Automated deployment on merge to main

---

## Future Enhancements (Post-MVP)

- [ ] Frontend application (React/Next.js) consuming the API
- [ ] Export reports (CSV/PDF) for transactions and summaries
- [ ] Scheduled jobs for automatic status transitions (FUTURE to CURRENT to CLOSED)
- [ ] Notification system for upcoming installment payments
- [ ] Multi-language support (English / Spanish)
- [ ] Audit log for transaction modifications
- [ ] Budget targets per category with variance tracking
