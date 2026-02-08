# CLAUDE.md — Expense Tracker: Excel-to-App Comparative Analysis

## Context

I'm building a personal expense tracking application using **NestJS + Prisma + PostgreSQL**. The app must replicate and eventually replace my Excel-based expense tracker (`Gastos_Mati_Claude.xlsx`), which I've used since January 2024. This is not a generic expense tracker — it was designed for **the Argentine economic context** (high inflation, installment-based credit card purchases, salary renegotiations, multi-currency tracking). The Excel file is included in this project for reference.

## Your Task

Perform a **full comparative analysis** between the current state of the NestJS app (codebase in this repo) and the Excel tracker described below. Specifically:

1. **Map every Excel concept to the app's current data model** (Prisma schema). Identify what's already implemented, what's missing, and what's implemented differently.
2. **Identify logic gaps**: calculations, derived fields, and business rules present in the Excel that the app doesn't yet handle.
3. **Identify structural gaps**: sheets/views in the Excel that have no equivalent endpoint, service, or module in the app.
4. **Produce a prioritized gap report** with concrete recommendations (schema changes, new modules, new endpoints, missing calculations).

---

## Excel Structure — Complete Reference

### SHEET: "BASE GASTOS" (Core Transaction Ledger) — ~5,500 rows

This is the **single source of truth**. Every row is a transaction line (one row per installment per month). Columns:

| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | `STATUS` | Enum | `Cerrado` (closed/past), `Actual` (current month), `Futuro` (projected) |
| B | `STATUS & WEEK` | Derived | Concatenation of STATUS + week number (e.g., `CerradoW1`, `ActualW3`, `FuturoW1`). Used for weekly cashflow pivots. |
| C | `Impacto` | Boolean (`Y`/`N`) | Whether this transaction impacts the cashflow analysis. Some entries are informational only. |
| D | `Pagado` | Boolean (`Y`/`N`) | Whether the transaction has actually been paid/settled. |
| E | `Titular` | Enum/String | Who the expense belongs to. Values: `Yani`, `Sofi`, `Susana`, `Pau`, `Celi`, `Otros`. Used for debt tracking between family members. |
| F | `Ingreso / Egreso` | Enum | `Ingreso` or `Egreso`. |
| G | `Grupo de Gasto` | Enum | **Payment method / source**. Values: `VISA CDD`, `VISA GAL`, `MASTER CDD`, `MASTER CAR`, `AMEX GAL`, `Efvo./Transf.`, `Mercado Pago`, `Bancos`, `Sueldo`, `Créditos`, `Ahorros`, `Débito`, `Deuda`, `Préstamo Sofía`. This is NOT the expense category — it's the payment instrument. |
| H | `Agrupador` | String | **Sub-category / grouping**. Granular classification. ~80 unique values including: `Supermercado`, `Alquiler & Expensas`, `OSDE`, `Servicios Hogar`, `Jardín Noah`, `Jardín Liam`, `Taxis & Cabify`, `Delivery`, `Farmacia`, `Ropa`, `Calzado`, `Cumpleaños Noah`, `Cumpleaños Liam`, `Salida con Amigos`, `Almuerzos & Café Mati`, `Servicios Streaming`, `Cursos`, `Prestamo Massa`, etc. |
| I | `Concepto` | Enum | **Expense category** (higher level). Values: `Gastos de la casa`, `Salidas a comer`, `Noah`, `Liam`, `Salud`, `Transporte`, `Varios`, `Entretenimiento`, `Regalos`, `Créditos`, `Vestimenta`, `Monotributo`, `Librería`, `Peluquería`, `Salem`, `Vacaciones`, `Sueldo`, `Saldo`, `Saldo Mes Anterior`, `USD Susana`, `USD Sofía`, `Susana`, `Plan V VISA CDD`. |
| J | `Detalle` | String | Free-text description (e.g., "Club La Nacion", "Carrefour", "Benito Nazar", specific store or item). |
| K | `Fecha transacción` | Date | Actual date of the purchase/transaction. |
| L | `Mes Pago` | Date (month) | The month this installment is **charged/paid**. For installment purchases, K stays the same but L advances each month. |
| M | `Cuotas` | Integer | Total number of installments for this purchase. `1` for single-payment transactions. |
| N | `N° Cuota` | Integer | Current installment number (1-indexed). |
| O | `Cuotas Pendientes` | Integer | Remaining installments (`Cuotas - N° Cuota`). |
| P | `Importe Total USD` | Decimal | Total amount in USD (for USD-denominated transactions). |
| Q | `TC Estimado` | Decimal | Estimated exchange rate (USD→ARS). |
| R | `Importe Total Pesos` | Decimal | Total amount in ARS for the full purchase. |
| S | `Importe estimado mensual` | Decimal | Monthly installment amount in ARS (`Importe Total Pesos / Cuotas`). This is the per-month cashflow impact. |
| T | `Inicial Mes` | Decimal | **Signed monthly amount for pivots**: negative for expenses, positive for income. This is the primary value used in all pivot tables and cashflow views. |
| U-X | `W1`, `W2`, `W3`, `W4` | Decimal | Distribution of the monthly amount across weeks 1–4. Used for intra-month cashflow management. |
| Y | `Balance Mes` | Decimal | Running monthly balance. |
| Z | `Index` | Decimal | CPI index value for the transaction's payment month (base 100 = Jan 2024). Used to deflate amounts. |
| AA | `Inicial mes real` | Decimal | **Inflation-adjusted amount**: `Inicial Mes / Index * 100`. This converts nominal pesos to "real" (constant Jan 2024) pesos. |

**Key business rules:**
- For installment purchases (Cuotas > 1), there is **one row per installment per month**. The `Fecha transacción` is the same across all rows, but `Mes Pago` and `N° Cuota` advance.
- `Futuro` rows are projected future installments that haven't been charged yet.
- `Ingreso` rows include: salary from multiple employers (Benito Nazar, Cruz del Sur, Particulares), opening balances per payment method, and carryover balances.
- Negative `Importe Total Pesos` on an Egreso with a negative `Inicial Mes` that becomes positive represents **reimbursements or contra-entries** (e.g., family member paying back their share of a group expense).

---

### SHEET: "Infla" (Inflation Table)

Monthly CPI data from Jan 2024 through Dec 2026 (projected).

| Column | Field | Description |
|--------|-------|-------------|
| A | `Mes` | Month (date) |
| B | `Infl` | Monthly inflation rate (e.g., 0.206 = 20.6% for Jan 2024) |
| C | `Base 100` | Cumulative CPI index, base 100 = Jan 2024 |
| D | `Acum Año` | Year-to-date accumulated inflation |
| E | `Interanual` | Year-over-year inflation rate |

From Jan 2024 (20.6%) inflation has declined to ~2% projected monthly by 2026. Future months use estimated rates. This table is critical — it feeds the `Index` column in BASE GASTOS and enables all real-terms analysis.

---

### SHEET: "CASHFLOW" (Pivot Table — Monthly Cashflow Projection)

A pivot table over BASE GASTOS showing:
- **Rows**: Ingreso/Egreso → Grupo de Gasto (payment method) → Concepto → Detalle
- **Columns**: Month (Mes Pago), with both `Inicial Mes` and `Balance Mes` per month
- **Filters**: Impacto = All, Titular = Multiple Items
- Shows Ingreso Total, Egreso Total, and Grand Total (net) per month
- Projects forward through 2026 based on `Futuro` status rows

---

### SHEET: "TD Deudas" (Debt Tracking Pivot)

Pivot showing **net balances between family members/people** by month:
- Rows: `Titular` → `Detalle` (specific debt items)
- Columns: Months
- Tracks: Celi, Pau, Sofi (with sub-items like "Ropa de chile", "Celular Sofi", "Kel"), Susana, Yani, Otros
- Positive = they owe me, Negative = I owe them
- Has a `Pagado` filter to distinguish settled vs. pending debts

---

### SHEET: "Evolución Gastos" (Expense Evolution Pivot)

Detailed monthly breakdown by `Concepto` (category), showing both:
- `Inicial Mes` (nominal amounts per category per month)
- `Inicial mes real` (inflation-adjusted amounts, expressed as **percentage of total** spending)

Categories tracked: Gastos de la casa, Salidas a comer, Noah, Salud, Liam, Transporte, Varios, Regalos, Créditos, Vestimenta, Entretenimiento, Monotributo, Librería, Saldo, USD Sofía.

---

### SHEET: "GRAPH Evol. de gastos" (Expense Evolution Summary for Charts)

Aggregated monthly totals (nominal + real) for charting total expense trends over time.

---

### SHEET: "GRAPH Evol reales detallado" (Detailed Real Evolution for Charts)

Per-category, per-month **real (inflation-adjusted)** expense amounts. Used for stacked area/bar charts showing how spending composition changes over time in real terms. Includes Grand Total row.

---

---

### SHEET: "Lista" (Dropdown Lists)

Reference lists for Excel data validation dropdowns:
- `Grupo de gasto` values (payment methods)
- `Concepto` values (categories)

> **Note:** The Excel also contains sheets "Paritarias", "Hoja1", "Osde", "Expectativa mínima de salario", "Calcular %", and "Sheet1". These are **personal notes kept for convenience** and are NOT part of the app's scope. Ignore them entirely.

---

## Key Analytical Capabilities the App Must Replicate

1. **Inflation-adjusted expense tracking**: Every nominal amount must be convertible to real (constant-peso) terms using the CPI index table.
2. **Installment amortization**: Credit card purchases in cuotas must generate one transaction-line per installment per month, with correct `Mes Pago`, `N° Cuota`, and `Cuotas Pendientes`.
3. **Multi-dimensional categorization**: Payment method (Grupo de Gasto) × Category (Concepto) × Sub-category (Agrupador) × Detail, all independently filterable.
4. **Weekly intra-month cashflow**: Distributing monthly expenses into W1–W4 buckets.
5. **Forward projection**: `Futuro` status transactions for installments not yet charged, enabling cashflow forecasting.
6. **Inter-person debt ledger**: Tracking who owes whom across family members, with itemized debts and payment status.
7. **Cashflow pivot**: Monthly income vs. expense by payment method, with net balance.
8. **Category evolution over time**: Both nominal and real, with percentage-of-total breakdowns.
9. **Status lifecycle**: Transactions move from `Futuro` → `Actual` → `Cerrado` as months pass.

## Output Format

Please produce your analysis as a structured report with:

1. **Data Model Mapping Table**: Each Excel field → corresponding Prisma model/field (or "MISSING")
2. **Sheet-to-Module Mapping**: Each Excel sheet → corresponding NestJS module/service/controller (or "MISSING")
3. **Calculation/Logic Gap List**: Business rules present in Excel but not in app code
4. **Prioritized Recommendations**: What to build next, ordered by importance (P0 = core data integrity, P1 = key analytics, P2 = nice-to-have views)
5. **Schema Change Suggestions**: Concrete Prisma schema modifications if needed