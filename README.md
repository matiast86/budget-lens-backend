# 💡 BudgetLens
> Plan smarter, spend wiser.

---

## 🧭 Overview

**BudgetLens** is a progressive web app for **predictive personal budgeting**.  
Unlike traditional expense trackers, it helps users **plan ahead**, adjusting for **inflation**, **recurring expenses**, and **future scenarios** up to a year in advance.  
Built with **NestJS**, **React**, and **Prisma**, it combines foresight and simplicity in a modern financial planner.

---

## 🌐 Live Demo & Resources

- 🚀 **Live App:** _Coming soon_
- 📘 **Project Proposal:** [docs/project-proposal.md](./docs/project-proposal.md)
- 🧩 **API Docs (Swagger):** _Coming soon_

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React + Vite + TailwindCSS (PWA-ready) |
| **Backend** | NestJS + Prisma ORM |
| **Database** | PostgreSQL |
| **Authentication** | Auth0 (JWT-based) |
| **Payments** | Mercado Pago / Stripe |
| **Deployment** | Render (backend), Vercel or Render (frontend) |
| **Documentation** | Swagger (API), Markdown for architecture |

---

## ✨ Key Features

- 📆 Plan budgets 6–12 months ahead  
- 📈 Adjust forecasts for inflation and recurring expenses  
- 📊 Generate monthly & yearly summaries  
- 📂 Export data in CSV or PDF format  
- 🔔 Receive reminders about upcoming expenses  
- 💬 Optional chatbot & premium plan (future)  

---

## ⚙️ Installation

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔧 Environment Variables

Create a `.env` file in each service with values like these:

### Backend `.env`
```env
DATABASE_URL=postgresql://user:password@host:port/budgetlens
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_SECRET=your_auth0_secret
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_BASE_URL=http://localhost:5173
```

---

## 🧩 API Documentation

All API endpoints are documented using **Swagger**.  
Once running locally, visit:
```
http://localhost:3000/api
```

---

## 📘 Documentation

- [Project Proposal](./docs/project-proposal.md)
- [Architecture](./docs/architecture.md) _(coming soon)_

---

## 📸 Preview

> _(Screenshots and dashboard mockups will be added once frontend views are finalized.)_

---

## 👨‍💻 Author

**Matías Tailler** – Full Stack Developer  
[LinkedIn](https://linkedin.com/in/matiastailler) · [GitHub](https://github.com/matiast86)

---

> “Plan today — see tomorrow.”  
> _BudgetLens_
