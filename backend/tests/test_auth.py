import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_admin_login(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={
        "login_id": "ADM0001",
        "password": "admin123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"
    assert data["user"]["login_id"] == "ADM0001"

@pytest.mark.asyncio
async def test_staff_login(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={
        "login_id": "STF0001",
        "password": "staff123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "staff"
    assert data["user"]["permissions"]["can_collect_fees"] is True

@pytest.mark.asyncio
async def test_student_login(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={
        "login_id": "STU0001",
        "password": "student123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "student"

@pytest.mark.asyncio
async def test_invalid_login(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={
        "login_id": "ADM0001",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
