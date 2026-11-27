from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

class AcademicYearBase(BaseModel):
    name: str = Field(..., example="2026-2027")
    start_date: date
    end_date: date
    is_current: bool = False

class AcademicYearCreate(AcademicYearBase):
    pass

class AcademicYearOut(AcademicYearBase):
    id: str
    institute_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    name: str = Field(..., example="Full-Stack Web Development")
    code: str = Field(..., example="FSWD-01")
    description: Optional[str] = None
    duration_months: int = 12

class CourseCreate(CourseBase):
    pass

class CourseOut(CourseBase):
    id: str
    institute_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class SchoolClassBase(BaseModel):
    course_id: str
    name: str = Field(..., example="Standard / Semester 1")
    code: str = Field(..., example="SEM-1")

class SchoolClassCreate(SchoolClassBase):
    pass

class SchoolClassOut(SchoolClassBase):
    id: str
    course_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BatchBase(BaseModel):
    class_id: str
    name: str = Field(..., example="Morning Batch Alpha")
    code: str = Field(..., example="M-ALPHA")
    max_capacity: int = 60
    academic_year_id: Optional[str] = None
    subject: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    batch_days: Optional[str] = None
    assigned_staff_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = "active"

class BatchCreate(BatchBase):
    pass

class BatchUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    max_capacity: Optional[int] = None
    subject: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    batch_days: Optional[str] = None
    assigned_staff_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class BatchOut(BatchBase):
    id: str
    class_name: Optional[str] = None
    course_name: Optional[str] = None
    enrolled_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True
