from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal

class FeePlanCreate(BaseModel):
    course_id: Optional[str] = None
    name: str = Field(..., example="B.Tech Annual Plan 2026")
    description: Optional[str] = None
    admission_fee: float = 0.0
    tuition_fee: float = 0.0
    examination_fee: float = 0.0
    library_fee: float = 0.0
    transport_fee: float = 0.0
    custom_fee: float = 0.0
    installment_frequency: str = "monthly" # full, monthly, quarterly, custom
    number_of_installments: int = 1

class FeePlanOut(BaseModel):
    id: str
    course_id: Optional[str] = None
    course_name: Optional[str] = None
    name: str
    description: Optional[str] = None
    admission_fee: float
    tuition_fee: float
    examination_fee: float
    library_fee: float
    transport_fee: float
    custom_fee: float
    total_amount: float
    installment_frequency: str
    number_of_installments: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AssignFeePlanRequest(BaseModel):
    student_id: str # profile id
    fee_plan_id: str
    original_fee_amount: Optional[float] = None
    discount_type: Optional[str] = "none" # none, percentage, fixed
    discount_value: Optional[float] = 0.0
    discount_amount: float = 0.0
    scholarship_amount: float = 0.0
    discount_reason: Optional[str] = None
    scholarship_reason: Optional[str] = None
    custom_first_due_date: Optional[date] = None

class UpdateDiscountRequest(BaseModel):
    discount_type: str = "none" # none, percentage, fixed
    discount_value: float = 0.0
    discount_reason: Optional[str] = None
    original_fee_amount: Optional[float] = None

class InstallmentOut(BaseModel):
    id: str
    installment_number: int
    title: str
    due_amount: float
    paid_amount: float
    balance_amount: float
    due_date: date
    status: str # pending, partial, paid, overdue

    class Config:
        from_attributes = True

class FeeLedgerOut(BaseModel):
    assignment_id: str
    student_id: str
    student_name: str
    login_id: str
    fee_plan_name: str
    base_amount: float
    original_fee_amount: Optional[float] = None
    admission_fee: float
    tuition_fee: float
    examination_fee: float
    library_fee: float
    transport_fee: float
    custom_fee: float
    discount_type: Optional[str] = "none"
    discount_value: Optional[float] = 0.0
    discount_amount: float
    discount_reason: Optional[str] = None
    scholarship_amount: float
    net_payable: float
    total_paid: float
    remaining_balance: float
    status: str
    installments: List[InstallmentOut]
