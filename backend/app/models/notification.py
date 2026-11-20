from sqlalchemy import Column, String, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import UUIDPrimaryKeyMixin, TimestampMixin

class Notification(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "notifications"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info", nullable=False) # payment, overdue, reminder, chat, alert
    is_read = Column(Boolean, default=False, nullable=False)
    action_url = Column(String(255), nullable=True)

    user = relationship("User", back_populates="notifications")

class AuditLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "audit_logs"

    institute_id = Column(String(36), ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False) # PAYMENT_RECORDED, PAYMENT_VERIFIED, PAYMENT_REVERSED, PASSWORD_CHANGED, etc.
    target_type = Column(String(50), nullable=False) # payment, student, fee_plan, user
    target_id = Column(String(50), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)

    institute = relationship("Institute", back_populates="audit_logs")
    user = relationship("User")
