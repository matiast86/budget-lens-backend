# 💡 BudgetLens – Final Project Proposal

## 🪞 Project Overview

### Project Name
**BudgetLens**

### Team Members
Matías Tailler – Full Stack Developer (Solo Project)

---

## 🧭 Business Case

**Context:**  
BudgetLens belongs to the *personal finance* and *financial planning* sector.  
In high-inflation economies like Argentina’s, most financial apps focus on tracking past expenses rather than anticipating future ones.  
Users need a tool that helps them **plan** and **forecast** their expenses ahead, adapting to inflation and variable costs.

**Purpose:**  
BudgetLens allows users to **plan, forecast, and adjust** their budgets for the next 6–12 months.  
It helps anticipate rent updates, salary changes, and inflation-driven cost increases, empowering smarter financial decisions.

**Added Value:**  
Unlike traditional expense trackers, BudgetLens focuses on **predictive budgeting**.  
Users don’t just record what they’ve spent — they **project what’s coming**.  
By combining user data with inflation modeling, the app delivers proactive insights for better planning.

---

## ⚙️ Functionalities

| **Technical Requirement** | **How it will be applied in BudgetLens** |
|----------------------------|------------------------------------------|
| **Own and external authentication / session persistence** | Users register/login via **Auth0** with secure JWT session persistence. |
| **Email notifications** | Email confirmation and periodic balance reminders using **Nodemailer** or **Mailtrap** (development). |
| **File storage (cloud)** | Optional: exporting reports (CSV/PDF) to cloud services such as **AWS S3** or **Google Drive**. |
| **Admin user & dashboard** | Admin can review users, app usage, and system metrics through a protected dashboard. |
| **Documentation** | Full documentation via `README.md`, Swagger/OpenAPI endpoints, and architecture diagrams. |
| **Payment platform / premium plan** | Premium features (inflation modeling, detailed reports) via **Mercado Pago** or **Stripe**. |
| **Full deployment** | Backend: **NestJS + PostgreSQL (Prisma)** on Render. Frontend: **React + Tailwind** on Vercel or Render. |
| **Chatbot (optional)** | A simple assistant to guide users through the budgeting process and FAQs. |
| **User–Admin chat (optional)** | Real-time support chat using **Socket.io** on NestJS. |
| **Automatic notifications / CRON jobs** | Monthly reminders for budget updates or inflation recalculation. |
| **Google Cloud tools (optional)** | Integrate **Speech-to-Text** for expense entry or **Maps API** for location-based insights. |
| **New technology exploration** | **Prisma ORM** for database management and **PWA features** for offline access. |

---

## 💡 Extra Functionality Ideas

- Predictive inflation curve to auto-adjust future expenses.  
- Scenario simulator to compare best/worst financial outcomes.  
- Customizable dashboard widgets.  
- Exportable budget summary reports (CSV/PDF).  
- AI-powered assistant (future enhancement).

---

## 👥 User Stories

### Authentication & Profile
- As a user, I can register and log in to access my personal budget.  
- As a user, I can set my preferred currency and inflation rate.  

### Budget & Forecasting
- As a user, I can add income sources and recurring expenses.  
- As a user, I can plan my finances 6–12 months ahead.  
- As a user, I can simulate how inflation or rent increases will affect my balance.  

### Visualization & Insights
- As a user, I can view monthly and yearly summaries with charts.  
- As a user, I can filter transactions by category or month.  

### Notifications & Exports
- As a user, I receive alerts about upcoming expenses or low-balance months.  
- As a user, I can export my data in CSV or PDF format.  

### Admin (optional)
- As an admin, I can manage users, monitor usage, and update system parameters.

---

## 📘 Project Documentation

If all required sections are completed, include:
- **Wireframe (Figma)** – early design of dashboard and planner view.  
- **Architecture Diagram** – overview of modules (frontend, backend, database, APIs).  
- **Entity-Relationship Diagram (ERD)** – Prisma schema visualization.  
- **Swagger Documentation** – automatically generated via NestJS to describe API endpoints and models.  

📎 *Include public access links for documentation when available.*

---

## 🧱 Tech Stack Summary

| Layer | Technology |
|-------|-------------|
| **Frontend** | React + Vite + TailwindCSS (PWA-ready) |
| **Backend** | NestJS + Prisma ORM |
| **Database** | PostgreSQL |
| **Auth** | Auth0 (JWT-based authentication) |
| **Payments** | Mercado Pago or Stripe |
| **Deployment** | Render (backend) + Vercel or Render (frontend) |
| **Documentation** | Swagger (API), Markdown files for architecture & logic |
| **Version Control** | Git + GitHub |

---

## 🚀 Vision Statement

> **BudgetLens** helps users look ahead — not just track what they’ve spent, but *see what’s coming*.  
> Plan smarter, spend wiser.
