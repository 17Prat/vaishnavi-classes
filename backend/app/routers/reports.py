import csv
import io
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import date, timedelta
from app.database import get_db
from app.models.payment import Payment
from app.models.fee import StudentFeeAssignment, Installment
from app.models.user import User, StudentProfile
from app.models.academic import Enrollment, Batch, SchoolClass, Course
from app.schemas.report import DefaulterStudentOut
from app.utils.dependencies import require_roles

router = APIRouter(prefix="/reports", tags=["Reports & Analytics"])

@router.get("/collection-summary")
async def get_collection_summary(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(require_roles(["admin", "staff"])),
    db: AsyncSession = Depends(get_db)
):
    inst_id = current_user.institute_id
    today = date.today()
    s_date = start_date or (today - timedelta(days=30))
    e_date = end_date or today

    stmt = (
        select(Payment.payment_method, func.sum(Payment.amount), func.count(Payment.id))
        .where(
            and_(
                Payment.institute_id == inst_id,
                Payment.status == "verified",
                Payment.payment_date >= s_date,
                Payment.payment_date <= e_date
            )
        )
        .group_by(Payment.payment_method)
    )
    res = await db.execute(stmt)
    breakdown = []
    total_val = 0.0
    total_tx = 0
    for row in res.all():
        method, amt, count = row
        total_val += float(amt)
        total_tx += count
        breakdown.append({
            "method": method.replace("_", " ").title(),
            "amount": float(amt),
            "transactions": count
        })

    return {
        "start_date": s_date.strftime("%Y-%m-%d"),
        "end_date": e_date.strftime("%Y-%m-%d"),
        "total_collected": total_val,
        "total_transactions": total_tx,
        "payment_methods": breakdown
    }

@router.get("/defaulters", response_model=List[DefaulterStudentOut])
async def get_defaulters(
    current_user: User = Depends(require_roles(["admin", "staff"])),
    db: AsyncSession = Depends(get_db)
):
    inst_id = current_user.institute_id
    today = date.today()

    stmt = (
        select(Installment)
        .join(StudentFeeAssignment)
        .join(StudentProfile)
        .where(
            and_(
                StudentProfile.institute_id == inst_id,
                Installment.due_date < today,
                Installment.status.in_(["pending", "partial", "overdue"])
            )
        )
        .options(
            selectinload(Installment.fee_assignment).selectinload(StudentFeeAssignment.student).selectinload(StudentProfile.user),
            selectinload(Installment.fee_assignment).selectinload(StudentFeeAssignment.student).selectinload(StudentProfile.enrollments).selectinload(Enrollment.batch).selectinload(Batch.school_class).selectinload(SchoolClass.course)
        )
        .order_by(Installment.due_date.asc())
    )
    res = await db.execute(stmt)
    overdue_insts = res.scalars().all()

    out = []
    seen_students = set()
    for inst in overdue_insts:
        student = inst.fee_assignment.student
        if student.id in seen_students:
            continue
        seen_students.add(student.id)

        overdue_amt = float(inst.due_amount - inst.paid_amount)
        days_over = (today - inst.due_date).days

        enr = student.enrollments[0] if student.enrollments else None
        b_name = enr.batch.name if enr and enr.batch else None
        c_name = enr.batch.school_class.course.name if enr and enr.batch and enr.batch.school_class and enr.batch.school_class.course else None

        out.append(DefaulterStudentOut(
            student_profile_id=student.id,
            student_login_id=student.student_id,
            student_name=student.user.full_name,
            guardian_phone=student.guardian_phone,
            student_phone=student.user.phone,
            course_name=c_name,
            batch_name=b_name,
            overdue_amount=overdue_amt,
            days_overdue=days_over,
            due_date=inst.due_date
        ))
    return out

@router.get("/export/csv")
async def export_financial_report_csv(
    report_type: str = Query("payments"), # payments, fee_ledger, defaulters
    current_user: User = Depends(require_roles(["admin", "staff"])),
    db: AsyncSession = Depends(get_db)
):
    inst_id = current_user.institute_id
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "payments":
        writer.writerow(["Receipt No", "Date", "Student ID", "Student Name", "Amount", "Method", "Ref", "Status"])
        stmt = (
            select(Payment)
            .where(Payment.institute_id == inst_id)
            .options(
                selectinload(Payment.student).selectinload(StudentProfile.user),
                selectinload(Payment.receipt)
            )
            .order_by(Payment.payment_date.desc())
        )
        res = await db.execute(stmt)
        for p in res.scalars().all():
            writer.writerow([
                p.receipt.receipt_number if p.receipt else "N/A",
                p.payment_date.strftime("%Y-%m-%d"),
                p.student.student_id if p.student else "N/A",
                p.student.user.full_name if p.student and p.student.user else "N/A",
                float(p.amount),
                p.payment_method,
                p.transaction_ref or "",
                p.status
            ])
    else:
        writer.writerow(["Student ID", "Student Name", "Total Fee", "Total Paid", "Remaining Balance", "Status"])
        stmt = (
            select(StudentFeeAssignment)
            .join(StudentProfile)
            .where(StudentProfile.institute_id == inst_id)
            .options(selectinload(StudentFeeAssignment.student).selectinload(StudentProfile.user))
        )
        res = await db.execute(stmt)
        for a in res.scalars().all():
            writer.writerow([
                a.student.student_id,
                a.student.user.full_name,
                float(a.net_payable),
                float(a.total_paid),
                float(a.remaining_balance),
                a.status
            ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={report_type}_report.csv"}
    )
