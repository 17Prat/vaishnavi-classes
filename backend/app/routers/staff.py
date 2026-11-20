from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List
from datetime import date
from app.database import get_db
from app.models.user import User, StaffProfile, StaffPermission
from app.schemas.user import StaffCreate, StaffUpdate, StaffOut
from app.utils.security import hash_password
from app.utils.dependencies import require_roles

router = APIRouter(prefix="/staff", tags=["Staff Management"])

async def get_next_staff_id(db: AsyncSession, institute_id: str) -> str:
    stmt = (
        select(func.count(StaffProfile.id))
        .where(StaffProfile.institute_id == institute_id)
    )
    res = await db.execute(stmt)
    count = res.scalar() or 0
    return f"STF{str(count + 1).zfill(4)}"

@router.get("", response_model=List[StaffOut])
async def list_staff(
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(StaffProfile)
        .where(StaffProfile.institute_id == current_user.institute_id)
        .options(
            selectinload(StaffProfile.user),
            selectinload(StaffProfile.permissions)
        )
        .order_by(StaffProfile.staff_id.asc())
    )
    res = await db.execute(stmt)
    profiles = res.scalars().all()

    out = []
    for sp in profiles:
        perms = {}
        if sp.permissions:
            perms = {
                "can_collect_fees": sp.permissions.can_collect_fees,
                "can_verify_upi": sp.permissions.can_verify_upi,
                "can_send_reminders": sp.permissions.can_send_reminders,
                "can_view_reports": sp.permissions.can_view_reports,
                "can_manage_students": sp.permissions.can_manage_students,
            }

        out.append(StaffOut(
            id=sp.id,
            user_id=sp.user_id,
            staff_id=sp.staff_id,
            full_name=sp.user.full_name,
            phone=sp.user.phone,
            email=sp.user.email,
            designation=sp.designation,
            qualification=sp.qualification,
            joining_date=sp.joining_date,
            status=sp.status,
            permissions=perms,
            created_at=sp.created_at
        ))
    return out

@router.post("", response_model=StaffOut)
async def create_staff(
    payload: StaffCreate,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    staff_id = await get_next_staff_id(db, current_user.institute_id)
    initial_pwd = payload.custom_password or "staff123"

    user = User(
        institute_id=current_user.institute_id,
        login_id=staff_id,
        hashed_password=hash_password(initial_pwd),
        role="staff",
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        is_active=True,
        must_change_password=True
    )
    db.add(user)
    await db.flush()

    profile = StaffProfile(
        user_id=user.id,
        institute_id=current_user.institute_id,
        staff_id=staff_id,
        designation=payload.designation,
        qualification=payload.qualification,
        joining_date=payload.joining_date or date.today(),
        status="active"
    )
    db.add(profile)
    await db.flush()

    perms = StaffPermission(
        staff_profile_id=profile.id,
        can_collect_fees=payload.can_collect_fees,
        can_verify_upi=payload.can_verify_upi,
        can_send_reminders=payload.can_send_reminders,
        can_view_reports=payload.can_view_reports,
        can_manage_students=payload.can_manage_students
    )
    db.add(perms)
    await db.commit()
    await db.refresh(profile)

    return StaffOut(
        id=profile.id,
        user_id=user.id,
        staff_id=staff_id,
        full_name=user.full_name,
        phone=user.phone,
        email=user.email,
        designation=profile.designation,
        qualification=profile.qualification,
        joining_date=profile.joining_date,
        status=profile.status,
        permissions={
            "can_collect_fees": perms.can_collect_fees,
            "can_verify_upi": perms.can_verify_upi,
            "can_send_reminders": perms.can_send_reminders,
            "can_view_reports": perms.can_view_reports,
            "can_manage_students": perms.can_manage_students,
        },
        created_at=profile.created_at
    )

@router.put("/{id}", response_model=StaffOut)
async def update_staff(
    id: str,
    payload: StaffUpdate,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(StaffProfile)
        .where(StaffProfile.id == id, StaffProfile.institute_id == current_user.institute_id)
        .options(selectinload(StaffProfile.user), selectinload(StaffProfile.permissions))
    )
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Staff member not found")

    if payload.full_name is not None:
        profile.user.full_name = payload.full_name
    if payload.phone is not None:
        profile.user.phone = payload.phone
    if payload.email is not None:
        profile.user.email = payload.email
    if payload.designation is not None:
        profile.designation = payload.designation
    if payload.qualification is not None:
        profile.qualification = payload.qualification
    if payload.status is not None:
        profile.status = payload.status
        profile.user.is_active = (payload.status == "active")

    if profile.permissions:
        if payload.can_collect_fees is not None:
            profile.permissions.can_collect_fees = payload.can_collect_fees
        if payload.can_verify_upi is not None:
            profile.permissions.can_verify_upi = payload.can_verify_upi
        if payload.can_send_reminders is not None:
            profile.permissions.can_send_reminders = payload.can_send_reminders
        if payload.can_view_reports is not None:
            profile.permissions.can_view_reports = payload.can_view_reports
        if payload.can_manage_students is not None:
            profile.permissions.can_manage_students = payload.can_manage_students

    await db.commit()
    await db.refresh(profile)

    return StaffOut(
        id=profile.id,
        user_id=profile.user_id,
        staff_id=profile.staff_id,
        full_name=profile.user.full_name,
        phone=profile.user.phone,
        email=profile.user.email,
        designation=profile.designation,
        qualification=profile.qualification,
        joining_date=profile.joining_date,
        status=profile.status,
        permissions={
            "can_collect_fees": profile.permissions.can_collect_fees,
            "can_verify_upi": profile.permissions.can_verify_upi,
            "can_send_reminders": profile.permissions.can_send_reminders,
            "can_view_reports": profile.permissions.can_view_reports,
            "can_manage_students": profile.permissions.can_manage_students,
        } if profile.permissions else {},
        created_at=profile.created_at
    )
