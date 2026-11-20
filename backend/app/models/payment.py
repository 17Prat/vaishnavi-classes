from decimal import Decimal
from datetime import date, datetime
from sqlalchemy import Column, String, Numeric, Date, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import UUIDPrimaryKeyMixin, TimestampMixin

class Payment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "payments"

    institute_id = Column(String(36), ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    collected_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True) # Staff/Admin who recorded or verified
    
    amount = Column(Numeric(12, 2), nullable=False)
    payment_method = Column(String(30), nullable=False) # cash, upi, bank_transfer, cheque, other
    transaction_ref = Column(String(100), nullable=True) # UPI Ref / Cheque No / NEFT Ref
    proof_image_url = Column(String(500), nullable=True) # uploaded screenshot
    payment_date = Column(Date, default=date.today, nullable=False)
    
    status = Column(String(30), default="verified", nullable=False) # verified, pending_verification, rejected, reversed
    rejection_reason = Column(Text, nullable=True)
    reversal_reason = Column(Text, nullable=True)
    reversed_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    institute = relationship("Institute", back_populates="payments")
    student = relationship("StudentProfile", back_populates="payments")
    allocations = relationship("PaymentAllocation", back_populates="payment", cascade="all, delete-orphan")
    receipt = relationship("Receipt", back_populates="payment", uselist=False, cascade="all, delete-orphan")

class PaymentAllocation(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "payment_allocations"

    payment_id = Column(String(36), ForeignKey("payments.id", ondelete="CASCADE"), nullable=False, index=True)
    installment_id = Column(String(36), ForeignKey("installments.id", ondelete="CASCADE"), nullable=False, index=True)
    allocated_amount = Column(Numeric(12, 2), nullable=False)

    payment = relationship("Payment", back_populates="allocations")
    installment = relationship("Installment", back_populates="allocations")

class Receipt(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "receipts"

    payment_id = Column(String(36), ForeignKey("payments.id", ondelete="CASCADE"), unique=True, nullable=False)
    receipt_number = Column(String(50), unique=True, nullable=False, index=True) # REC-2026-0001
    amount_paid = Column(Numeric(12, 2), nullable=False)
    balance_after = Column(Numeric(12, 2), nullable=False)
    qr_code_data = Column(Text, nullable=False)
    pdf_filename = Column(String(255), nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    payment = relationship("Payment", back_populates="receipt")

class Reminder(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "reminders"

    institute_id = Column(String(36), ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    installment_id = Column(String(36), ForeignKey("installments.id", ondelete="SET NULL"), nullable=True)
    sent_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    template_type = Column(String(50), nullable=False) # upcoming_fee, due_today, overdue_fee, partial_payment, payment_confirmation
    recipient_phone = Column(String(50), nullable=False)
    message_text = Column(Text, nullable=False)
    whatsapp_url = Column(Text, nullable=True) # wa.me link
    status = Column(String(20), default="generated", nullable=False) # generated, clicked, sent

    student = relationship("StudentProfile", back_populates="reminders")
