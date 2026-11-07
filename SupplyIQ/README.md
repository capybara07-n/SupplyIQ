# SupplyIQ

SupplyIQ is a localhost-first supply-chain risk and demand intelligence platform. It combines a FastAPI analytics API, SQL data model and ETL pipeline with a responsive React + TypeScript PWA.

## What is included

- Executive dashboard with inventory value, fill rate, supplier OTD and risk KPIs
- Demand pulse with forecast comparison and forecast accuracy
- Product stockout prioritization, days of cover and supplier risk
- Supplier scorecards, anomaly alerts and actionable recommendations
- Product forecast API with confidence intervals
- CSV sales ingestion pipeline with validation and normalization
- PostgreSQL configuration plus an automatic SQLite demo mode
- Installable PWA shell with a responsive mobile experience

## Quick start (demo mode)

The backend defaults to a local SQLite file, so PostgreSQL is not required for the first run.

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. API docs are available at `http://localhost:8000/docs`.

## Run with PostgreSQL

From the repository root:

```powershell
Copy-Item .env.example .env
docker compose up -d postgres
cd backend
uvicorn app.main:app --reload
```

Tables and representative seed data are created on first startup. The named Docker volume preserves local data.

## Import sales data

CSV columns must be `sku,date,quantity`.

```powershell
cd backend
python -m app.etl path\to\sales.csv
```

## Architecture

```text
frontend/  React, TypeScript, Recharts, PWA shell
backend/   FastAPI, SQLAlchemy, Pandas, NumPy, scikit-learn-ready analytics
Postgres   Products, suppliers, sales, purchase orders, alerts
```

The forecast endpoint uses a deterministic trend-and-weekday model for fast localhost responses. `prophet` is included in the Python environment for scheduled model training as the dataset grows. Risk features and anomaly tooling use the scikit-learn stack.

