from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class SupplierOut(ORMModel):
    id: int; name: str; region: str; category: str; on_time_rate: float
    defect_rate: float; avg_lead_days: float; risk_score: float; status: str


class ProductOut(ORMModel):
    id: int; sku: str; name: str; category: str; unit_cost: float
    current_stock: int; reorder_point: int; safety_stock: int
    monthly_demand: int; risk_score: float; supplier: SupplierOut


class AlertOut(ORMModel):
    id: int; severity: str; alert_type: str; title: str; message: str
    entity: str; recommendation: str; created_at: datetime; status: str


class KPI(BaseModel):
    inventory_value: float; fill_rate: float; at_risk_products: int
    open_alerts: int; supplier_otd: float; forecast_accuracy: float
    inventory_delta: float; fill_rate_delta: float


class ForecastPoint(BaseModel):
    date: date; actual: float | None = None; predicted: float
    lower: float; upper: float


class DashboardOut(BaseModel):
    kpis: KPI; inventory_health: list[dict]; risk_distribution: list[dict]
    demand_trend: list[dict]; category_inventory: list[dict]
    critical_products: list[dict]; supplier_performance: list[dict]
    alerts: list[AlertOut]

