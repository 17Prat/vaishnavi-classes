from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class LoginRequest(BaseModel):
    login_id: str = Field(..., description="Unique Login ID (ADM0001, STF0001, STU0001)")
    password: str = Field(..., min_length=4)

class UserOut(BaseModel):
    id: str
    institute_id: str
    login_id: str
    role: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    must_change_password: bool
    permissions: Optional[Dict[str, bool]] = None
    student_profile_id: Optional[str] = None
    staff_profile_id: Optional[str] = None
    institute_name: Optional[str] = None

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class AdminResetPasswordRequest(BaseModel):
    user_id: str
    new_password: str = Field(..., min_length=6)

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=10)
    email: Optional[str] = None
    role: str = Field(default="student")
    password: str = Field(..., min_length=6)
    course_interest: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    login_id_or_phone: str
    new_password: Optional[str] = None
