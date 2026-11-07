from fastapi.testclient import TestClient
from app.main import app


def test_health():
    with TestClient(app) as client:
        assert client.get("/health").json()["status"] == "healthy"


def test_dashboard():
    with TestClient(app) as client:
        response = client.get("/api/v1/dashboard")
        assert response.status_code == 200
        assert response.json()["kpis"]["open_alerts"] >= 1

