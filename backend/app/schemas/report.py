from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import date

class DashboardSummaryOut(BaseModel):
    total_students: int
    total_staff: int
    total_fees: float
    total_collected: float
    total_pending: float
    total_overdue: float
    today_collected: float
    monthly_collected: float
    collection_rate_percentage: float
    pending_verifications_count: int

class CollectionTrendItem(BaseModel):
    period: str # e.g. "Mon", "Jan", or date
    collected: float
    target: Optional[float] = 0.0

class CollectionTrendOut(BaseModel):
    daily: List[CollectionTrendItem]
    monthly: List[CollectionTrendItem]
    payment_methods_breakdown: Dict[str, float]

class DefaulterStudentOut(BaseModel):
    student_profile_id: str
    student_login_id: str
    student_name: str
    guardian_phone: Optional[str] = None
    student_phone: Optional[str] = None
    course_name: Optional[str] = None
    batch_name: Optional[str] = None
    overdue_amount: float
    days_overdue: int
    due_date: date
