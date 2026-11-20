from datetime import datetime, date
from sqlalchemy import Column, String, Boolean, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import UUIDPrimaryKeyMixin, TimestampMixin

class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    institute_id = Column(String(36), ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False, index=True)
    login_id = Column(String(50), unique=True, nullable=False, index=True) # ADM0001, STF0001, STU0001
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, index=True) # admin, staff, student
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    must_change_password = Column(Boolean, default=False, nullable=False)
    last_login = Column(DateTime, nullable=True)

    institute = relationship("Institute", back_populates="users")
    staff_profile = relationship("StaffProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sessions = relationship("SessionLog", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    sent_messages = relationship("Message", back_populates="sender", cascade="all, delete-orphan")

class StaffProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "staff_profiles"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    institute_id = Column(String(36), ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False, index=True)
    staff_id = Column(String(50), unique=True, nullable=False, index=True) # STF0001
    designation = Column(String(100), default="Accountant / Staff", nullable=False)
    qualification = Column(String(150), nullable=True)
    joining_date = Column(Date, default=date.today, nullable=False)
    status = Column(String(20), default="active", nullable=False) # active, inactive

    user = relationship("User", back_populates="staff_profile")
    permissions = relationship("StaffPermission", back_populates="staff_profile", uselist=False, cascade="all, delete-orphan")

class StaffPermission(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "staff_permissions"

    staff_profile_id = Column(String(36), ForeignKey("staff_profiles.id", ondelete="CASCADE"), unique=True, nullable=False)
    can_collect_fees = Column(Boolean, default=True, nullable=False)
    can_verify_upi = Column(Boolean, default=True, nullable=False)
    can_send_reminders = Column(Boolean, default=True, nullable=False)
    can_view_reports = Column(Boolean, default=True, nullable=False)
    can_manage_students = Column(Boolean, default=False, nullable=False)

    staff_profile = relationship("StaffProfile", back_populates="permissions")

class StudentProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "student_profiles"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    institute_id = Column(String(36), ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(50), unique=True, nullable=False, index=True) # STU0001
    dob = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    guardian_name = Column(String(150), nullable=True)
    guardian_phone = Column(String(50), nullable=True)
    guardian_relation = Column(String(50), default="Parent", nullable=True)
    address = Column(Text, nullable=True)
    admission_date = Column(Date, default=date.today, nullable=False)
    status = Column(String(20), default="active", nullable=False) # active, inactive, graduated

    user = relationship("User", back_populates="student_profile")
    enrollments = relationship("Enrollment", back_populates="student", cascade="all, delete-orphan")
    fee_assignments = relationship("StudentFeeAssignment", back_populates="student", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="student", cascade="all, delete-orphan")
    reminders = relationship("Reminder", back_populates="student", cascade="all, delete-orphan")

class SessionLog(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "sessions"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String(500), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    is_revoked = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="sessions")
