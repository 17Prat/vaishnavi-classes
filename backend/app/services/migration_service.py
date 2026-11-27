import sys
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from app.models.institute import Institute, UpiAccount, InstituteSettings

async def run_safe_schema_migrations(session: AsyncSession):
    """
    Safely alter existing tables to add new columns if they do not exist.
    Works seamlessly across SQLite and PostgreSQL without deleting existing data.
    """
    migrations = [
        # Fee Plans
        ("fee_plans", "discount_type", "VARCHAR(20) DEFAULT 'none'"),
        ("fee_plans", "discount_value", "NUMERIC(12, 2) DEFAULT 0.00"),
        ("fee_plans", "discount_amount", "NUMERIC(12, 2) DEFAULT 0.00"),
        ("fee_plans", "discount_reason", "VARCHAR(255)"),
        
        # Student Fee Assignments
        ("student_fee_assignments", "original_fee_amount", "NUMERIC(12, 2) DEFAULT 0.00"),
        ("student_fee_assignments", "discount_type", "VARCHAR(20) DEFAULT 'none'"),
        ("student_fee_assignments", "discount_value", "NUMERIC(12, 2) DEFAULT 0.00"),
        ("student_fee_assignments", "discount_applied_by", "VARCHAR(36)"),
        ("student_fee_assignments", "discount_applied_at", "DATETIME"),
        
        # Batches
        ("batches", "academic_year_id", "VARCHAR(36)"),
        ("batches", "subject", "VARCHAR(150)"),
        ("batches", "start_date", "DATE"),
        ("batches", "end_date", "DATE"),
        ("batches", "start_time", "VARCHAR(20)"),
        ("batches", "end_time", "VARCHAR(20)"),
        ("batches", "batch_days", "VARCHAR(100)"),
        ("batches", "description", "TEXT"),
        ("batches", "status", "VARCHAR(20) DEFAULT 'active'"),
        ("batches", "created_by", "VARCHAR(36)"),
        ("batches", "assigned_staff_name", "VARCHAR(150)"),
        
        # Institute Settings
        ("institute_settings", "signatory_name", "VARCHAR(150) DEFAULT 'Director / Authorized Signatory'"),
        ("institute_settings", "signatory_designation", "VARCHAR(100) DEFAULT 'Authorized Signatory'"),
        ("institute_settings", "signature_image_path", "VARCHAR(500)"),
        ("institute_settings", "signature_enabled", "BOOLEAN DEFAULT 1"),
        ("institute_settings", "signature_version", "INTEGER DEFAULT 1"),
        
        # Payments
        ("payments", "recipient_upi_id", "VARCHAR(100)"),
        ("payments", "recipient_upi_name", "VARCHAR(150)"),
        
        # Receipts
        ("receipts", "original_amount", "NUMERIC(12, 2)"),
        ("receipts", "discount_amount", "NUMERIC(12, 2)"),
        ("receipts", "final_payable", "NUMERIC(12, 2)"),
        ("receipts", "signatory_name", "VARCHAR(150)"),
        ("receipts", "signatory_designation", "VARCHAR(100)"),
        ("receipts", "signature_image_path", "VARCHAR(500)"),
    ]

    for table, col, col_type in migrations:
        try:
            sql = f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"
            await session.execute(text(sql))
            await session.commit()
        except Exception:
            # Column already exists or table not ready, safely ignore
            await session.rollback()

    # Backfill original_fee_amount from base_amount if 0
    try:
        await session.execute(text("UPDATE student_fee_assignments SET original_fee_amount = base_amount WHERE original_fee_amount IS NULL OR original_fee_amount = 0"))
        await session.commit()
    except Exception:
        await session.rollback()

    # Seed default UPI account if none exists
    try:
        inst_res = await session.execute(select(Institute).limit(1))
        institute = inst_res.scalar_one_or_none()
        if institute:
            upi_res = await session.execute(select(UpiAccount).where(UpiAccount.institute_id == institute.id).limit(1))
            existing_upi = upi_res.scalar_one_or_none()
            if not existing_upi:
                default_upi = UpiAccount(
                    institute_id=institute.id,
                    account_holder_name="Vaishnavi Classes",
                    upi_id=institute.upi_id or "9664257346@upi",
                    display_name="Vaishnavi Classes Primary Desk",
                    bank_name="HDFC Bank",
                    payment_instructions="Scan QR code using Google Pay, PhonePe, Paytm, or BHIM. After paying, submit 12-digit UTR ref for instant verification.",
                    is_active=True,
                    is_default=True,
                    created_by="system"
                )
                session.add(default_upi)
                await session.commit()
    except Exception:
        await session.rollback()
