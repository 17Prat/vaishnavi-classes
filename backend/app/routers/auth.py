from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models.user import User, StaffProfile, StaffPermission, StudentProfile
from app.schemas.auth import LoginRequest, LoginResponse, UserOut, ChangePasswordRequest, AdminResetPasswordRequest
from app.utils.security import verify_password, hash_password, create_access_token
from app.utils.dependencies import get_current_user, require_roles
from app.models.audit import AuditLog

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    login_id_clean = payload.login_id.strip().upper()
    stmt = (
        select(User)
        .where(User.login_id == login_id_clean)
        .options(
            selectinload(User.staff_profile).selectinload(StaffProfile.permissions),
            selectinload(User.student_profile),
            selectinload(User.institute)
        )
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Login ID or Password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is deactivated. Contact Administrator."
        )

    # Generate JWT
    token_data = {
        "sub": user.id,
        "login_id": user.login_id,
        "role": user.role,
        "institute_id": user.institute_id
    }
    access_token = create_access_token(token_data)

    # Set secure HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=60 * 60 * 24 * 7,
        samesite="lax",
        secure=False # set to True in HTTPS production
    )

    # Extract permissions if staff
    permissions = {}
    if user.staff_profile and user.staff_profile.permissions:
        p = user.staff_profile.permissions
        permissions = {
            "can_collect_fees": p.can_collect_fees,
            "can_verify_upi": p.can_verify_upi,
            "can_send_reminders": p.can_send_reminders,
            "can_view_reports": p.can_view_reports,
            "can_manage_students": p.can_manage_students,
        }

    user_out = UserOut(
        id=user.id,
        institute_id=user.institute_id,
        login_id=user.login_id,
        role=user.role,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
        must_change_password=user.must_change_password,
        permissions=permissions,
        student_profile_id=user.student_profile.id if user.student_profile else None,
        staff_profile_id=user.staff_profile.id if user.staff_profile else None,
        institute_name=user.institute.name if user.institute else None
    )

    return LoginResponse(access_token=access_token, user=user_out)

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    permissions = {}
    if current_user.staff_profile and current_user.staff_profile.permissions:
        p = current_user.staff_profile.permissions
        permissions = {
            "can_collect_fees": p.can_collect_fees,
            "can_verify_upi": p.can_verify_upi,
            "can_send_reminders": p.can_send_reminders,
            "can_view_reports": p.can_view_reports,
            "can_manage_students": p.can_manage_students,
        }

    return UserOut(
        id=current_user.id,
        institute_id=current_user.institute_id,
        login_id=current_user.login_id,
        role=current_user.role,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        avatar_url=current_user.avatar_url,
        is_active=current_user.is_active,
        must_change_password=current_user.must_change_password,
        permissions=permissions,
        student_profile_id=current_user.student_profile.id if current_user.student_profile else None,
        staff_profile_id=current_user.staff_profile.id if current_user.staff_profile else None,
        institute_name=current_user.institute.name if current_user.institute else None
    )

@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password incorrect")

    current_user.hashed_password = hash_password(payload.new_password)
    current_user.must_change_password = False
    await db.commit()

    return {"message": "Password changed successfully"}

@router.post("/admin-reset-password")
async def admin_reset_password(
    payload: AdminResetPasswordRequest,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.id == payload.user_id, User.institute_id == current_user.institute_id)
    result = await db.execute(stmt)
    target_user = result.scalar_one_or_none()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_user.hashed_password = hash_password(payload.new_password)
    target_user.must_change_password = True

    # Audit log
    audit = AuditLog(
        institute_id=current_user.institute_id,
        user_id=current_user.id,
        action="ADMIN_PASSWORD_RESET",
        target_type="user",
        target_id=target_user.id,
        details={"reset_for_login_id": target_user.login_id}
    )
    db.add(audit)
    await db.commit()

    return {"message": f"Password reset for {target_user.login_id} successfully"}

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}
