import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_dashboard_summary(client: AsyncClient):
    # Login as admin
    login_res = await client.post("/api/v1/auth/login", json={
        "login_id": "ADM0001",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get summary
    res = await client.get("/api/v1/dashboard/summary", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_students"] >= 4
    assert data["total_collected"] > 0
    assert data["pending_verifications_count"] >= 1

@pytest.mark.asyncio
async def test_fee_plans_list(client: AsyncClient):
    login_res = await client.post("/api/v1/auth/login", json={
        "login_id": "ADM0001",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.get("/api/v1/fees/plans", headers=headers)
    assert res.status_code == 200
    plans = res.json()
    assert len(plans) >= 2

@pytest.mark.asyncio
async def test_student_upi_submission_and_verification(client: AsyncClient):
    # 1. Student login (STU0001)
    s_login = await client.post("/api/v1/auth/login", json={
        "login_id": "STU0001",
        "password": "student123"
    })
    s_token = s_login.json()["access_token"]
    s_headers = {"Authorization": f"Bearer {s_token}"}

    # 2. Submit UPI payment
    sub_res = await client.post("/api/v1/payments/submit-upi", json={
        "amount": 5000.0,
        "transaction_ref": "UPI_TEST_REF_998877",
        "notes": "Testing UPI submission"
    }, headers=s_headers)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    payment_id = sub_data["payment_id"]
    assert sub_data["status"] == "pending_verification"

    # 3. Staff verifies payment
    stf_login = await client.post("/api/v1/auth/login", json={
        "login_id": "STF0001",
        "password": "staff123"
    })
    stf_token = stf_login.json()["access_token"]
    stf_headers = {"Authorization": f"Bearer {stf_token}"}

    verif_res = await client.post(f"/api/v1/payments/{payment_id}/verify", json={
        "action": "verify",
        "notes": "Bank statement matched"
    }, headers=stf_headers)
    assert verif_res.status_code == 200
    verif_data = verif_res.json()
    assert "receipt_number" in verif_data
    assert verif_data["receipt_number"].startswith("REC-2026-")
