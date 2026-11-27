from datetime import date
from sqlalchemy import Column, String, Boolean, Date, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import UUIDPrimaryKeyMixin, TimestampMixin

class AcademicYear(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "academic_years"

    institute_id = Column(String(36), ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False) # e.g. "2026-2027"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    is_current = Column(Boolean, default=False, nullable=False)

    institute = relationship("Institute", back_populates="academic_years")
    enrollments = relationship("Enrollment", back_populates="academic_year", cascade="all, delete-orphan")
    batches = relationship("Batch", back_populates="academic_year")

class Course(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "courses"

    institute_id = Column(String(36), ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False) # e.g. "Full-Stack Software Engineering"
    code = Column(String(50), nullable=False) # e.g. "FS-ENG"
    description = Column(Text, nullable=True)
    duration_months = Column(Integer, default=12, nullable=False)

    institute = relationship("Institute", back_populates="courses")
    classes = relationship("SchoolClass", back_populates="course", cascade="all, delete-orphan")
    fee_plans = relationship("FeePlan", back_populates="course", cascade="all, delete-orphan")

class SchoolClass(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "classes"

    course_id = Column(String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False) # e.g. "Year 1 / Semester 1"
    code = Column(String(50), nullable=False)

    course = relationship("Course", back_populates="classes")
    batches = relationship("Batch", back_populates="school_class", cascade="all, delete-orphan")

class Batch(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "batches"

    class_id = Column(String(36), ForeignKey("classes.id", ondelete="CASCADE"), nullable=False, index=True)
    academic_year_id = Column(String(36), ForeignKey("academic_years.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(100), nullable=False) # e.g. "10th Standard Morning Batch"
    code = Column(String(50), nullable=False)
    subject = Column(String(150), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    start_time = Column(String(20), nullable=True) # e.g. "07:00 AM"
    end_time = Column(String(20), nullable=True) # e.g. "09:00 AM"
    batch_days = Column(String(100), nullable=True) # e.g. "Monday to Saturday"
    max_capacity = Column(Integer, default=60, nullable=False)
    assigned_staff_name = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="active", nullable=False) # active, inactive, archived
    created_by = Column(String(36), nullable=True)

    school_class = relationship("SchoolClass", back_populates="batches")
    academic_year = relationship("AcademicYear", back_populates="batches")
    enrollments = relationship("Enrollment", back_populates="batch", cascade="all, delete-orphan")
    staff_assignments = relationship("StaffBatchAssignment", back_populates="batch", cascade="all, delete-orphan")

class Enrollment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "enrollments"

    student_id = Column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_id = Column(String(36), ForeignKey("batches.id", ondelete="CASCADE"), nullable=False, index=True)
    academic_year_id = Column(String(36), ForeignKey("academic_years.id", ondelete="CASCADE"), nullable=False, index=True)
    roll_number = Column(String(50), nullable=True)
    enrollment_date = Column(Date, default=date.today, nullable=False)
    status = Column(String(20), default="active", nullable=False) # active, completed, transferred

    student = relationship("StudentProfile", back_populates="enrollments")
    batch = relationship("Batch", back_populates="enrollments")
    academic_year = relationship("AcademicYear", back_populates="enrollments")

class StaffBatchAssignment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "staff_batch_assignments"

    staff_profile_id = Column(String(36), ForeignKey("staff_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    batch_id = Column(String(36), ForeignKey("batches.id", ondelete="CASCADE"), nullable=False, index=True)
    is_primary = Column(Boolean, default=True, nullable=False)

    batch = relationship("Batch", back_populates="staff_assignments")
