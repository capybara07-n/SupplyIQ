"""CSV ingestion pipeline. Run: python -m app.etl data/sales.csv"""
import sys
import pandas as pd
from sqlalchemy import select
from .database import SessionLocal
from .models import Product, Sale


def ingest_sales(path: str) -> int:
    frame = pd.read_csv(path)
    required = {"sku", "date", "quantity"}
    if not required.issubset(frame.columns): raise ValueError(f"CSV must contain {sorted(required)}")
    frame = frame.dropna(subset=list(required)).drop_duplicates(["sku", "date"])
    frame["date"] = pd.to_datetime(frame["date"], errors="raise").dt.date
    frame["quantity"] = pd.to_numeric(frame["quantity"], errors="raise").clip(lower=0).astype(int)
    with SessionLocal() as db:
        sku_map = {p.sku:p.id for p in db.scalars(select(Product)).all()}
        rows = [Sale(product_id=sku_map[r.sku], sale_date=r.date, quantity=r.quantity) for r in frame.itertuples() if r.sku in sku_map]
        db.add_all(rows); db.commit(); return len(rows)


if __name__ == "__main__": print(f"Imported {ingest_sales(sys.argv[1])} sales rows")

