import csv
import io
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import date, timedelta
from decimal import Decimal
from app.database import get_db
from app.models.user import User, StudentProfile
from app.models.academic import Enrollment, Batch, SchoolClass, Course, AcademicYear
from app.models.fee import FeePlan, StudentFeeAssignment, Installment
from app.schemas.user import StudentCreate, StudentUpdate, StudentOut
from app.schemas.fee import FeeLedgerOut, InstallmentOut
from app.utils.security import hash_password
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/students", tags=["Student Management"])

async def get_next_student_id(db: AsyncSession, institute_id: str) -> str:
    stmt = (
        select(func.count(StudentProfile.id))
        .where(StudentProfile.institute_id == institute_id)
    )
    res = await db.execute(stmt)
    count = res.scalar() or 0
    return f"STU{str(count + 1).zfill(4)}"

@router.get("", response_model=List[StudentOut])
async def list_students(
    search: Optional[str] = Query(None),
    batch_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Enforce student isolation: if student role, only see own record
    if current_user.role == "student":
        stmt = (
            select(StudentProfile)
            .where(StudentProfile.user_id == current_user.id)
            .options(
                selectinload(StudentProfile.user),
                selectinload(StudentProfile.enrollments).selectinload(Enrollment.batch).selectinload(Batch.school_class).selectinload(SchoolClass.course),
                selectinload(StudentProfile.fee_assignments)
            )
        )
        res = await db.execute(stmt)
        profiles = res.scalars().all()
    else:
        stmt = (
            select(StudentProfile)
            .where(StudentProfile.institute_id == current_user.institute_id)
            .options(
                selectinload(StudentProfile.user),
                selectinload(StudentProfile.enrollments).selectinload(Enrollment.batch).selectinload(Batch.school_class).selectinload(SchoolClass.course),
                selectinload(StudentProfile.fee_assignments)
            )
            .order_by(StudentProfile.student_id.asc())
        )
        res = await db.execute(stmt)
        profiles = res.scalars().all()

    out = []
    for sp in profiles:
        # Filter in python or query
        if search:
            q = search.lower()
            name_match = q in sp.user.full_name.lower()
            id_match = q in sp.student_id.lower()
            phone_match = sp.user.phone and (q in sp.user.phone)
            if not (name_match or id_match or phone_match):
                continue
        if status_filter and sp.status != status_filter:
            continue

        enr = sp.enrollments[0] if sp.enrollments else None
        if batch_id and (not enr or enr.batch_id != batch_id):
            continue

        batch_name = enr.batch.name if enr and enr.batch else None
        class_name = enr.batch.school_class.name if enr and enr.batch and enr.batch.school_class else None
        course_name = enr.batch.school_class.course.name if enr and enr.batch and enr.batch.school_class and enr.batch.school_class.course else None

        fee_asgn = sp.fee_assignments[0] if sp.fee_assignments else None
        total_fee = float(fee_asgn.net_payable) if fee_asgn else 0.0
        total_paid = float(fee_asgn.total_paid) if fee_asgn else 0.0
        rem_balance = float(fee_asgn.remaining_balance) if fee_asgn else 0.0

        out.append(StudentOut(
            id=sp.id,
            user_id=sp.user_id,
            student_id=sp.student_id,
            full_name=sp.user.full_name,
            phone=sp.user.phone,
            email=sp.user.email,
            dob=sp.dob,
            gender=sp.gender,
            guardian_name=sp.guardian_name,
            guardian_phone=sp.guardian_phone,
            guardian_relation=sp.guardian_relation,
            address=sp.address,
            admission_date=sp.admission_date,
            status=sp.status,
            course_name=course_name,
            class_name=class_name,
            batch_name=batch_name,
            batch_id=enr.batch_id if enr else None,
            total_fee=total_fee,
            total_paid=total_paid,
            remaining_balance=rem_balance,
            created_at=sp.created_at
        ))
    return out

@router.post("", response_model=StudentOut)
async def create_student(
    payload: StudentCreate,
    current_user: User = Depends(require_roles(["admin", "staff"])),
    db: AsyncSession = Depends(get_db)
):
    student_id = await get_next_student_id(db, current_user.institute_id)
    initial_pwd = payload.custom_password or "student123"

    user = User(
        institute_id=current_user.institute_id,
        login_id=student_id,
        hashed_password=hash_password(initial_pwd),
        role="student",
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        is_active=True,
        must_change_password=True
    )
    db.add(user)
    await db.flush()

    profile = StudentProfile(
        user_id=user.id,
        institute_id=current_user.institute_id,
        student_id=student_id,
        dob=payload.dob,
        gender=payload.gender,
        guardian_name=payload.guardian_name,
        guardian_phone=payload.guardian_phone,
        guardian_relation=payload.guardian_relation,
        address=payload.address,
        admission_date=payload.admission_date or date.today(),
        status="active"
    )
    db.add(profile)
    await db.flush()

    batch_name = None
    class_name = None
    course_name = None

    # Handle Enrollment if batch provided
    if payload.batch_id:
        # Find active academic year
        ay_stmt = select(AcademicYear).where(
            AcademicYear.institute_id == current_user.institute_id,
            AcademicYear.is_current == True
        ).limit(1)
        ay_res = await db.execute(ay_stmt)
        current_ay = ay_res.scalar_one_or_none()

        enrollment = Enrollment(
            student_id=profile.id,
            batch_id=payload.batch_id,
            academic_year_id=current_ay.id if current_ay else payload.academic_year_id,
            roll_number=student_id.replace("STU", "R-"),
            status="active"
        )
        db.add(enrollment)

        # Batch info
        b_stmt = select(Batch).where(Batch.id == payload.batch_id).options(
            selectinload(Batch.school_class).selectinload(SchoolClass.course)
        )
        b_res = await db.execute(b_stmt)
        batch = b_res.scalar_one_or_none()
        if batch:
            batch_name = batch.name
            class_name = batch.school_class.name if batch.school_class else None
            course_name = batch.school_class.course.name if (batch.school_class and batch.school_class.course) else None

    # Handle Fee Plan assignment if provided
    total_fee = 0.0
    if payload.fee_plan_id:
        fp_stmt = select(FeePlan).where(FeePlan.id == payload.fee_plan_id)
        fp_res = await db.execute(fp_stmt)
        fee_plan = fp_res.scalar_one_or_none()
        if fee_plan:
            base_amt = fee_plan.total_amount
            disc = Decimal(str(payload.discount_amount or 0.0))
            schol = Decimal(str(payload.scholarship_amount or 0.0))
            net = base_amt - disc - schol
            total_fee = float(net)

            asgn = StudentFeeAssignment(
                student_id=profile.id,
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

            # Generate installments
            count = fee_plan.number_of_installments
            inst_due = (net / Decimal(count)).quantize(Decimal("0.01"))
            start_m = date.today().replace(day=10)
            for i in range(1, count + 1):
                due_d = start_m + timedelta(days=30 * (i - 1))
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
    await db.refresh(profile)

    return StudentOut(
        id=profile.id,
        user_id=user.id,
        student_id=student_id,
        full_name=user.full_name,
        phone=user.phone,
        email=user.email,
        dob=profile.dob,
        gender=profile.gender,
        guardian_name=profile.guardian_name,
        guardian_phone=profile.guardian_phone,
        guardian_relation=profile.guardian_relation,
        address=profile.address,
        admission_date=profile.admission_date,
        status=profile.status,
        course_name=course_name,
        class_name=class_name,
        batch_name=batch_name,
        batch_id=payload.batch_id,
        total_fee=total_fee,
        total_paid=0.0,
        remaining_balance=total_fee,
        created_at=profile.created_at
    )

@router.get("/{id}/ledger", response_model=FeeLedgerOut)
async def get_student_ledger(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(StudentProfile)
        .where(StudentProfile.id == id)
        .options(
            selectinload(StudentProfile.user),
            selectinload(StudentProfile.fee_assignments).selectinload(StudentFeeAssignment.fee_plan),
            selectinload(StudentProfile.fee_assignments).selectinload(StudentFeeAssignment.installments)
        )
    )
    res = await db.execute(stmt)
    student = res.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Strict isolation check
    if current_user.role == "student" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to another student's ledger")

    if not student.fee_assignments:
        raise HTTPException(status_code=404, detail="No fee structure assigned to this student")

    asgn = student.fee_assignments[0]
    plan = asgn.fee_plan

    inst_list = []
    for inst in asgn.installments:
        inst_list.append(InstallmentOut(
            id=inst.id,
            installment_number=inst.installment_number,
            title=inst.title,
            due_amount=float(inst.due_amount),
            paid_amount=float(inst.paid_amount),
            balance_amount=float(inst.due_amount - inst.paid_amount),
            due_date=inst.due_date,
            status=inst.status
        ))

    return FeeLedgerOut(
        assignment_id=asgn.id,
        student_id=student.id,
        student_name=student.user.full_name,
        login_id=student.student_id,
        fee_plan_name=plan.name if plan else "Standard Fee Plan",
        base_amount=float(asgn.base_amount),
        admission_fee=float(plan.admission_fee) if plan else 0.0,
        tuition_fee=float(plan.tuition_fee) if plan else 0.0,
        examination_fee=float(plan.examination_fee) if plan else 0.0,
        library_fee=float(plan.library_fee) if plan else 0.0,
        transport_fee=float(plan.transport_fee) if plan else 0.0,
        custom_fee=float(plan.custom_fee) if plan else 0.0,
        discount_amount=float(asgn.discount_amount),
        scholarship_amount=float(asgn.scholarship_amount),
        net_payable=float(asgn.net_payable),
        total_paid=float(asgn.total_paid),
        remaining_balance=float(asgn.remaining_balance),
        status=asgn.status,
        installments=inst_list
    )

@router.get("/export/csv")
async def export_students_csv(
    current_user: User = Depends(require_roles(["admin", "staff"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(StudentProfile)
        .where(StudentProfile.institute_id == current_user.institute_id)
        .options(
            selectinload(StudentProfile.user),
            selectinload(StudentProfile.fee_assignments)
        )
    )
    res = await db.execute(stmt)
    students = res.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Student ID", "Full Name", "Phone", "Email", "Guardian Name",
        "Guardian Phone", "Admission Date", "Status", "Total Fee", "Total Paid", "Remaining Balance"
    ])
    for s in students:
        asgn = s.fee_assignments[0] if s.fee_assignments else None
        writer.writerow([
            s.student_id,
            s.user.full_name,
            s.user.phone or "",
            s.user.email or "",
            s.guardian_name or "",
            s.guardian_phone or "",
            s.admission_date.strftime("%Y-%m-%d"),
            s.status,
            float(asgn.net_payable) if asgn else 0.0,
            float(asgn.total_paid) if asgn else 0.0,
            float(asgn.remaining_balance) if asgn else 0.0
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=students_export.csv"}
    )
