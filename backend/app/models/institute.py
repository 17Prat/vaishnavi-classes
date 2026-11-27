from sqlalchemy import Column, String, Text, Boolean, JSON, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import UUIDPrimaryKeyMixin, TimestampMixin

class Institute(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "institutes"

    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    currency = Column(String(10), default="INR", nullable=False)
    currency_symbol = Column(String(10), default="₹", nullable=False)
    upi_id = Column(String(100), nullable=True)
    upi_qr_image = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    users = relationship("User", back_populates="institute", cascade="all, delete-orphan")
    settings = relationship("InstituteSettings", back_populates="institute", uselist=False, cascade="all, delete-orphan")
    academic_years = relationship("AcademicYear", back_populates="institute", cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="institute", cascade="all, delete-orphan")
    fee_plans = relationship("FeePlan", back_populates="institute", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="institute", cascade="all, delete-orphan")
    upi_accounts = relationship("UpiAccount", back_populates="institute", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="institute", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="institute", cascade="all, delete-orphan")

class InstituteSettings(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "institute_settings"

    institute_id = Column(String(36), ForeignKey("institutes.id", ondelete="CASCADE"), unique=True, nullable=False)
    receipt_prefix = Column(String(20), default="REC-", nullable=False)
    receipt_footer_note = Column(Text, default="Thank you for your payment to Vaishnavi Classes. This is a computer-generated receipt.", nullable=True)
    allow_student_upi_submission = Column(Boolean, default=True, nullable=False)
    enable_whatsapp_reminders = Column(Boolean, default=True, nullable=False)
    
    # E-Signature configuration
    signatory_name = Column(String(150), default="Director / Authorized Signatory", nullable=True)
    signatory_designation = Column(String(100), default="Authorized Signatory", nullable=True)
    signature_image_path = Column(String(500), nullable=True)
    signature_enabled = Column(Boolean, default=True, nullable=False)
    signature_version = Column(Integer, default=1, nullable=False)
    
    custom_fields = Column(JSON, default=dict, nullable=True)

    institute = relationship("Institute", back_populates="settings")

class UpiAccount(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "upi_accounts"

    institute_id = Column(String(36), ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False, index=True)
    account_holder_name = Column(String(150), nullable=False)
    upi_id = Column(String(100), nullable=False)
    display_name = Column(String(100), nullable=False)
    bank_name = Column(String(100), nullable=True)
    payment_instructions = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    created_by = Column(String(36), nullable=True)

    institute = relationship("Institute", back_populates="upi_accounts")
