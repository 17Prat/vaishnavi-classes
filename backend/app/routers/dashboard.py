from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import date, datetime, timedelta
from decimal import Decimal
from app.database import get_db
from app.models.user import User, StudentProfile, StaffProfile
from app.models.fee import StudentFeeAssignment, Installment
from app.models.payment import Payment
from app.schemas.report import DashboardSummaryOut, CollectionTrendOut, CollectionTrendItem
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryOut)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    inst_id = current_user.institute_id

    # Total students
    r_students = await db.execute(
        select(func.count(StudentProfile.id)).where(StudentProfile.institute_id == inst_id)
    )
    total_students = r_students.scalar() or 0

    # Total staff
    r_staff = await db.execute(
        select(func.count(StaffProfile.id)).where(StaffProfile.institute_id == inst_id)
    )
    total_staff = r_staff.scalar() or 0

    # Fee Assignment totals
    r_fees = await db.execute(
        select(
            func.coalesce(func.sum(StudentFeeAssignment.net_payable), 0),
            func.coalesce(func.sum(StudentFeeAssignment.total_paid), 0),
            func.coalesce(func.sum(StudentFeeAssignment.remaining_balance), 0),
        ).select_from(StudentFeeAssignment).join(StudentProfile).where(StudentProfile.institute_id == inst_id)
    )
    total_fees, total_collected, total_pending = r_fees.one()

    # Overdue Installments
    today = date.today()
    r_overdue = await db.execute(
        select(func.coalesce(func.sum(Installment.due_amount - Installment.paid_amount), 0))
        .select_from(Installment)
        .join(StudentFeeAssignment)
        .join(StudentProfile)
        .where(
            and_(
                StudentProfile.institute_id == inst_id,
                Installment.due_date < today,
                Installment.status.in_(["pending", "partial", "overdue"])
            )
        )
    )
    total_overdue = r_overdue.scalar() or 0

    # Today's verified collection
    r_today = await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0))
        .where(
            and_(
                Payment.institute_id == inst_id,
                Payment.status == "verified",
                Payment.payment_date == today
            )
        )
    )
    today_collected = r_today.scalar() or 0

    # Monthly verified collection (current month)
    first_of_month = today.replace(day=1)
    r_month = await db.execute(
        select(func.coalesce(func.sum(Payment.amount), 0))
        .where(
            and_(
                Payment.institute_id == inst_id,
                Payment.status == "verified",
                Payment.payment_date >= first_of_month
            )
        )
    )
    monthly_collected = r_month.scalar() or 0

    # Pending verifications count
    r_pending_verif = await db.execute(
        select(func.count(Payment.id)).where(
            and_(
                Payment.institute_id == inst_id,
                Payment.status == "pending_verification"
            )
        )
    )
    pending_verif_count = r_pending_verif.scalar() or 0

    # Percentage
    pct = (float(total_collected) / float(total_fees) * 100.0) if total_fees > 0 else 0.0

    return DashboardSummaryOut(
        total_students=total_students,
        total_staff=total_staff,
        total_fees=float(total_fees),
        total_collected=float(total_collected),
        total_pending=float(total_pending),
        total_overdue=float(total_overdue),
        today_collected=float(today_collected),
        monthly_collected=float(monthly_collected),
        collection_rate_percentage=round(pct, 1),
        pending_verifications_count=pending_verif_count
    )

@router.get("/charts", response_model=CollectionTrendOut)
async def get_dashboard_charts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    inst_id = current_user.institute_id

    # Daily collection of last 7 days
    daily_items = []
    today = date.today()
    for day_offset in range(6, -1, -1):
        target_date = today - timedelta(days=day_offset)
        res = await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                and_(
                    Payment.institute_id == inst_id,
                    Payment.status == "verified",
                    Payment.payment_date == target_date
                )
            )
        )
        amt = res.scalar() or 0
        daily_items.append(CollectionTrendItem(
            period=target_date.strftime("%a (%d %b)"),
            collected=float(amt),
            target=25000.0
        ))

    # Monthly collection calculated from real verified payments
    monthly_items = []
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for m_idx in range(1, 13):
        m_name = month_names[m_idx - 1]
        r_m = await db.execute(
            select(func.coalesce(func.sum(Payment.amount), 0)).where(
                and_(
                    Payment.institute_id == inst_id,
                    Payment.status == "verified",
                    func.strftime("%m", Payment.payment_date) == f"{m_idx:02d}" if "sqlite" in str(db.bind.url) else func.extract("month", Payment.payment_date) == m_idx
                )
            )
        )
        amt_m = r_m.scalar() or 0
        monthly_items.append(CollectionTrendItem(period=m_name, collected=float(amt_m), target=0.0))

    # Payment methods breakdown from actual database records
    r_methods = await db.execute(
        select(Payment.payment_method, func.sum(Payment.amount))
        .where(and_(Payment.institute_id == inst_id, Payment.status == "verified"))
        .group_by(Payment.payment_method)
    )
    methods_dict = {row[0]: float(row[1]) for row in r_methods.all()}

    return CollectionTrendOut(
        daily=daily_items,
        monthly=monthly_items,
        payment_methods_breakdown=methods_dict
    )
