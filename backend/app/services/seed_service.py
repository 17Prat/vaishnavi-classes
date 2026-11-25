from decimal import Decimal
from datetime import date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import (
    Institute, InstituteSettings, User, AcademicYear
)
from app.utils.security import hash_password
from app.config import settings as app_settings

async def seed_initial_data(db: AsyncSession):
    # Check if already seeded
    stmt = select(Institute).limit(1)
    result = await db.execute(stmt)
    existing_inst = result.scalar_one_or_none()
    if existing_inst:
        return existing_inst

    print("--- INITIALIZING CLEAN VAISHNAVI CLASSES MASTER SETUP ---")

    # 1. Institute & Settings
    institute = Institute(
        name="Vaishnavi Classes",
        code="VAISHNAVI01",
        email="contact@vaishnaviclasses.com",
        phone="+91 98765 43210",
        address="Main Campus, Vaishnavi Classes",
        currency="INR",
        currency_symbol="₹",
        upi_id="vaishnaviclasses@upi",
    )
    db.add(institute)
    await db.flush()

    settings = InstituteSettings(
        institute_id=institute.id,
        receipt_prefix="REC-",
        receipt_footer_note="Thank you for your payment to Vaishnavi Classes. This is a computer-generated receipt with verification QR code.",
        allow_student_upi_submission=True,
        enable_whatsapp_reminders=True
    )
    db.add(settings)

    # 2. Master Admin User ONLY (No dummy students or dummy staff)
    admin_user = User(
        institute_id=institute.id,
        login_id="ADM0001",
        hashed_password=hash_password("admin123"),
        role="admin",
        full_name="Admin (Vaishnavi Classes)",
        email="admin@vaishnaviclasses.com",
        phone="+91 98765 43210",
        is_active=True,
        must_change_password=False
    )
    db.add(admin_user)
    await db.flush()

    # 3. Default Current Academic Year
    acad_year = AcademicYear(
        institute_id=institute.id,
        name="2026-2027",
        start_date=date(2026, 4, 1),
        end_date=date(2027, 3, 31),
        is_current=True
    )
    db.add(acad_year)

    await db.commit()
    print("--- CLEAN VAISHNAVI CLASSES INITIALIZATION COMPLETED ---")
    return institute
