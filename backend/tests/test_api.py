import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import engine, Base
from app.seed_data import seed_database

# Initialize database schema and initial seed data for test run
Base.metadata.create_all(bind=engine)
seed_database()

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "Sahayyak AI" in response.json()["message"]

def test_get_categories():
    response = client.get("/api/categories")
    assert response.status_code == 200
    categories = response.json()
    assert isinstance(categories, list)
    assert len(categories) > 0
    slugs = [c["slug"] for c in categories]
    assert "smartphone" in slugs
    assert "whatsapp" in slugs
    assert "payments" in slugs

def test_get_guides():
    response = client.get("/api/guides")
    assert response.status_code == 200
    guides = response.json()
    assert isinstance(guides, list)
    assert len(guides) >= 10

def test_search_guides():
    response = client.get("/api/guides?search=wifi")
    assert response.status_code == 200
    guides = response.json()
    assert len(guides) > 0
    assert any("Wi-Fi" in g["title"] or "wifi" in g["tags"] for g in guides)

def test_user_registration_and_login():
    import uuid
    unique_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    reg_payload = {
        "name": "Ramesh Kumar",
        "email": unique_email,
        "password": "Password123!",
        "preferred_language": "hi",
        "text_size": "large"
    }
    # Register
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    token_data = reg_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Login
    login_payload = {
        "email": unique_email,
        "password": "Password123!"
    }
    login_res = client.post("/api/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Get /me with token
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/users/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Ramesh Kumar"
    assert me_res.json()["preferred_language"] == "hi"

def test_ai_chat_safety_interception():
    # Test sending dangerous financial credentials (PIN / OTP)
    payload = {
        "message": "My bank asked for my upi pin 1234 to give money, what should I do?",
        "language": "en"
    }
    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["safety_warning"] is not None
    assert "Safety Alert" in data["safety_warning"] or "PIN" in data["safety_warning"]
    # Check that response has structured steps
    assert isinstance(data["steps"], list)

def test_ai_chat_general_query():
    payload = {
        "message": "How do I send a photo on WhatsApp?",
        "language": "en"
    }
    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["steps"]) > 0
    assert "WhatsApp" in data["answer"] or "WhatsApp" in data["steps"][0]["text"]
