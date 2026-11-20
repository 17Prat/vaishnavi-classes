import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import date
from app.database import get_db
from app.models.payment import Reminder
from app.models.fee import StudentFeeAssignment, Installment
from app.models.user import User, StudentProfile
from app.models.institute import Institute
from app.schemas.payment import ReminderRequest, ReminderOut
from app.utils.dependencies import require_roles

router = APIRouter(prefix="/reminders", tags=["WhatsApp Reminders"])

def format_whatsapp_message(
    template_type: str,
    student_name: str,
    institute_name: str,
    amount: float,
    due_date: str,
    currency_symbol: str = "₹",
    upi_id: str = "apexinstitute@upi"
) -> str:
    if template_type == "upcoming_fee":
        return (
            f"Dear {student_name},\n\n"
            f"This is a gentle reminder from *{institute_name}* that your upcoming fee installment of "
            f"*{currency_symbol}{amount:,.2f}* is due on *{due_date}*.\n\n"
            f"You can pay conveniently via UPI to `{upi_id}` or visit the accounts desk.\n\n"
            f"Thank you!"
        )
    elif template_type == "due_today":
        return (
            f"Urgent Notice: Dear {student_name},\n\n"
            f"Your fee installment of *{currency_symbol}{amount:,.2f}* to *{institute_name}* is *DUE TODAY ({due_date})*.\n\n"
            f"Please clear the dues today to avoid overdue status. UPI ID: `{upi_id}`.\n\n"
            f"Regards,\nFinance Team"
        )
    elif template_type == "overdue_fee":
        return (
            f"OVERDUE REMINDER: Dear {student_name},\n\n"
            f"Your fee installment of *{currency_symbol}{amount:,.2f}* for *{institute_name}* was due on *{due_date}* and is now *OVERDUE*.\n\n"
            f"Please arrange payment immediately to keep your student portal active.\n"
            f"UPI: `{upi_id}`\n\n"
            f"Contact Accounts for any assistance."
        )
    elif template_type == "partial_payment":
        return (
            f"Dear {student_name},\n\n"
            f"We have received a partial payment towards your fees at *{institute_name}*.\n"
            f"Your remaining pending balance is *{currency_symbol}{amount:,.2f}*.\n\n"
            f"Thank you,\nAccounts Office"
        )
    elif template_type == "payment_confirmation":
        return (
            f"Dear {student_name},\n\n"
            f"We gratefully acknowledge the receipt of your payment of *{currency_symbol}{amount:,.2f}* towards *{institute_name}*.\n"
            f"Your official verified receipt is available in your student portal.\n\n"
            f"Thank you for your prompt payment!"
        )
    else:
        return f"Fee notification from {institute_name} for {student_name}."

@router.get("/due-students")
async def get_due_students_for_reminders(
    current_user: User = Depends(require_roles(["admin", "staff"])),
    db: AsyncSession = Depends(get_db)
):
    today = date.today()
    stmt = (
        select(Installment)
        .join(StudentFeeAssignment)
        .join(StudentProfile)
        .where(
            and_(
                StudentProfile.institute_id == current_user.institute_id,
                Installment.status.in_(["pending", "partial", "overdue"])
            )
        )
        .options(
            selectinload(Installment.fee_assignment).selectinload(StudentFeeAssignment.student).selectinload(StudentProfile.user)
        )
        .order_by(Installment.due_date.asc())
    )
    res = await db.execute(stmt)
    installments = res.scalars().all()

    out = []
    for inst in installments:
        student = inst.fee_assignment.student
        phone = student.guardian_phone or student.user.phone or ""
        pending_amt = float(inst.due_amount - inst.paid_amount)
        is_overdue = inst.due_date < today
        is_today = inst.due_date == today

        suggested_template = "overdue_fee" if is_overdue else ("due_today" if is_today else "upcoming_fee")

        out.append({
            "installment_id": inst.id,
            "student_id": student.id,
            "student_login_id": student.student_id,
            "student_name": student.user.full_name,
            "phone": phone,
            "installment_title": inst.title,
            "due_date": inst.due_date.strftime("%Y-%m-%d"),
            "pending_amount": pending_amt,
            "status": "overdue" if is_overdue else ("due_today" if is_today else "upcoming"),
            "suggested_template": suggested_template
        })
    return out

@router.post("/generate", response_model=ReminderOut)
async def generate_whatsapp_reminder(
    payload: ReminderRequest,
    current_user: User = Depends(require_roles(["admin", "staff"])),
    db: AsyncSession = Depends(get_db)
):
    s_stmt = (
        select(StudentProfile)
        .where(StudentProfile.id == payload.student_id)
        .options(
            selectinload(StudentProfile.user),
            selectinload(StudentProfile.fee_assignments).selectinload(StudentFeeAssignment.installments)
        )
    )
    s_res = await db.execute(s_stmt)
    student = s_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    inst_stmt = select(Institute).where(Institute.id == current_user.institute_id)
    inst_res = await db.execute(inst_stmt)
    institute = inst_res.scalar_one()

    # Determine amount & due date
    amount = 0.0
    due_date_str = date.today().strftime("%d %b %Y")
    if payload.installment_id:
        for asgn in student.fee_assignments:
            for inst in asgn.installments:
                if inst.id == payload.installment_id:
                    amount = float(inst.due_amount - inst.paid_amount)
                    due_date_str = inst.due_date.strftime("%d %b %Y")
                    break
    elif student.fee_assignments:
        amount = float(student.fee_assignments[0].remaining_balance)

    # Phone formatting (strip spaces, ensure +91 / country code)
    raw_phone = student.guardian_phone or student.user.phone or ""
    clean_phone = "".join(filter(str.isdigit, raw_phone))
    if len(clean_phone) == 10:
        clean_phone = "91" + clean_phone

    msg_text = format_whatsapp_message(
        template_type=payload.template_type,
        student_name=student.user.full_name,
        institute_name=institute.name,
        amount=amount,
        due_date=due_date_str,
        currency_symbol=institute.currency_symbol,
        upi_id=institute.upi_id or "apexinstitute@upi"
    )

    encoded_text = urllib.parse.quote(msg_text)
    wa_url = f"https://wa.me/{clean_phone}?text={encoded_text}" if clean_phone else ""

    reminder = Reminder(
        institute_id=institute.id,
        student_id=student.id,
        installment_id=payload.installment_id,
        sent_by_user_id=current_user.id,
        template_type=payload.template_type,
        recipient_phone=raw_phone,
        message_text=msg_text,
        whatsapp_url=wa_url,
        status="generated"
    )
    db.add(reminder)
    await db.commit()
    await db.refresh(reminder)

    return ReminderOut(
        id=reminder.id,
        student_id=student.id,
        student_name=student.user.full_name,
        recipient_phone=raw_phone,
        template_type=reminder.template_type,
        message_text=reminder.message_text,
        whatsapp_url=wa_url,
        status=reminder.status,
        created_at=reminder.created_at
    )
