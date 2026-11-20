import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_reminders_due_students(client: AsyncClient):
    login_res = await client.post("/api/v1/auth/login", json={
        "login_id": "STF0001",
        "password": "staff123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.get("/api/v1/reminders/due-students", headers=headers)
    assert res.status_code == 200
    due_list = res.json()
    assert len(due_list) > 0

@pytest.mark.asyncio
async def test_whatsapp_reminder_link_generation(client: AsyncClient):
    login_res = await client.post("/api/v1/auth/login", json={
        "login_id": "STF0001",
        "password": "staff123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get student list
    s_res = await client.get("/api/v1/students", headers=headers)
    students = s_res.json()
    student_id = students[0]["id"]

    # Generate reminder
    gen_res = await client.post("/api/v1/reminders/generate", json={
        "student_id": student_id,
        "template_type": "overdue_fee"
    }, headers=headers)
    assert gen_res.status_code == 200
    rem_data = gen_res.json()
    assert "https://wa.me/" in rem_data["whatsapp_url"]
    assert "OVERDUE" in rem_data["message_text"]

@pytest.mark.asyncio
async def test_reports_defaulters(client: AsyncClient):
    login_res = await client.post("/api/v1/auth/login", json={
        "login_id": "ADM0001",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = await client.get("/api/v1/reports/defaulters", headers=headers)
    assert res.status_code == 200
    defaulters = res.json()
    assert len(defaulters) >= 1
    assert defaulters[0]["student_login_id"] == "STU0003"
