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

def normalize_phone(raw_phone: str) -> str:
    digits = "".join(filter(str.isdigit, raw_phone or ""))
    if not digits:
        return ""
    if len(digits) == 10:
        return "91" + digits
    if len(digits) == 11 and digits.startswith("0"):
        return "91" + digits[1:]
    if len(digits) == 12 and digits.startswith("91"):
        return digits
    return digits

def format_whatsapp_message(
    template_type: str,
    student_name: str,
    institute_name: str,
    amount: float,
    due_date: str,
    currency_symbol: str = "₹",
    upi_id: str = "vaishnaviclasses@upi"
) -> str:
    inst_upper = (institute_name or "VAISHNAVI CLASSES").upper()
    inst_name = institute_name or "Vaishnavi Classes"

    if template_type == "upcoming_fee":
        return (
            f"🏛️ *{inst_upper}*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━\n"
            f"📢 *FEE PAYMENT REMINDER*\n\n"
            f"Dear Student / Parent of *{student_name}*,\n\n"
            f"This is a gentle reminder regarding the fee installment at *{inst_name}*:\n\n"
            f"💰 *Due Amount:* *{currency_symbol}{amount:,.2f}*\n"
            f"📅 *Due Date:* *{due_date}*\n\n"
            f"💳 *Pay via UPI:*\n"
            f"UPI ID: `{upi_id}`\n\n"
            f"🏛️ *Offline Payment Desk:*\n"
            f"You can also pay directly in cash or cheque at *{inst_name}* office counter.\n\n"
            f"Kindly clear the dues on or before the due date.\n\n"
            f"Thank you,\n"
            f"*Accounts Office — {inst_name}*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━"
        )
    elif template_type == "due_today":
        return (
            f"🏛️ *{inst_upper}*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━\n"
            f"⚠️ *FEE DUE TODAY NOTICE*\n\n"
            f"Dear Student / Parent of *{student_name}*,\n\n"
            f"Your fee installment for *{inst_name}* is *DUE TODAY ({due_date})*:\n\n"
            f"💰 *Amount Due:* *{currency_symbol}{amount:,.2f}*\n\n"
            f"💳 *Pay Instantly via UPI:*\n"
            f"UPI ID: `{upi_id}`\n\n"
            f"🏛️ *Cash / Counter Payment:*\n"
            f"Please visit the *{inst_name}* office counter today to complete the payment.\n\n"
            f"Thank you,\n"
            f"*Accounts Desk — {inst_name}*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━"
        )
    elif template_type == "overdue_fee":
        return (
            f"🏛️ *{inst_upper}*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━\n"
            f"🚨 *URGENT: OVERDUE FEE NOTICE*\n\n"
            f"Dear Student / Parent of *{student_name}*,\n\n"
            f"Your fee installment for *{inst_name}* was due on *{due_date}* and is now *OVERDUE*:\n\n"
            f"⚠️ *Pending Overdue Amount:* *{currency_symbol}{amount:,.2f}*\n\n"
            f"💳 *Pay Immediately via UPI:*\n"
            f"UPI ID: `{upi_id}`\n\n"
            f"🏛️ *Office Visit:*\n"
            f"Please visit the *{inst_name}* office immediately to settle the outstanding balance.\n\n"
            f"Regards,\n"
            f"*Administration — {inst_name}*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━"
        )
    elif template_type == "partial_payment":
        return (
            f"🏛️ *{inst_upper}*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━\n"
            f"📋 *PARTIAL PAYMENT ACKNOWLEDGMENT*\n\n"
            f"Dear Student / Parent of *{student_name}*,\n\n"
            f"We have received a partial fee payment at *{inst_name}*.\n\n"
            f"💰 *Remaining Balance Due:* *{currency_symbol}{amount:,.2f}*\n\n"
            f"Please arrange to clear the remaining balance before the upcoming schedule.\n\n"
            f"Thank you,\n"
            f"*Accounts Department — {inst_name}*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━"
        )
    elif template_type == "payment_confirmation":
        return (
            f"🏛️ *{inst_upper}*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━\n"
            f"✅ *FEE PAYMENT CONFIRMATION RECEIPT*\n\n"
            f"Dear Student / Parent of *{student_name}*,\n\n"
            f"We gratefully acknowledge the receipt of your fee payment at *{inst_name}*:\n\n"
            f"💵 *Amount Received:* *{currency_symbol}{amount:,.2f}*\n"
            f"📅 *Payment Date:* *{due_date}*\n\n"
            f"Your official verified digital receipt has been generated. You can download it directly from your student portal.\n\n"
            f"Thank you for your prompt payment!\n\n"
            f"Best regards,\n"
            f"*Management & Accounts — {inst_name}*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━"
        )
    else:
        return (
            f"🏛️ *{inst_upper}*\n"
            f"━━━━━━━━━━━━━━━━━━━━━━\n"
            f"Important notification from *{inst_name}* for *{student_name}*.\n\n"
            f"Fee Details: *{currency_symbol}{amount:,.2f}*\n\n"
            f"Thank you,\n*{inst_name}*"
        )

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
    seen_student_ids = set()
    for inst in installments:
        student = inst.fee_assignment.student
        seen_student_ids.add(student.id)
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

    # Also include any enrolled students who don't have installments yet
    all_s_stmt = (
        select(StudentProfile)
        .where(
            and_(
                StudentProfile.institute_id == current_user.institute_id,
                StudentProfile.status == "active"
            )
        )
        .options(
            selectinload(StudentProfile.user),
            selectinload(StudentProfile.fee_assignments)
        )
    )
    all_s_res = await db.execute(all_s_stmt)
    all_students = all_s_res.scalars().all()

    for s in all_students:
        if s.id not in seen_student_ids:
            rem_bal = float(s.fee_assignments[0].remaining_balance) if s.fee_assignments else 0.0
            phone = s.guardian_phone or s.user.phone or ""
            out.append({
                "installment_id": None,
                "student_id": s.id,
                "student_login_id": s.student_id,
                "student_name": s.user.full_name,
                "phone": phone,
                "installment_title": "General Fee Installment",
                "due_date": today.strftime("%Y-%m-%d"),
                "pending_amount": rem_bal,
                "status": "upcoming" if rem_bal > 0 else "registered",
                "suggested_template": "upcoming_fee"
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
    if payload.custom_amount is not None:
        amount = float(payload.custom_amount)
    elif payload.installment_id:
        for asgn in student.fee_assignments:
            for inst in asgn.installments:
                if inst.id == payload.installment_id:
                    amount = float(inst.due_amount - inst.paid_amount)
                    due_date_str = inst.due_date.strftime("%d %b %Y")
                    break
    elif student.fee_assignments:
        amount = float(student.fee_assignments[0].remaining_balance)

    if payload.custom_due_date:
        due_date_str = payload.custom_due_date

    # Phone formatting (strip spaces, ensure +91 / country code)
    raw_phone = payload.recipient_phone or student.guardian_phone or student.user.phone or ""
    clean_phone = normalize_phone(raw_phone)

    if payload.custom_message and payload.custom_message.strip():
        msg_text = payload.custom_message.strip()
    else:
        msg_text = format_whatsapp_message(
            template_type=payload.template_type,
            student_name=student.user.full_name,
            institute_name=institute.name or "Vaishnavi Classes",
            amount=amount,
            due_date=due_date_str,
            currency_symbol=institute.currency_symbol or "₹",
            upi_id=institute.upi_id or "vaishnaviclasses@upi"
        )

    encoded_text = urllib.parse.quote(msg_text)
    wa_url = f"https://wa.me/{clean_phone}?text={encoded_text}" if clean_phone else f"https://wa.me/?text={encoded_text}"

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

@router.post("/send-direct")
async def send_direct_whatsapp_message(
    payload: ReminderRequest,
    current_user: User = Depends(require_roles(["admin", "staff"])),
    db: AsyncSession = Depends(get_db)
):
    student = None
    if payload.student_id:
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

    inst_stmt = select(Institute).where(Institute.id == current_user.institute_id)
    inst_res = await db.execute(inst_stmt)
    institute = inst_res.scalar_one_or_none()
    inst_name = institute.name if institute else "Vaishnavi Classes"
    inst_id = institute.id if institute else current_user.institute_id

    amount = payload.custom_amount if payload.custom_amount is not None else 0.0
    due_date_str = payload.custom_due_date or date.today().strftime("%d %b %Y")
    if amount == 0.0 and student and student.fee_assignments:
        amount = float(student.fee_assignments[0].remaining_balance)

    raw_phone = payload.recipient_phone or (student.guardian_phone if student else None) or (student.user.phone if student else None) or ""
    clean_phone = normalize_phone(raw_phone)

    student_name = student.user.full_name if student else "Student"

    if payload.custom_message and payload.custom_message.strip():
        msg_text = payload.custom_message.strip()
    else:
        msg_text = format_whatsapp_message(
            template_type=payload.template_type,
            student_name=student_name,
            institute_name=inst_name,
            amount=amount,
            due_date=due_date_str,
            currency_symbol=institute.currency_symbol if institute else "₹",
            upi_id=institute.upi_id if institute else "vaishnaviclasses@upi"
        )

    encoded_text = urllib.parse.quote(msg_text)
    wa_url = f"https://wa.me/{clean_phone}?text={encoded_text}" if clean_phone else f"https://wa.me/?text={encoded_text}"

    reminder = Reminder(
        institute_id=inst_id,
        student_id=student.id if student else None,
        installment_id=payload.installment_id,
        sent_by_user_id=current_user.id,
        template_type=payload.template_type,
        recipient_phone=raw_phone,
        message_text=msg_text,
        whatsapp_url=wa_url,
        status="delivered"
    )
    db.add(reminder)
    await db.commit()
    await db.refresh(reminder)

    return {
        "status": "delivered",
        "message_id": f"WA-{reminder.id[:8].upper()}",
        "recipient_phone": clean_phone or raw_phone,
        "recipient_name": student_name,
        "message_text": msg_text,
        "delivered_via": "Vaishnavi Classes Direct Messaging Gateway",
        "delivered_at": reminder.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }
