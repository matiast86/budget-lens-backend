# 🧭 BudgetLens – MVP Roadmap

> **Goal:** Build a finance app that helps users plan and project expenses ahead, adjusting for inflation and real purchasing power.

---

## ⚙️ Phase 1 – Project Foundation & Setup
**🎯 Goal:** Establish a solid technical foundation for both backend and frontend.

### 🔧 Backend
- [ ] Initialize NestJS project (`budgetlens-backend`)
- [ ] Integrate Prisma with PostgreSQL
- [ ] Configure `.env`, Dockerfile, and Docker Compose
- [ ] Create base modules (`AppModule`, `PrismaModule`)
- [ ] Add global exception filters and validation pipes
- [ ] Add Swagger for API documentation

### 🎨 Frontend
- [ ] Initialize Vite + React project (`budgetlens-frontend`)
- [ ] Configure TailwindCSS
- [ ] Set up basic routing (`react-router-dom`)
- [ ] Add `.env` with `VITE_API_URL`
- [ ] Create base layout (navbar, container, footer placeholders)

✅ **Deliverable:**  
Both servers run locally and display basic hello-world messages.

---

## 💵 Phase 2 – Core Entities & CRUD
**🎯 Goal:** Create and manage basic user and expense data.

### 🔧 Backend
- [ ] Create `User` and `Expense` models in Prisma
  - `User`: id, email, password, name
  - `Expense`: id, description, category, amount, date, userId
- [ ] Implement CRUD for `expenses` module
- [ ] Establish 1→many relation between `User` and `Expense`
- [ ] Seed database with sample data
- [ ] Expose endpoints:  
  - `GET /expenses`  
  - `POST /expenses`  
  - `PATCH /expenses/:id`  
  - `DELETE /expenses/:id`

### 🎨 Frontend
- [ ] Create Expense List page (table view)
- [ ] Create “Add Expense” form
- [ ] Connect to API using Axios
- [ ] Display and update expenses dynamically
- [ ] Apply Tailwind for basic styling

✅ **Deliverable:**  
Users can view, add, edit, and delete expenses.

---

## 📈 Phase 3 – Projections & Inflation
**🎯 Goal:** Introduce core BudgetLens feature — expense projections.

### 🔧 Backend
- [ ] Add `ProjectionService`
  - Calculate inflation-adjusted expense projections
  - Support parameters: months, inflationRate
- [ ] Create endpoint:  
  `GET /projections?months=6&inflationRate=0.05`

### 🎨 Frontend
- [ ] Create “Projections” page
- [ ] Form inputs for months and inflation rate
- [ ] Display charts (Recharts or Chart.js)
  - X-axis: months  
  - Y-axis: projected total expense
- [ ] Display both **nominal** and **real** values

✅ **Deliverable:**  
Users can simulate future spending adjusted for inflation.

---

## 💳 Phase 4 – Contracts & Installments
**🎯 Goal:** Model recurring or installment-based expenses.

### 🔧 Backend
- [ ] Add `Contract` model:
  - `id`, `name`, `type`, `startDate`, `endDate`, `frequency`
  - `amount`, `adjustmentRate`
- [ ] Link expenses to contracts
- [ ] Generate projections based on contract type

### 🎨 Frontend
- [ ] Add “Contracts” page (list + create form)
- [ ] Integrate with projections view
- [ ] Display recurring payments visually

✅ **Deliverable:**  
App can plan and visualize recurring payments (e.g., rent, subscriptions).

---

## 📊 Phase 5 – Dashboard & Reports
**🎯 Goal:** Provide data insights and visual clarity.

### 🔧 Backend
- [ ] Add `ReportsService` for:
  - Monthly summaries (planned vs actual)
  - Annual totals
  - Category breakdowns

### 🎨 Frontend
- [ ] Create Dashboard page:
  - Summary cards (total expenses, projections, differences)
  - Line chart (monthly trend)
  - Pie chart (category distribution)
- [ ] Show “real value vs nominal value” comparison

✅ **Deliverable:**  
Users can visualize their finances clearly and compare trends.

---

## 🔐 Phase 6 – Authentication & User Management
**🎯 Goal:** Add multi-user support and secure data access.

- [ ] Implement Auth0 or NestJS JWT-based authentication
- [ ] Secure routes and endpoints
- [ ] Restrict data by user (each user sees only their data)
- [ ] Add login/register flows in frontend

✅ **Deliverable:**  
Secure multi-user access with personal expense tracking.

---

## 🚀 Phase 7 – Deployment & CI/CD
**🎯 Goal:** Make BudgetLens available online.

### 🧰 Backend
- [ ] Deploy to Render / Railway (NestJS + PostgreSQL)
- [ ] Set environment variables for production
- [ ] Run migrations automatically on deploy

### 🎨 Frontend
- [ ] Deploy to Vercel / Netlify
- [ ] Set `VITE_API_URL` to production API
- [ ] Test live integration

### 🔄 CI/CD
- [ ] Set up GitHub Actions (optional)
  - Linting, testing, and deploy pipeline

✅ **Final Deliverable:**  
**BudgetLens MVP is live** – users can add expenses, simulate inflation-adjusted projections, and visualize data through an installable PWA.

---

## 🧱 Future Enhancements (Post-MVP Ideas)
- [ ] Add shared expenses or “expense owner” feature
- [ ] Add currency conversion or exchange rate adjustments
- [ ] Offline mode with service worker caching
- [ ] Notifications (e.g., rent increase reminders)
- [ ] Export reports (PDF/CSV)
- [ ] Multi-language support (English / Spanish)
