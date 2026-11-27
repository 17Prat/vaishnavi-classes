from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import date, datetime, timedelta
from decimal import Decimal
from app.database import get_db
from app.models.payment import Payment, PaymentAllocation, Receipt
from app.models.fee import StudentFeeAssignment, Installment
from app.models.user import User, StudentProfile
from app.models.academic import Enrollment, Batch, SchoolClass, Course
from app.models.institute import Institute, InstituteSettings
from app.models.audit import AuditLog
from app.schemas.payment import (
    PaymentRecordRequest, StudentUPIPaymentRequest,
    VerifyPaymentRequest, ReversePaymentRequest, PaymentOut
)
from app.services.receipt_generator import create_receipt_pdf
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/payments", tags=["Payment Management"])

async def generate_receipt_for_payment(payment: Payment, db: AsyncSession) -> Receipt:
    # Find student, course, batch
    s_stmt = (
        select(StudentProfile)
        .where(StudentProfile.id == payment.student_id)
        .options(
            selectinload(StudentProfile.user),
            selectinload(StudentProfile.enrollments).selectinload(Enrollment.batch).selectinload(Batch.school_class).selectinload(SchoolClass.course),
            selectinload(StudentProfile.fee_assignments)
        )
    )
    s_res = await db.execute(s_stmt)
    student = s_res.scalar_one()

    inst_stmt = select(Institute).where(Institute.id == payment.institute_id)
    inst_res = await db.execute(inst_stmt)
    institute = inst_res.scalar_one()

    # Load institute settings for signature
    sett_res = await db.execute(select(InstituteSettings).where(InstituteSettings.institute_id == institute.id))
    sett = sett_res.scalar_one_or_none()

    # Get collector name
    collected_by = "Admin / Accounts"
    if payment.collected_by_user_id:
        u_res = await db.execute(select(User).where(User.id == payment.collected_by_user_id))
        collector = u_res.scalar_one_or_none()
        if collector:
            collected_by = collector.full_name

    # Count receipts for numbering
    r_count = await db.execute(select(func.count(Receipt.id)))
    num_seq = (r_count.scalar() or 0) + 1
    receipt_num = f"REC-2026-{str(num_seq).zfill(4)}"

    enr = student.enrollments[0] if student.enrollments else None
    batch_name = enr.batch.name if enr and enr.batch else "Regular"
    course_name = enr.batch.school_class.course.name if enr and enr.batch and enr.batch.school_class and enr.batch.school_class.course else "General Coaching"

    fee_asgn = student.fee_assignments[0] if student.fee_assignments else None
    rem_balance = float(fee_asgn.remaining_balance) if fee_asgn else 0.0
    orig_fee = float(fee_asgn.original_fee_amount or fee_asgn.base_amount) if fee_asgn else float(payment.amount)
    disc_amt = float(fee_asgn.discount_amount) if fee_asgn else 0.0
    disc_type = fee_asgn.discount_type if fee_asgn else "none"
    disc_val = float(fee_asgn.discount_value or 0.0) if fee_asgn else 0.0
    disc_reason = fee_asgn.discount_reason if fee_asgn else None
    net_payable = float(fee_asgn.net_payable) if fee_asgn else float(payment.amount)

    pdf_filename = f"{receipt_num}.pdf"
    receipt_dict = {
        "receipt_number": receipt_num,
        "payment_date": payment.payment_date.strftime("%d %b %Y"),
        "institute_name": institute.name,
        "institute_code": institute.code,
        "institute_address": institute.address,
        "institute_phone": institute.phone,
        "currency_symbol": "₹",
        "student_name": student.user.full_name,
        "student_id": student.student_id,
        "course_name": course_name,
        "batch_name": batch_name,
        "original_fees": orig_fee,
        "discount_amount": disc_amt,
        "discount_type": disc_type,
        "discount_value": disc_val,
        "discount_reason": disc_reason,
        "net_payable": net_payable,
        "amount_paid": float(payment.amount),
        "balance_after": rem_balance,
        "payment_method": payment.payment_method.replace("_", " ").title(),
        "transaction_ref": payment.transaction_ref or "N/A",
        "installment_title": "Academic & Tuition Installment",
        "collected_by": collected_by,
        "signatory_name": sett.signatory_name if sett else "Director / Authorized Signatory",
        "signatory_designation": sett.signatory_designation if sett else "Authorized Signatory",
        "signature_image_path": sett.signature_image_path if (sett and sett.signature_enabled) else None,
        "signature_enabled": bool(sett.signature_enabled) if sett else False,
        "verification_url": f"http://localhost:3000/verify-receipt/{receipt_num}"
    }

    create_receipt_pdf(receipt_dict, pdf_filename)

    receipt = Receipt(
        payment_id=payment.id,
        receipt_number=receipt_num,
        original_amount=Decimal(str(orig_fee)),
        discount_amount=Decimal(str(disc_amt)),
        final_payable=Decimal(str(net_payable)),
        amount_paid=payment.amount,
        balance_after=Decimal(str(rem_balance)),
        signatory_name=sett.signatory_name if sett else None,
        signatory_designation=sett.signatory_designation if sett else None,
        signature_image_path=sett.signature_image_path if (sett and sett.signature_enabled) else None,
        qr_code_data=f"http://localhost:3000/verify-receipt/{receipt_num}",
        pdf_filename=pdf_filename,
        generated_at=datetime.utcnow()
    )
    db.add(receipt)
    return receipt

@router.get("", response_model=List[PaymentOut])
async def list_payments(
    status_filter: Optional[str] = Query(None),
    student_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Payment)
        .where(Payment.institute_id == current_user.institute_id)
        .options(
            selectinload(Payment.student).selectinload(StudentProfile.user),
            selectinload(Payment.student).selectinload(StudentProfile.enrollments).selectinload(Enrollment.batch).selectinload(Batch.school_class).selectinload(SchoolClass.course),
            selectinload(Payment.receipt)
        )
        .order_by(Payment.created_at.desc())
    )

    if current_user.role == "student":
        # Restrict to own student profile
        if not current_user.student_profile:
            return []
        stmt = stmt.where(Payment.student_id == current_user.student_profile.id)
    elif student_id:
        stmt = stmt.where(Payment.student_id == student_id)

    if status_filter:
        stmt = stmt.where(Payment.status == status_filter)

    res = await db.execute(stmt)
    payments = res.scalars().all()

    out = []
    for p in payments:
        student = p.student
        enr = student.enrollments[0] if student and student.enrollments else None
        course_name = enr.batch.school_class.course.name if enr and enr.batch and enr.batch.school_class and enr.batch.school_class.course else None

        out.append(PaymentOut(
            id=p.id,
            student_id=p.student_id,
            student_name=student.user.full_name if student else "Unknown",
            student_login_id=student.student_id if student else "N/A",
            course_name=course_name,
            amount=float(p.amount),
            payment_method=p.payment_method,
            transaction_ref=p.transaction_ref,
            payment_date=p.payment_date,
            status=p.status,
            collected_by="Staff / System",
            receipt_number=p.receipt.receipt_number if p.receipt else None,
            notes=p.notes,
            created_at=p.created_at
        ))
    return out

@router.post("/record")
async def record_payment(
    payload: PaymentRecordRequest,
    current_user: User = Depends(require_roles(["admin", "staff"])),
    db: AsyncSession = Depends(get_db)
):
    # Check student
    s_stmt = (
        select(StudentProfile)
        .where(StudentProfile.id == payload.student_id)
        .options(
            selectinload(StudentProfile.fee_assignments).selectinload(StudentFeeAssignment.installments)
        )
    )
    s_res = await db.execute(s_stmt)
    student = s_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    pay_amount = Decimal(str(payload.amount))

    if not student.fee_assignments:
        # Check or create a standard fee plan for the institute
        from app.models.fee import FeePlan
        fp_res = await db.execute(select(FeePlan).where(FeePlan.institute_id == current_user.institute_id))
        fee_plan = fp_res.scalars().first()
        if not fee_plan:
            fee_plan = FeePlan(
                institute_id=current_user.institute_id,
                name="General Tuition & Admission Plan",
                description="Standard classes fee structure",
                tuition_fee=pay_amount,
                total_amount=pay_amount,
                installment_frequency="full",
                number_of_installments=1,
                is_active=True
            )
            db.add(fee_plan)
            await db.flush()

        fee_asgn = StudentFeeAssignment(
            student_id=student.id,
            fee_plan_id=fee_plan.id,
            base_amount=pay_amount,
            discount_amount=Decimal("0.00"),
            scholarship_amount=Decimal("0.00"),
            net_payable=pay_amount,
            total_paid=Decimal("0.00"),
            remaining_balance=pay_amount,
            status="pending"
        )
        db.add(fee_asgn)
        await db.flush()

        inst = Installment(
            fee_assignment_id=fee_asgn.id,
            title="Tuition & Admission Fee",
            installment_number=1,
            due_amount=pay_amount,
            due_date=payload.payment_date or date.today(),
            paid_amount=Decimal("0.00"),
            status="pending"
        )
        db.add(inst)
        await db.flush()
    else:
        fee_asgn = student.fee_assignments[0]

    # Duplicate check within 5 minutes with same amount & ref
    dup_stmt = select(Payment).where(
        and_(
            Payment.student_id == student.id,
            Payment.amount == pay_amount,
            Payment.transaction_ref == payload.transaction_ref,
            Payment.created_at >= datetime.utcnow() - timedelta(minutes=5)
        )
    )
    dup_res = await db.execute(dup_stmt)
    if dup_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Duplicate payment detected within last 5 minutes")

    payment = Payment(
        institute_id=current_user.institute_id,
        student_id=student.id,
        collected_by_user_id=current_user.id,
        amount=pay_amount,
        payment_method=payload.payment_method,
        transaction_ref=payload.transaction_ref,
        payment_date=payload.payment_date or date.today(),
        status="verified",
        notes=payload.notes
    )
    db.add(payment)
    await db.flush()

    # Query installments explicitly to ensure async safety
    inst_stmt = (
        select(Installment)
        .where(Installment.fee_assignment_id == fee_asgn.id)
        .order_by(Installment.installment_number.asc())
    )
    inst_res = await db.execute(inst_stmt)
    installments_list = inst_res.scalars().all()

    # Allocate across installments
    remaining_to_allocate = pay_amount
    for inst in installments_list:
        if remaining_to_allocate <= 0:
            break
        pending_on_inst = inst.due_amount - inst.paid_amount
        if pending_on_inst > 0:
            alloc_amt = min(remaining_to_allocate, pending_on_inst)
            alloc = PaymentAllocation(
                payment_id=payment.id,
                installment_id=inst.id,
                allocated_amount=alloc_amt
            )
            db.add(alloc)
            inst.paid_amount += alloc_amt
            remaining_to_allocate -= alloc_amt
            if inst.paid_amount >= inst.due_amount:
                inst.status = "paid"
            else:
                inst.status = "partial"

    # Update ledger balance
    fee_asgn.total_paid += pay_amount
    fee_asgn.remaining_balance -= pay_amount
    if fee_asgn.remaining_balance <= 0:
        fee_asgn.status = "paid"
    else:
        fee_asgn.status = "partial"

    # Generate verified receipt
    receipt = await generate_receipt_for_payment(payment, db)

    # Audit Log
    audit = AuditLog(
        institute_id=current_user.institute_id,
        user_id=current_user.id,
        action="PAYMENT_RECORDED",
        target_type="payment",
        target_id=payment.id,
        details={
            "amount": float(pay_amount),
            "receipt_number": receipt.receipt_number,
            "method": payload.payment_method,
            "student_id": student.student_id
        }
    )
    db.add(audit)
    await db.commit()

    return {
        "message": "Payment recorded and receipt generated successfully",
        "payment_id": payment.id,
        "receipt_number": receipt.receipt_number,
        "pdf_url": f"/receipts-pdf/{receipt.pdf_filename}"
    }

@router.post("/submit-upi")
async def student_submit_upi(
    payload: StudentUPIPaymentRequest,
    current_user: User = Depends(require_roles(["student"])),
    db: AsyncSession = Depends(get_db)
):
    if not current_user.student_profile:
        raise HTTPException(status_code=400, detail="Student profile not found")

    student_id = current_user.student_profile.id
    pay_amt = Decimal(str(payload.amount))

    # Check for duplicate UTR
    dup_stmt = select(Payment).where(
        and_(
            Payment.transaction_ref == payload.transaction_ref.strip(),
            Payment.status.in_(["verified", "pending_verification"])
        )
    )
    dup_res = await db.execute(dup_stmt)
    if dup_res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="This UPI Transaction / UTR number has already been submitted.")

    payment = Payment(
        institute_id=current_user.institute_id,
        student_id=student_id,
        amount=pay_amt,
        payment_method="upi",
        transaction_ref=payload.transaction_ref.strip(),
        payment_date=date.today(),
        status="pending_verification",
        notes=f"Student submitted UPI: {payload.notes or 'Awaiting verification'}"
    )
    db.add(payment)
    await db.commit()

    return {
        "message": "UPI Reference submitted successfully. Status is Pending Verification.",
        "payment_id": payment.id,
        "status": "pending_verification"
    }

@router.post("/{id}/verify")
async def verify_payment(
    id: str,
    payload: VerifyPaymentRequest,
    current_user: User = Depends(require_roles(["admin", "staff"])),
    db: AsyncSession = Depends(get_db)
):
    p_stmt = (
        select(Payment)
        .where(Payment.id == id, Payment.institute_id == current_user.institute_id)
        .options(
            selectinload(Payment.student).selectinload(StudentProfile.fee_assignments).selectinload(StudentFeeAssignment.installments)
        )
    )
    p_res = await db.execute(p_stmt)
    payment = p_res.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    if payment.status != "pending_verification":
        raise HTTPException(status_code=400, detail=f"Payment is already '{payment.status}'")

    if payload.action == "reject":
        payment.status = "rejected"
        payment.rejection_reason = payload.notes or "Rejected by staff / bank reconciliation mismatch"
        await db.commit()
        return {"message": "Payment rejected", "status": "rejected"}

    # VERIFY: allocate to installments & update ledger
    payment.status = "verified"
    payment.collected_by_user_id = current_user.id
    student = payment.student
    fee_asgn = student.fee_assignments[0]

    inst_stmt = (
        select(Installment)
        .where(Installment.fee_assignment_id == fee_asgn.id)
        .order_by(Installment.installment_number.asc())
    )
    inst_res = await db.execute(inst_stmt)
    v_installments = inst_res.scalars().all()

    remaining_to_allocate = payment.amount
    for inst in v_installments:
        if remaining_to_allocate <= 0:
            break
        pending_on_inst = inst.due_amount - inst.paid_amount
        if pending_on_inst > 0:
            alloc_amt = min(remaining_to_allocate, pending_on_inst)
            alloc = PaymentAllocation(
                payment_id=payment.id,
                installment_id=inst.id,
                allocated_amount=alloc_amt
            )
            db.add(alloc)
            inst.paid_amount += alloc_amt
            remaining_to_allocate -= alloc_amt
            if inst.paid_amount >= inst.due_amount:
                inst.status = "paid"
            else:
                inst.status = "partial"

    fee_asgn.total_paid += payment.amount
    fee_asgn.remaining_balance -= payment.amount
    if fee_asgn.remaining_balance <= 0:
        fee_asgn.status = "paid"
    else:
        fee_asgn.status = "partial"

    # Generate receipt
    receipt = await generate_receipt_for_payment(payment, db)

    # Audit log
    audit = AuditLog(
        institute_id=current_user.institute_id,
        user_id=current_user.id,
        action="PAYMENT_VERIFIED",
        target_type="payment",
        target_id=payment.id,
        details={
            "amount": float(payment.amount),
            "receipt_number": receipt.receipt_number,
            "ref": payment.transaction_ref
        }
    )
    db.add(audit)
    await db.commit()

    return {
        "message": "Payment successfully verified and receipt issued",
        "receipt_number": receipt.receipt_number,
        "pdf_url": f"/receipts-pdf/{receipt.pdf_filename}"
    }

@router.post("/{id}/reverse")
async def reverse_payment(
    id: str,
    payload: ReversePaymentRequest,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    p_stmt = (
        select(Payment)
        .where(Payment.id == id, Payment.institute_id == current_user.institute_id)
        .options(
            selectinload(Payment.allocations).selectinload(PaymentAllocation.installment),
            selectinload(Payment.student).selectinload(StudentProfile.fee_assignments)
        )
    )
    p_res = await db.execute(p_stmt)
    payment = p_res.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.status != "verified":
        raise HTTPException(status_code=400, detail="Only verified payments can be reversed")

    # Undo allocations
    for alloc in payment.allocations:
        inst = alloc.installment
        inst.paid_amount -= alloc.allocated_amount
        if inst.paid_amount <= 0:
            inst.status = "pending"
        else:
            inst.status = "partial"

    # Undo ledger
    fee_asgn = payment.student.fee_assignments[0]
    fee_asgn.total_paid -= payment.amount
    fee_asgn.remaining_balance += payment.amount
    fee_asgn.status = "partial" if fee_asgn.total_paid > 0 else "pending"

    payment.status = "reversed"
    payment.reversal_reason = payload.reason
    payment.reversed_at = datetime.utcnow()

    # Audit log
    audit = AuditLog(
        institute_id=current_user.institute_id,
        user_id=current_user.id,
        action="PAYMENT_REVERSED",
        target_type="payment",
        target_id=payment.id,
        details={"reason": payload.reason, "reversed_amount": float(payment.amount)}
    )
    db.add(audit)
    await db.commit()

    return {"message": "Payment reversed successfully and ledger restored", "status": "reversed"}
