from datetime import date, datetime
from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class Supplier(Base):
    __tablename__ = "suppliers"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    region: Mapped[str] = mapped_column(String(80))
    category: Mapped[str] = mapped_column(String(80))
    on_time_rate: Mapped[float] = mapped_column(Float)
    defect_rate: Mapped[float] = mapped_column(Float)
    avg_lead_days: Mapped[float] = mapped_column(Float)
    risk_score: Mapped[float] = mapped_column(Float, default=0)
    status: Mapped[str] = mapped_column(String(30), default="Healthy")
    products: Mapped[list["Product"]] = relationship(back_populates="supplier")


class Product(Base):
    __tablename__ = "products"
    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(150))
    category: Mapped[str] = mapped_column(String(80))
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"))
    unit_cost: Mapped[float] = mapped_column(Float)
    current_stock: Mapped[int] = mapped_column(Integer)
    reorder_point: Mapped[int] = mapped_column(Integer)
    safety_stock: Mapped[int] = mapped_column(Integer)
    monthly_demand: Mapped[int] = mapped_column(Integer)
    risk_score: Mapped[float] = mapped_column(Float, default=0)
    supplier: Mapped[Supplier] = relationship(back_populates="products")
    sales: Mapped[list["Sale"]] = relationship(back_populates="product", cascade="all, delete-orphan")


class Sale(Base):
    __tablename__ = "sales"
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    sale_date: Mapped[date] = mapped_column(Date, index=True)
    quantity: Mapped[int] = mapped_column(Integer)
    product: Mapped[Product] = relationship(back_populates="sales")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id: Mapped[int] = mapped_column(primary_key=True)
    po_number: Mapped[str] = mapped_column(String(40), unique=True)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    expected_date: Mapped[date] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(30))


class Alert(Base):
    __tablename__ = "alerts"
    id: Mapped[int] = mapped_column(primary_key=True)
    severity: Mapped[str] = mapped_column(String(20), index=True)
    alert_type: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(180))
    message: Mapped[str] = mapped_column(Text)
    entity: Mapped[str] = mapped_column(String(100))
    recommendation: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(20), default="Open")

