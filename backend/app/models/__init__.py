# Export all models for Alembic and SQLAlchemy metadata
from app.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin, generate_uuid
from app.models.institute import Institute, InstituteSettings, UpiAccount
from app.models.user import User, StaffProfile, StaffPermission, StudentProfile, SessionLog
from app.models.academic import AcademicYear, Course, SchoolClass, Batch, Enrollment, StaffBatchAssignment
from app.models.fee import FeePlan, StudentFeeAssignment, Installment
from app.models.payment import Payment, PaymentAllocation, Receipt, Reminder
from app.models.chat import Conversation, ConversationMember, Message
from app.models.notification import Notification, AuditLog
from app.models.enquiry import Enquiry

__all__ = [
    "Base",
    "UUIDPrimaryKeyMixin",
    "TimestampMixin",
    "generate_uuid",
    "Institute",
    "InstituteSettings",
    "UpiAccount",
    "User",
    "StaffProfile",
    "StaffPermission",
    "StudentProfile",
    "SessionLog",
    "AcademicYear",
    "Course",
    "SchoolClass",
    "Batch",
    "Enrollment",
    "StaffBatchAssignment",
    "FeePlan",
    "StudentFeeAssignment",
    "Installment",
    "Payment",
    "PaymentAllocation",
    "Receipt",
    "Reminder",
    "Conversation",
    "ConversationMember",
    "Message",
    "Notification",
    "AuditLog",
    "Enquiry"
]
