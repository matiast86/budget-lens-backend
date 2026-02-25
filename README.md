# BudgetLens

> Personal expense tracking API designed for the Argentine economic context.

## Overview

BudgetLens is a backend API that replicates and extends an Excel-based personal finance tracker. It handles the complexities of budgeting in high-inflation economies: installment-based credit card purchases, CPI-adjusted real amounts, multi-currency tracking, and inter-family debt ledgers.

The system is structured around **ledgers** — each ledger is an independent budget book with its own categories, groups, payment methods, and transactions. Ledgers support collaboration, allowing multiple users to share access.

## Tech Stack

| Layer              | Technology                                     |
|--------------------|------------------------------------------------|
| Runtime            | Node.js + TypeScript                           |
| Framework          | NestJS 11                                      |
| ORM                | Prisma 7 with PostgreSQL adapter (`@prisma/adapter-pg`) |
| Database           | PostgreSQL                                     |
| Authentication     | JWT (`@nestjs/jwt` + `bcrypt`)                 |
| Validation         | `class-validator` + `class-transformer`        |
| API Documentation  | Swagger (`@nestjs/swagger`)                    |
| Date Handling      | Day.js (UTC mode)                              |

## Features

- **Inflation-adjusted tracking** — Transactions store both nominal and real (CPI-adjusted) amounts using a base index captured at ledger creation
- **Installment support** — Credit card purchases split into N monthly installments, each with its own payment month and status
- **Current-month merge** — Non-credit-card expenses in the same month with matching category/group/payment method are merged into a single transaction with weekly breakdown updates
- **Multi-currency** — Transactions can differ from ledger currency; exchange rate is enforced and applied automatically
- **Weekly cashflow breakdown** — Each transaction has W1–W4 slots for intra-month distribution
- **Inter-person debt ledger** — Transactions can be split across multiple debt owners with per-person amounts and direction (owed to me / owed by me)
- **Status lifecycle** — Transactions are automatically classified as `CURRENT`, `CLOSED`, or `FUTURE` based on their date
- **Collaboration** — Ledgers can be shared with other users via collaborations, with ownership-based access control

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm

### Installation

```bash
git clone https://github.com/matiast86/budget-lens.git
cd budget-lens
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/budgetlens
JWT_SECRET=your_jwt_secret
PORT=3000
```

### Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### Seed Data (optional)

```bash
npx tsx src/seed/index.ts
```

Seeds a default user, ledger with category templates, payment methods, groups, debt owners, and inflation indexes.

### Run

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

### API Documentation

Once running, Swagger UI is available at:

```
http://localhost:3000/api
```

## Project Structure

```
src/
├── decorators/              @GetUser, @LedgerFrom, @Public, @Roles
├── guards/                  AuthGuard (global), LedgerAccessGuard (global), RolesGuard
├── helpers/
│   ├── dates.ts             Date parsing and period utilities
│   ├── errors.ts            Prisma error handlers
│   └── mappers/             Entity-to-DTO mappers
├── modules/
│   ├── auth/                Sign up / sign in
│   ├── categories/          Ledger-scoped CRUD
│   ├── category-templates/  Seeded global templates (admin)
│   ├── collaborations/      Ledger sharing
│   ├── debt-owners/         Ledger-scoped CRUD
│   ├── debts/               Read/update/delete (created via transactions)
│   ├── groups/              Ledger-scoped CRUD
│   ├── inflation-indexes/   CPI data management (admin)
│   ├── ledgers/             Core budget books
│   ├── payment-methods/     User-scoped CRUD
│   ├── shared/              ConfigModule, JwtModule
│   ├── transactions/        Expenses, incomes, installments, merging
│   ├── transactions-break-down/  Weekly W1–W4 amounts
│   └── users/               User CRUD with soft-delete
├── prisma/                  PrismaService, PrismaModule
├── seed/                    Database seeders
├── types/                   Prisma typed includes, JWT payload
└── app.module.ts            Root module with global guard registration
```

## Authentication

All endpoints require a Bearer token unless marked as public. Auth flow:

1. `POST /auth/signup` — Register with email and password
2. `POST /auth/signin` — Returns a JWT token
3. Include `Authorization: Bearer <token>` on subsequent requests

Guards are applied globally in order: **AuthGuard** (JWT validation) then **LedgerAccessGuard** (ownership/collaboration check). Public routes (`/auth`, `/users`) use the `@Public()` decorator to skip authentication.

## API Endpoints

| Module              | Base Route                | Key Operations                              |
|---------------------|---------------------------|---------------------------------------------|
| Auth                | `/auth`                   | Sign up, sign in                            |
| Users               | `/users`                  | CRUD (public)                               |
| Ledgers             | `/ledgers`                | CRUD, full detail view                      |
| Collaborations      | `/collaborations`         | Invite, list, deactivate, reactivate        |
| Categories          | `/categories`             | CRUD, search by name                        |
| Groups              | `/groups`                 | CRUD, search by name                        |
| Payment Methods     | `/payment-methods`        | CRUD, filter by type/name                   |
| Transactions        | `/transactions`           | Create expense/income, breakdown, relations |
| Transactions BD     | `/transactions-break-down`| Update weekly amounts                       |
| Debt Owners         | `/debt-owners`            | CRUD, search by name                        |
| Debts               | `/debts`                  | Read, update, delete                        |
| Inflation Indexes   | `/inflation-indexes`      | CRUD (admin), query by currency/period      |

Full endpoint documentation is available via Swagger at `/api`.

## Author

**Matias Tailler** — Full Stack Developer
[LinkedIn](https://linkedin.com/in/matiastailler) · [GitHub](https://github.com/matiast86)
