from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
from .analytics import dashboard_data, forecast_product
from .config import settings
from .database import Base, SessionLocal, engine, get_db
from .models import Alert, Product, Supplier
from .schemas import AlertOut, DashboardOut, ForecastPoint, ProductOut, SupplierOut
from .seed import seed_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db: seed_database(db)
    yield


app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


@app.get("/health")
def health(): return {"status":"healthy","service":"supplyiq-api"}

@app.get(f"{settings.api_prefix}/dashboard", response_model=DashboardOut)
def dashboard(db: Session = Depends(get_db)): return dashboard_data(db)

@app.get(f"{settings.api_prefix}/products", response_model=list[ProductOut])
def products(db: Session = Depends(get_db)):
    return db.scalars(select(Product).options(joinedload(Product.supplier)).order_by(Product.risk_score.desc())).unique().all()

@app.get(f"{settings.api_prefix}/suppliers", response_model=list[SupplierOut])
def suppliers(db: Session = Depends(get_db)): return db.scalars(select(Supplier).order_by(Supplier.risk_score.desc())).all()

@app.get(f"{settings.api_prefix}/alerts", response_model=list[AlertOut])
def alerts(db: Session = Depends(get_db)): return db.scalars(select(Alert).order_by(Alert.created_at.desc())).all()

@app.patch(f"{settings.api_prefix}/alerts/{{alert_id}}/resolve", response_model=AlertOut)
def resolve_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.get(Alert, alert_id)
    if not alert: raise HTTPException(404, "Alert not found")
    alert.status = "Resolved"; db.commit(); db.refresh(alert); return alert

@app.get(f"{settings.api_prefix}/forecast/{{product_id}}", response_model=list[ForecastPoint])
def forecast(product_id: int, days: int = 30, db: Session = Depends(get_db)):
    if not db.get(Product, product_id): raise HTTPException(404, "Product not found")
    return forecast_product(db, product_id, min(max(days, 7), 90))

