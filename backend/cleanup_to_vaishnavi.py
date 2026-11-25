import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
import asyncio
from app.database import AsyncSessionLocal
from app.models import (
    Institute, InstituteSettings, User, StaffProfile, StaffPermission,
    StudentProfile, SessionLog, AcademicYear, Course, SchoolClass, Batch,
    Enrollment, StaffBatchAssignment, FeePlan, StudentFeeAssignment, Installment,
    Payment, PaymentAllocation, Receipt, Reminder, Conversation,
    ConversationMember, Message, Notification, AuditLog
)
from sqlalchemy import select, delete, update

async def cleanup():
    print("--- PURGING ALL MOCK/DUMMY DATA ---")
    async with AsyncSessionLocal() as session:
        # 1. Delete all transactional and dependent data
        await session.execute(delete(Receipt))
        await session.execute(delete(PaymentAllocation))
        await session.execute(delete(Payment))
        await session.execute(delete(Reminder))
        await session.execute(delete(Message))
        await session.execute(delete(ConversationMember))
        await session.execute(delete(Conversation))
        await session.execute(delete(Notification))
        await session.execute(delete(AuditLog))
        await session.execute(delete(Installment))
        await session.execute(delete(StudentFeeAssignment))
        await session.execute(delete(FeePlan))
        await session.execute(delete(Enrollment))
        await session.execute(delete(StaffBatchAssignment))
        await session.execute(delete(Batch))
        await session.execute(delete(SchoolClass))
        await session.execute(delete(Course))
        await session.execute(delete(StaffPermission))
        await session.execute(delete(StaffProfile))
        await session.execute(delete(StudentProfile))
        await session.execute(delete(SessionLog))
        
        # 2. Delete all non-admin users
        await session.execute(delete(User).where(User.role != "admin"))

        # 3. Update Institute to "Vaishnavi Classes"
        inst_stmt = select(Institute).limit(1)
        inst_res = await session.execute(inst_stmt)
        institute = inst_res.scalar_one_or_none()
        if institute:
            institute.name = "Vaishnavi Classes"
            institute.code = "VAISHNAVI01"
            institute.email = "contact@vaishnaviclasses.com"
            institute.phone = "+91 98765 43210"
            institute.address = "Main Campus, Vaishnavi Classes"
            institute.upi_id = "vaishnaviclasses@upi"

        # 4. Update Institute Settings
        sett_stmt = select(InstituteSettings).limit(1)
        sett_res = await session.execute(sett_stmt)
        settings = sett_res.scalar_one_or_none()
        if settings:
            settings.receipt_footer_note = "Thank you for your payment to Vaishnavi Classes. This is a computer-generated receipt with digital QR verification."

        # 5. Update Admin User Name
        admin_stmt = select(User).where(User.role == "admin").limit(1)
        admin_res = await session.execute(admin_stmt)
        admin = admin_res.scalar_one_or_none()
        if admin:
            admin.full_name = "Admin (Vaishnavi Classes)"
            admin.email = "admin@vaishnaviclasses.com"

        await session.commit()

        # Delete any generated PDFs in storage
        for d in ["receipts_storage", "backend/receipts_storage"]:
            if os.path.exists(d):
                for f in os.listdir(d):
                    if f.endswith(".pdf"):
                        try:
                            os.remove(os.path.join(d, f))
                        except Exception:
                            pass

        print("--- CLEANUP SUCCESSFUL: VAISHNAVI CLASSES READY FOR FRESH DATA ---")

if __name__ == "__main__":
    asyncio.run(cleanup())
