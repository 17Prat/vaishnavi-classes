from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict
from datetime import date, datetime
from app.schemas.auth import UserOut

class StudentCreate(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = "other"
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    guardian_relation: Optional[str] = "Parent"
    address: Optional[str] = None
    admission_date: Optional[date] = None
    batch_id: Optional[str] = None
    academic_year_id: Optional[str] = None
    fee_plan_id: Optional[str] = None
    discount_amount: Optional[float] = 0.0
    scholarship_amount: Optional[float] = 0.0
    discount_reason: Optional[str] = None
    scholarship_reason: Optional[str] = None
    custom_password: Optional[str] = None

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    guardian_relation: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None
    batch_id: Optional[str] = None

class StudentOut(BaseModel):
    id: str # profile id
    user_id: str
    student_id: str # login_id: STU0001
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    guardian_relation: Optional[str] = None
    address: Optional[str] = None
    admission_date: date
    status: str
    course_name: Optional[str] = None
    class_name: Optional[str] = None
    batch_name: Optional[str] = None
    batch_id: Optional[str] = None
    total_fee: float = 0.0
    total_paid: float = 0.0
    remaining_balance: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True

class StaffCreate(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    designation: str = "Accountant / Staff"
    qualification: Optional[str] = None
    joining_date: Optional[date] = None
    can_collect_fees: bool = True
    can_verify_upi: bool = True
    can_send_reminders: bool = True
    can_view_reports: bool = True
    can_manage_students: bool = False
    custom_password: Optional[str] = None

class StaffUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    designation: Optional[str] = None
    qualification: Optional[str] = None
    status: Optional[str] = None
    can_collect_fees: Optional[bool] = None
    can_verify_upi: Optional[bool] = None
    can_send_reminders: Optional[bool] = None
    can_view_reports: Optional[bool] = None
    can_manage_students: Optional[bool] = None

class StaffOut(BaseModel):
    id: str
    user_id: str
    staff_id: str # STF0001
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    designation: str
    qualification: Optional[str] = None
    joining_date: date
    status: str
    permissions: Dict[str, bool]
    created_at: datetime

    class Config:
        from_attributes = True
