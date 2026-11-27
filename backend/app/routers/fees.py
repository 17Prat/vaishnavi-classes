from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from decimal import Decimal
from datetime import date, datetime, timedelta
from app.database import get_db
from app.models.fee import FeePlan, StudentFeeAssignment, Installment
from app.models.user import User, StudentProfile
from app.models.academic import Course
from app.schemas.fee import FeePlanCreate, FeePlanOut, AssignFeePlanRequest, UpdateDiscountRequest, FeeLedgerOut
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/fees", tags=["Fee Management"])

@router.get("/plans", response_model=List[FeePlanOut])
async def list_fee_plans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(FeePlan)
        .where(FeePlan.institute_id == current_user.institute_id)
        .options(selectinload(FeePlan.course))
        .order_by(FeePlan.created_at.desc())
    )
    res = await db.execute(stmt)
    plans = res.scalars().all()
    out = []
    for p in plans:
        out.append(FeePlanOut(
            id=p.id,
            course_id=p.course_id,
            course_name=p.course.name if p.course else None,
            name=p.name,
            description=p.description,
            admission_fee=float(p.admission_fee),
            tuition_fee=float(p.tuition_fee),
            examination_fee=float(p.examination_fee),
            library_fee=float(p.library_fee),
            transport_fee=float(p.transport_fee),
            custom_fee=float(p.custom_fee),
            total_amount=float(p.total_amount),
            installment_frequency=p.installment_frequency,
            number_of_installments=p.number_of_installments,
            is_active=p.is_active,
            created_at=p.created_at
        ))
    return out

@router.post("/plans", response_model=FeePlanOut)
async def create_fee_plan(
    payload: FeePlanCreate,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    total = (
        Decimal(str(payload.admission_fee)) +
        Decimal(str(payload.tuition_fee)) +
        Decimal(str(payload.examination_fee)) +
        Decimal(str(payload.library_fee)) +
        Decimal(str(payload.transport_fee)) +
        Decimal(str(payload.custom_fee))
    )

    plan = FeePlan(
        institute_id=current_user.institute_id,
        course_id=payload.course_id,
        name=payload.name,
        description=payload.description,
        admission_fee=Decimal(str(payload.admission_fee)),
        tuition_fee=Decimal(str(payload.tuition_fee)),
        examination_fee=Decimal(str(payload.examination_fee)),
        library_fee=Decimal(str(payload.library_fee)),
        transport_fee=Decimal(str(payload.transport_fee)),
        custom_fee=Decimal(str(payload.custom_fee)),
        total_amount=total,
        installment_frequency=payload.installment_frequency,
        number_of_installments=payload.number_of_installments,
        is_active=True
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)

    return FeePlanOut(
        id=plan.id,
        course_id=plan.course_id,
        course_name=None,
        name=plan.name,
        description=plan.description,
        admission_fee=float(plan.admission_fee),
        tuition_fee=float(plan.tuition_fee),
        examination_fee=float(plan.examination_fee),
        library_fee=float(plan.library_fee),
        transport_fee=float(plan.transport_fee),
        custom_fee=float(plan.custom_fee),
        total_amount=float(plan.total_amount),
        installment_frequency=plan.installment_frequency,
        number_of_installments=plan.number_of_installments,
        is_active=plan.is_active,
        created_at=plan.created_at
    )

@router.post("/assign")
async def assign_fee_plan(
    payload: AssignFeePlanRequest,
    current_user: User = Depends(require_roles(["admin", "staff"])),
    db: AsyncSession = Depends(get_db)
):
    # Check student
    s_stmt = select(StudentProfile).where(StudentProfile.id == payload.student_id)
    s_res = await db.execute(s_stmt)
    student = s_res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Check fee plan
    p_stmt = select(FeePlan).where(FeePlan.id == payload.fee_plan_id)
    p_res = await db.execute(p_stmt)
    fee_plan = p_res.scalar_one_or_none()
    if not fee_plan:
        raise HTTPException(status_code=404, detail="Fee Plan not found")

    base_amt = Decimal(str(payload.original_fee_amount)) if payload.original_fee_amount else fee_plan.total_amount
    disc_type = (payload.discount_type or "none").lower()
    disc_val = Decimal(str(payload.discount_value or 0.0))

    if disc_type == "percentage":
        disc = (base_amt * disc_val / Decimal("100")).quantize(Decimal("0.01"))
    elif disc_type == "fixed":
        disc = min(disc_val, base_amt).quantize(Decimal("0.01"))
    else:
        disc = Decimal(str(payload.discount_amount or 0.0)).quantize(Decimal("0.01"))
        if disc > Decimal("0.00"):
            disc_type = "fixed"
            disc_val = disc

    schol = Decimal(str(payload.scholarship_amount or 0.0))
    net = max(base_amt - disc - schol, Decimal("0.00"))

    asgn = StudentFeeAssignment(
        student_id=student.id,
        fee_plan_id=fee_plan.id,
        base_amount=base_amt,
        original_fee_amount=base_amt,
        discount_type=disc_type,
        discount_value=disc_val,
        discount_amount=disc,
        scholarship_amount=schol,
        discount_reason=payload.discount_reason,
        scholarship_reason=payload.scholarship_reason,
        discount_applied_by=current_user.id,
        discount_applied_at=datetime.utcnow(),
        net_payable=net,
        total_paid=Decimal("0.00"),
        remaining_balance=net,
        status="pending"
    )
    db.add(asgn)
    await db.flush()

    count = fee_plan.number_of_installments or 1
    inst_due = (net / Decimal(count)).quantize(Decimal("0.01"))
    start_d = payload.custom_first_due_date or (date.today().replace(day=10))

    for i in range(1, count + 1):
        due_d = start_d + timedelta(days=30 * (i - 1))
        if i == count:
            this_due = net - (inst_due * (count - 1))
        else:
            this_due = inst_due

        inst = Installment(
            fee_assignment_id=asgn.id,
            installment_number=i,
            title=f"Installment {i} ({due_d.strftime('%b %Y')})",
            due_amount=this_due,
            paid_amount=Decimal("0.00"),
            due_date=due_d,
            status="pending"
        )
        db.add(inst)

    await db.commit()
    return {
        "message": "Fee plan assigned and installments scheduled successfully",
        "assignment_id": asgn.id,
        "original_fees": float(base_amt),
        "discount_amount": float(disc),
        "net_payable": float(net)
    }

@router.put("/assignments/{assignment_id}/discount")
async def update_assignment_discount(
    assignment_id: str,
    payload: UpdateDiscountRequest,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(StudentFeeAssignment)
        .where(StudentFeeAssignment.id == assignment_id)
        .options(selectinload(StudentFeeAssignment.installments))
    )
    res = await db.execute(stmt)
    asgn = res.scalar_one_or_none()
    if not asgn:
        raise HTTPException(status_code=404, detail="Fee assignment not found")

    base_amt = asgn.original_fee_amount or asgn.base_amount
    disc_type = (payload.discount_type or "none").lower()
    disc_val = Decimal(str(payload.discount_value or 0.0))

    if disc_type == "percentage":
        disc = (base_amt * disc_val / Decimal("100")).quantize(Decimal("0.01"))
    elif disc_type == "fixed":
        disc = min(disc_val, base_amt).quantize(Decimal("0.01"))
    else:
        disc = Decimal("0.00")
        disc_val = Decimal("0.00")

    schol = asgn.scholarship_amount or Decimal("0.00")
    new_net = max(base_amt - disc - schol, Decimal("0.00"))

    # Update ledger
    asgn.discount_type = disc_type
    asgn.discount_value = disc_val
    asgn.discount_amount = disc
    if payload.discount_reason is not None:
        asgn.discount_reason = payload.discount_reason
    asgn.discount_applied_by = current_user.id
    asgn.discount_applied_at = datetime.utcnow()
    asgn.net_payable = new_net
    asgn.remaining_balance = max(new_net - asgn.total_paid, Decimal("0.00"))
    if asgn.remaining_balance <= Decimal("0.00") and asgn.total_paid > Decimal("0.00"):
        asgn.status = "paid"
    elif asgn.total_paid > Decimal("0.00"):
        asgn.status = "partial"
    else:
        asgn.status = "pending"

    # Re-allocate unpaid balance across pending installments
    unpaid_installments = [i for i in asgn.installments if i.status != "paid"]
    if unpaid_installments:
        total_remaining = asgn.remaining_balance
        count = len(unpaid_installments)
        share = (total_remaining / Decimal(count)).quantize(Decimal("0.01"))
        for idx, inst in enumerate(unpaid_installments):
            if idx == count - 1:
                inst.due_amount = inst.paid_amount + (total_remaining - (share * (count - 1)))
            else:
                inst.due_amount = inst.paid_amount + share
            if inst.paid_amount >= inst.due_amount:
                inst.status = "paid"
            elif inst.paid_amount > Decimal("0.00"):
                inst.status = "partial"
            else:
                inst.status = "pending"

    await db.commit()
    return {
        "message": "Discount updated successfully",
        "original_fees": float(base_amt),
        "discount_type": disc_type,
        "discount_amount": float(disc),
        "net_payable": float(new_net),
        "remaining_balance": float(asgn.remaining_balance)
    }

@router.delete("/assignments/{assignment_id}/discount")
async def remove_assignment_discount(
    assignment_id: str,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    return await update_assignment_discount(
        assignment_id,
        UpdateDiscountRequest(discount_type="none", discount_value=0.0, discount_reason="Discount removed"),
        current_user,
        db
    )
