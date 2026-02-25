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

## Phase 9 -- Reporting, Calculations & Query Endpoints (Planned)

**Goal:** Complete the core functionality by replicating the Excel pivot tables and analytical views. This includes filtered queries, aggregated calculations, and response DTOs designed for frontend graphs and dashboards.

### Transaction Filtering & Queries
- [ ] Advanced transaction filtering (by status, entry type, category, group, payment method, date range, currency)
- [ ] Period-scoped queries (`?from=YYYY-MM&to=YYYY-MM`) for all report endpoints
- [ ] Pagination improvements (cursor-based for large datasets)

### Cashflow Reports (replicates Excel "CASHFLOW" sheet)
- [ ] Monthly cashflow summary -- income vs expense totals by period
- [ ] Cashflow by payment method -- monthly breakdown per payment method
- [ ] Weekly cashflow distribution -- W1-W4 aggregated amounts per period

### Category & Group Analytics (replicates Excel "Evolucion Gastos" sheet)
- [ ] Category evolution report -- nominal + real amounts per category per month
- [ ] Category share report -- percentage of total per category per period
- [ ] Group-level aggregation -- totals by group with category drill-down

### Debt Reports (replicates Excel "TD Deudas" sheet)
- [ ] Debt summary by owner -- total owed to me, total owed by me, net balance
- [ ] Debt timeline by owner -- monthly debt amounts with paid/unpaid filter
- [ ] Ledger-wide debt overview -- all owners aggregated

### Ledger Dashboard Calculations
- [ ] Ledger monthly totals -- aggregate income, expenses, and net per period
- [ ] Ledger summary stats -- total balance, current month snapshot, projected future expenses
- [ ] Inflation impact report -- nominal vs real totals over time, purchasing power delta

### Response DTOs for Graphs
- [ ] Define chart-ready DTOs (time-series, pie/donut, stacked bar data shapes)
- [ ] Consistent response format with `labels[]`, `datasets[]`, and `summary` fields
- [ ] Swagger documentation for all report endpoints

---

## Phase 10 -- Testing (Planned)

**Goal:** Comprehensive test coverage to protect core functionality before adding third-party integrations.

### Unit Tests
- [ ] Transaction service (merge, installment, single creation paths)
- [ ] Date parsing helpers (`parseDate`, `parsePeriod`, `checkCurrentMonth`)
- [ ] Inflation calculation logic (CPI lookup, real amount formula)
- [ ] Entity-to-DTO mappers
- [ ] Report calculation services

### Integration Tests
- [ ] Auth flow (signup, signin, JWT validation, invalid credentials)
- [ ] LedgerAccessGuard (owner access, collaborator access, unauthorized rejection)
- [ ] Role-based access (admin-only endpoints, user rejection)

### E2E Tests
- [ ] Expense creation (all three paths: merge, installment, single)
- [ ] Income creation
- [ ] Debt assignment flow (single and multi-person splits)
- [ ] Report endpoints (cashflow, category evolution, debt summary)

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

## Phase 12 -- Auth0 Integration (Planned)

**Goal:** Upgrade authentication from local JWT to Auth0 for third-party identity management.

- [ ] Register Auth0 application and configure tenant
- [ ] Install `passport`, `@nestjs/passport`, and `passport-jwt` with Auth0 JWKS strategy
- [ ] Update `AuthGuard` to validate Auth0-issued JWTs (RS256, JWKS endpoint)
- [ ] Map Auth0 user profiles to local `User` model (auto-create on first login)
- [ ] Preserve existing `@Public()`, `@Roles()`, `@GetUser()` decorator behavior
- [ ] Update `AuthService` sign-in/sign-up to delegate to Auth0 (or remove in favor of Auth0 hosted flows)
- [ ] Configure Auth0 roles/permissions to map to existing `ADMIN`/`USER` roles
- [ ] Update environment variables (`AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_CLIENT_ID`)
- [ ] Migration path: support both local JWT and Auth0 JWT during transition (optional)

---

## Phase 13 -- Subscriptions & Payments (Planned)

**Goal:** Introduce membership tiers and payment processing for premium features.

### Data Model
- [ ] `Membership` model (FREE, PREMIUM, etc.) with feature flags and limits
- [ ] `Subscription` model (userId, membershipId, status, startDate, endDate, paymentProvider)
- [ ] `PaymentRecord` model (subscriptionId, amount, currency, providerTransactionId, status)

### Payment Integration
- [ ] Integrate Mercado Pago for ARS payments (primary for Argentine users)
- [ ] Integrate Stripe for USD/international payments (secondary)
- [ ] Webhook handlers for payment confirmation, failure, and cancellation
- [ ] Subscription lifecycle management (activate, renew, cancel, expire)

### Access Control
- [ ] `SubscriptionGuard` to enforce tier-based feature access
- [ ] Define free vs premium feature boundaries (e.g., ledger count, report access, collaboration slots)
- [ ] Graceful degradation when subscription expires (read-only access to existing data)

---

## Phase 14 -- Cloud File Storage (Planned)

**Goal:** File upload and storage for user content and generated exports.

### User Uploads (Cloudinary)
- [ ] Integrate Cloudinary SDK for image uploads
- [ ] Receipt/invoice photo attachment per transaction (optional field)
- [ ] User profile photo upload
- [ ] Image optimization and transformation via Cloudinary pipelines

### Generated Exports (S3 or compatible)
- [ ] CSV export for filtered transaction lists
- [ ] PDF report generation for cashflow summaries and category breakdowns
- [ ] Cloud storage for generated files (AWS S3, MinIO, or Cloudinary raw files)
- [ ] Signed download URLs with expiration for secure file access

---

## Phase 15 -- Deployment & CI/CD (Planned)

**Goal:** Production-ready deployment with automated pipelines.

- [ ] Deploy backend to Render / Railway (NestJS + PostgreSQL)
- [ ] Configure production environment variables
- [ ] Run Prisma migrations automatically on deploy
- [ ] GitHub Actions CI pipeline (lint, type-check, test)
- [ ] Automated deployment on merge to main

---

## Future Enhancements (Post-MVP)

- [ ] Frontend application (React/Next.js) consuming the API
- [ ] Scheduled jobs for automatic status transitions (FUTURE to CURRENT to CLOSED)
- [ ] Notification system for upcoming installment payments
- [ ] Multi-language support (English / Spanish)
- [ ] Audit log for transaction modifications
- [ ] Budget targets per category with variance tracking
