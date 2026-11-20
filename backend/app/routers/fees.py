from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from decimal import Decimal
from datetime import date, timedelta
from app.database import get_db
from app.models.fee import FeePlan, StudentFeeAssignment, Installment
from app.models.user import User, StudentProfile
from app.models.academic import Course
from app.schemas.fee import FeePlanCreate, FeePlanOut, AssignFeePlanRequest, FeeLedgerOut
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

    base_amt = fee_plan.total_amount
    disc = Decimal(str(payload.discount_amount or 0.0))
    schol = Decimal(str(payload.scholarship_amount or 0.0))
    net = base_amt - disc - schol

    asgn = StudentFeeAssignment(
        student_id=student.id,
        fee_plan_id=fee_plan.id,
        base_amount=base_amt,
        discount_amount=disc,
        scholarship_amount=schol,
        discount_reason=payload.discount_reason,
        scholarship_reason=payload.scholarship_reason,
        net_payable=net,
        total_paid=Decimal("0.00"),
        remaining_balance=net,
        status="pending"
    )
    db.add(asgn)
    await db.flush()

    count = fee_plan.number_of_installments
    inst_due = (net / Decimal(count)).quantize(Decimal("0.01"))
    start_d = payload.custom_first_due_date or (date.today().replace(day=10))

    for i in range(1, count + 1):
        due_d = start_d + timedelta(days=30 * (i - 1))
        inst = Installment(
            fee_assignment_id=asgn.id,
            installment_number=i,
            title=f"Installment {i} ({due_d.strftime('%b %Y')})",
            due_amount=inst_due,
            paid_amount=Decimal("0.00"),
            due_date=due_d,
            status="pending"
        )
        db.add(inst)

    await db.commit()
    return {"message": "Fee plan assigned and installments scheduled successfully", "assignment_id": asgn.id}
