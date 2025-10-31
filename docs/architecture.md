
# 🏗️ BudgetLens – System Architecture

> **Stack:**  
> Backend → NestJS + Prisma + PostgreSQL  
> Frontend → React (Vite) + TailwindCSS  
> Deployment → Backend on Render / Railway, Frontend on Vercel / Netlify

---

## ⚙️ 1. Overview

**BudgetLens** is a full-stack web application designed to help users **plan**, **analyze**, and **project** their personal finances ahead, adjusting for inflation and real purchasing power.  

The system consists of two independent services:
- A **Backend REST API** (`budgetlens-backend`)
- A **Frontend PWA** (`budgetlens-frontend`)

They communicate via HTTPS, using JSON for all API responses.

---

## 🧩 2. System Diagram

```

┌──────────────────────────┐         ┌──────────────────────────┐
│      Frontend (React)    │         │     Backend (NestJS)     │
│--------------------------│         │--------------------------│
│ - Vite + Tailwind        │  HTTPS  │ - Controllers (REST API) │
│ - React Router            │ <──────>│ - Services (business)   │
│ - Axios API client        │         │ - Prisma ORM (DB access) │
│ - PWA support             │         │ - PostgreSQL database    │
└──────────────────────────┘         └──────────────────────────┘
│
│ Prisma ORM
▼
┌───────────────────────┐
│    PostgreSQL DB      │
│ (Users, Expenses, etc.) │
└───────────────────────┘

```

---

## 🧠 3. Backend Architecture (NestJS)

### 📁 Folder Structure

```

src/
├── main.ts                 # Entry point
├── app.module.ts           # Root module
├── prisma/
│    ├── prisma.module.ts   # Exposes Prisma client
│    └── prisma.service.ts  # Handles DB access
├── users/                  # User module
├── expenses/               # Expense module
├── contracts/              # Contract module
├── projections/            # Inflation & projections logic
├── reports/                # Aggregated summaries
└── common/                 # DTOs, pipes, guards, utils

````

### 🧱 Core Modules

| Module | Responsibility |
|---------|----------------|
| **UsersModule** | Manage user profiles, authentication, ownership of expenses. |
| **ExpensesModule** | CRUD operations for expenses (description, category, amount, date). |
| **ContractsModule** | Handle recurring or installment-based expenses (e.g., rent, credit). |
| **ProjectionsModule** | Calculate future expenses based on inflation or custom rate. |
| **ReportsModule** | Summarize data: monthly totals, categories, trends. |
| **CommonModule** | Shared DTOs, exception filters, validation, and guards. |

### 🧮 Database (Prisma + PostgreSQL)

**Example schema:**
```prisma
model User {
  id        Int       @id @default(autoincrement())
  email     String    @unique
  password  String
  name      String
  expenses  Expense[]
}

model Expense {
  id          Int      @id @default(autoincrement())
  description String
  amount      Decimal  @db.Decimal(12, 2)
  category    String
  date        DateTime
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
}
````

Prisma handles schema migrations (`npx prisma migrate dev`) and generates a fully type-safe client.

---

## 🎨 4. Frontend Architecture (React + Vite + Tailwind)

### 📁 Folder Structure

```
src/
 ├── main.jsx
 ├── App.jsx
 ├── pages/
 │    ├── Dashboard.jsx
 │    ├── Expenses.jsx
 │    ├── Projections.jsx
 │    └── Contracts.jsx
 ├── components/
 │    ├── ExpenseForm.jsx
 │    ├── ExpenseTable.jsx
 │    ├── ChartCard.jsx
 │    └── Navbar.jsx
 ├── services/
 │    └── api.js             # Axios client for backend
 ├── context/
 │    ├── AuthContext.jsx
 │    └── ExpensesContext.jsx
 ├── hooks/
 │    └── useFetch.js
 ├── utils/
 │    └── formatters.js
 ├── styles/
 │    └── globals.css
```

### 🧭 Frontend Flow

1. User interacts with React UI.
2. Components send requests through `api.js`:

   ```js
   axios.get(`${import.meta.env.VITE_API_URL}/expenses`);
   ```
3. Backend responds with JSON data.
4. React updates UI (tables, charts, forms).
5. Tailwind handles responsive design and theme.

---

## 🔄 5. Data Flow Summary

| Step | Action                      | Component                                 |
| ---- | --------------------------- | ----------------------------------------- |
| 1️⃣  | User submits an expense     | Frontend form → `/api/expenses`           |
| 2️⃣  | NestJS validates and stores | `ExpensesController` + `ExpensesService`  |
| 3️⃣  | Prisma writes to DB         | PostgreSQL                                |
| 4️⃣  | User requests projections   | `GET /api/projections?months=6&rate=0.05` |
| 5️⃣  | Backend calculates values   | `ProjectionService`                       |
| 6️⃣  | React displays chart        | via Recharts or Chart.js                  |

---

## 🧱 6. Communication Pattern

* **REST API**

  * Simpler and faster for MVP.
  * Endpoints prefixed with `/api`:

    ```
    GET /api/expenses
    POST /api/expenses
    GET /api/projections
    ```
* **Auth**

  * Phase 1: Local JWT.
  * Phase 2: Optionally switch to Auth0 for hosted login.

---

## ☁️ 7. Deployment Overview

| Component    | Platform                            | Notes                                       |
| ------------ | ----------------------------------- | ------------------------------------------- |
| **Backend**  | Render / Railway                    | Auto-deploy from `budgetlens-backend` repo  |
| **Database** | Render PostgreSQL / Supabase / Neon | Persistent managed DB                       |
| **Frontend** | Vercel / Netlify                    | Auto-deploy from `budgetlens-frontend` repo |
| **Domain**   | `budgetlens.app` (future)           | Connect both frontend + backend subdomains  |

---

## 🔐 8. Environment Variables

| Variable       | Used In  | Description                  |
| -------------- | -------- | ---------------------------- |
| `DATABASE_URL` | backend  | PostgreSQL connection string |
| `PORT`         | backend  | API port (default: 3000)     |
| `JWT_SECRET`   | backend  | For signing JWT tokens       |
| `VITE_API_URL` | frontend | Base URL of backend API      |
| `NODE_ENV`     | both     | `development` / `production` |

---

## 🚀 9. Future Scalability

* Add **GraphQL** layer if analytics become complex.
* Add **Redis caching** for projections or reports.
* Add **microservices** later (notifications, email reports).
* Integrate **worker queues** for scheduled projections (BullMQ).

---

## 🧱 10. Summary

**BudgetLens** combines a modular NestJS backend with a modern React frontend, allowing users to:

* Track and plan expenses.
* Simulate inflation impact over time.
* Visualize data through responsive dashboards.
* Eventually manage recurring contracts and real purchasing power.

The architecture ensures:

* Clear separation of concerns (API vs UI).
* Type safety (TypeScript end-to-end).
* Scalable deployment (containerized via Docker).
* Easy developer experience (simple local setup via Docker Compose).

---

```

