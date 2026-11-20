from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

class PaymentRecordRequest(BaseModel):
    student_id: str # profile id
    installment_id: Optional[str] = None # optional specific installment or auto-allocated to oldest pending
    amount: float = Field(..., gt=0)
    payment_method: str = "cash" # cash, upi, bank_transfer, cheque, other
    transaction_ref: Optional[str] = None
    payment_date: Optional[date] = None
    notes: Optional[str] = None

class StudentUPIPaymentRequest(BaseModel):
    amount: float = Field(..., gt=0)
    transaction_ref: str = Field(..., description="UPI 12-digit UTR or Reference Number")
    installment_id: Optional[str] = None
    notes: Optional[str] = None

class VerifyPaymentRequest(BaseModel):
    action: str = Field(..., example="verify") # verify, reject
    notes: Optional[str] = None

class ReversePaymentRequest(BaseModel):
    reason: str = Field(..., min_length=3)

class ReceiptOut(BaseModel):
    id: str
    payment_id: str
    receipt_number: str
    amount_paid: float
    balance_after: float
    qr_code_data: str
    pdf_url: str
    generated_at: datetime
    student_name: Optional[str] = None
    student_id: Optional[str] = None
    payment_method: Optional[str] = None
    institute_name: Optional[str] = None

    class Config:
        from_attributes = True

class PaymentOut(BaseModel):
    id: str
    student_id: str
    student_name: str
    student_login_id: str
    course_name: Optional[str] = None
    amount: float
    payment_method: str
    transaction_ref: Optional[str] = None
    payment_date: date
    status: str # verified, pending_verification, rejected, reversed
    collected_by: Optional[str] = None
    receipt_number: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReminderRequest(BaseModel):
    student_id: str
    template_type: str # upcoming_fee, due_today, overdue_fee, partial_payment, payment_confirmation
    installment_id: Optional[str] = None

class ReminderOut(BaseModel):
    id: str
    student_id: str
    student_name: str
    recipient_phone: str
    template_type: str
    message_text: str
    whatsapp_url: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
