from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
from app.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(20)
    )
    res = await db.execute(stmt)
    notifications = res.scalars().all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "notification_type": n.notification_type,
            "is_read": n.is_read,
            "action_url": n.action_url,
            "created_at": n.created_at.isoformat()
        }
        for n in notifications
    ]

@router.post("/{id}/read")
async def mark_notification_as_read(
    id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Notification).where(Notification.id == id, Notification.user_id == current_user.id)
    res = await db.execute(stmt)
    notification = res.scalar_one_or_none()
    if notification:
        notification.is_read = True
        await db.commit()
    return {"status": "ok"}

@router.post("/read-all")
async def mark_all_notifications_as_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Notification).where(Notification.user_id == current_user.id, Notification.is_read == False)
    res = await db.execute(stmt)
    notifications = res.scalars().all()
    for n in notifications:
        n.is_read = True
    await db.commit()
    return {"status": "ok", "marked": len(notifications)}
