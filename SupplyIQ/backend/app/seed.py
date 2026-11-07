from datetime import date, datetime, timedelta
import math, random
from sqlalchemy import select
from sqlalchemy.orm import Session
from .models import Alert, Product, PurchaseOrder, Sale, Supplier


def seed_database(db: Session) -> None:
    if db.scalar(select(Supplier.id).limit(1)):
        return
    suppliers = [
        Supplier(name="Apex Components", region="India", category="Electronics", on_time_rate=96.4, defect_rate=1.1, avg_lead_days=12, risk_score=18, status="Healthy"),
        Supplier(name="Nordic Materials", region="Sweden", category="Raw Materials", on_time_rate=91.2, defect_rate=1.8, avg_lead_days=19, risk_score=36, status="Watch"),
        Supplier(name="Pacific Microtech", region="Taiwan", category="Electronics", on_time_rate=78.6, defect_rate=3.9, avg_lead_days=27, risk_score=76, status="Critical"),
        Supplier(name="Meridian Packaging", region="India", category="Packaging", on_time_rate=94.8, defect_rate=1.4, avg_lead_days=8, risk_score=24, status="Healthy"),
        Supplier(name="Atlas Industrial", region="Germany", category="Mechanical", on_time_rate=87.3, defect_rate=2.6, avg_lead_days=22, risk_score=54, status="At Risk"),
    ]
    db.add_all(suppliers); db.flush()
    specs = [
        ("SIQ-1042", "Precision Sensor X1", "Electronics", 2, 72, 184, 260, 120, 940, 84),
        ("SIQ-2841", "Control Board Pro", "Electronics", 0, 118, 390, 320, 140, 730, 62),
        ("SIQ-3098", "Aluminium Housing", "Mechanical", 4, 34, 208, 190, 90, 520, 71),
        ("SIQ-4210", "Eco Shipping Carton", "Packaging", 3, 2.8, 1320, 900, 350, 2600, 22),
        ("SIQ-5517", "Lithium Cell 4500", "Electronics", 2, 21, 610, 720, 280, 1880, 91),
        ("SIQ-6083", "Copper Coil Assembly", "Raw Materials", 1, 46, 940, 600, 240, 1460, 43),
        ("SIQ-7122", "Industrial Fastener Kit", "Mechanical", 4, 12, 2260, 1100, 440, 3100, 29),
        ("SIQ-8305", "Thermal Interface Pad", "Electronics", 0, 8.5, 750, 500, 200, 1280, 17),
    ]
    products = [Product(sku=s[0], name=s[1], category=s[2], supplier_id=suppliers[s[3]].id, unit_cost=s[4], current_stock=s[5], reorder_point=s[6], safety_stock=s[7], monthly_demand=s[8], risk_score=s[9]) for s in specs]
    db.add_all(products); db.flush()
    random.seed(42)
    today = date.today()
    for product in products:
        daily = product.monthly_demand / 30
        for offset in range(180, -1, -1):
            d = today - timedelta(days=offset)
            season = 1 + .18 * math.sin((d.timetuple().tm_yday / 365) * 2 * math.pi)
            weekend = .72 if d.weekday() >= 5 else 1
            qty = max(0, round(random.gauss(daily * season * weekend, max(1, daily * .16))))
            db.add(Sale(product_id=product.id, sale_date=d, quantity=qty))
    db.add_all([
        PurchaseOrder(po_number="PO-24081", supplier_id=suppliers[2].id, product_id=products[4].id, quantity=1800, expected_date=today + timedelta(days=9), status="Delayed"),
        PurchaseOrder(po_number="PO-24102", supplier_id=suppliers[4].id, product_id=products[2].id, quantity=900, expected_date=today + timedelta(days=5), status="In Transit"),
    ])
    now = datetime.utcnow()
    db.add_all([
        Alert(severity="Critical", alert_type="Stockout", title="Lithium Cell stockout projected", message="Available stock covers only 9.7 days of expected demand.", entity="SIQ-5517", recommendation="Expedite PO-24081 and move 350 units from the Pune warehouse.", created_at=now-timedelta(minutes=18)),
        Alert(severity="High", alert_type="Supplier", title="Pacific Microtech delivery risk", message="On-time delivery declined 11.4% over the last 60 days.", entity="Pacific Microtech", recommendation="Confirm production capacity and activate the secondary supplier quote.", created_at=now-timedelta(hours=2)),
        Alert(severity="High", alert_type="Demand Spike", title="Precision Sensor demand accelerating", message="Demand is 28% above its rolling four-week baseline.", entity="SIQ-1042", recommendation="Increase the next replenishment by 420 units.", created_at=now-timedelta(hours=5)),
        Alert(severity="Medium", alert_type="Inventory", title="Excess fastener inventory", message="Projected holding period exceeds 72 days.", entity="SIQ-7122", recommendation="Pause the next order cycle and rebalance across warehouses.", created_at=now-timedelta(days=1)),
    ])
    db.commit()

