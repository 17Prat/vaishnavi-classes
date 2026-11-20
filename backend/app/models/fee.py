from decimal import Decimal
from datetime import date
from sqlalchemy import Column, String, Numeric, Integer, Date, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import UUIDPrimaryKeyMixin, TimestampMixin

class FeePlan(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "fee_plans"

    institute_id = Column(String(36), ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(150), nullable=False) # e.g. "Computer Science Year 1 Annual Plan"
    description = Column(Text, nullable=True)
    
    # Components using Numeric for high precision money
    admission_fee = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    tuition_fee = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    examination_fee = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    library_fee = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    transport_fee = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    custom_fee = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    total_amount = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    
    installment_frequency = Column(String(20), default="monthly", nullable=False) # full, monthly, quarterly, custom
    number_of_installments = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    institute = relationship("Institute", back_populates="fee_plans")
    course = relationship("Course", back_populates="fee_plans")
    assignments = relationship("StudentFeeAssignment", back_populates="fee_plan", cascade="all, delete-orphan")

class StudentFeeAssignment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "student_fee_assignments"

    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    fee_plan_id = Column(String(36), ForeignKey("fee_plans.id", ondelete="RESTRICT"), nullable=False, index=True)
    
    base_amount = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    discount_amount = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    scholarship_amount = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    discount_reason = Column(String(255), nullable=True)
    scholarship_reason = Column(String(255), nullable=True)
    
    net_payable = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    total_paid = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    remaining_balance = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    status = Column(String(20), default="pending", nullable=False) # pending, partial, paid

    student = relationship("StudentProfile", back_populates="fee_assignments")
    fee_plan = relationship("FeePlan", back_populates="assignments")
    installments = relationship("Installment", back_populates="fee_assignment", cascade="all, delete-orphan", order_by="Installment.installment_number")

class Installment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "installments"

    fee_assignment_id = Column(String(36), ForeignKey("student_fee_assignments.id", ondelete="CASCADE"), nullable=False, index=True)
    installment_number = Column(Integer, nullable=False)
    title = Column(String(100), nullable=False) # e.g. "Installment 1 - Due Aug 2026"
    due_amount = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    paid_amount = Column(Numeric(12, 2), default=Decimal("0.00"), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String(20), default="pending", nullable=False) # pending, partial, paid, overdue

    fee_assignment = relationship("StudentFeeAssignment", back_populates="installments")
    allocations = relationship("PaymentAllocation", back_populates="installment", cascade="all, delete-orphan")
