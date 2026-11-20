from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.academic import AcademicYear, Course, SchoolClass, Batch
from app.models.user import User
from app.schemas.academic import (
    AcademicYearCreate, AcademicYearOut,
    CourseCreate, CourseOut,
    SchoolClassCreate, SchoolClassOut,
    BatchCreate, BatchOut
)
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/academic", tags=["Academic Management"])

# Academic Years
@router.get("/years", response_model=List[AcademicYearOut])
async def list_academic_years(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AcademicYear).where(AcademicYear.institute_id == current_user.institute_id).order_by(AcademicYear.start_date.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/years", response_model=AcademicYearOut)
async def create_academic_year(
    payload: AcademicYearCreate,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    year = AcademicYear(
        institute_id=current_user.institute_id,
        name=payload.name,
        start_date=payload.start_date,
        end_date=payload.end_date,
        is_current=payload.is_current
    )
    db.add(year)
    await db.commit()
    await db.refresh(year)
    return year

# Courses
@router.get("/courses", response_model=List[CourseOut])
async def list_courses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Course).where(Course.institute_id == current_user.institute_id).order_by(Course.name)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.post("/courses", response_model=CourseOut)
async def create_course(
    payload: CourseCreate,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    course = Course(
        institute_id=current_user.institute_id,
        name=payload.name,
        code=payload.code,
        description=payload.description,
        duration_months=payload.duration_months
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course

# Classes
@router.get("/classes", response_model=List[SchoolClassOut])
async def list_classes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SchoolClass).join(Course).where(Course.institute_id == current_user.institute_id)
    res = await db.execute(stmt)
    classes = res.scalars().all()
    out = []
    for c in classes:
        out.append(SchoolClassOut(
            id=c.id,
            course_id=c.course_id,
            name=c.name,
            code=c.code,
            course_name=c.course.name if c.course else None,
            created_at=c.created_at
        ))
    return out

@router.post("/classes", response_model=SchoolClassOut)
async def create_class(
    payload: SchoolClassCreate,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    sc = SchoolClass(
        course_id=payload.course_id,
        name=payload.name,
        code=payload.code
    )
    db.add(sc)
    await db.commit()
    await db.refresh(sc)
    return SchoolClassOut(
        id=sc.id,
        course_id=sc.course_id,
        name=sc.name,
        code=sc.code,
        created_at=sc.created_at
    )

# Batches
@router.get("/batches", response_model=List[BatchOut])
async def list_batches(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Batch)
        .join(SchoolClass)
        .join(Course)
        .where(Course.institute_id == current_user.institute_id)
    )
    res = await db.execute(stmt)
    batches = res.scalars().all()
    out = []
    for b in batches:
        out.append(BatchOut(
            id=b.id,
            class_id=b.class_id,
            name=b.name,
            code=b.code,
            max_capacity=b.max_capacity,
            class_name=b.school_class.name if b.school_class else None,
            course_name=b.school_class.course.name if (b.school_class and b.school_class.course) else None,
            created_at=b.created_at
        ))
    return out

@router.post("/batches", response_model=BatchOut)
async def create_batch(
    payload: BatchCreate,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    b = Batch(
        class_id=payload.class_id,
        name=payload.name,
        code=payload.code,
        max_capacity=payload.max_capacity
    )
    db.add(b)
    await db.commit()
    await db.refresh(b)
    return BatchOut(
        id=b.id,
        class_id=b.class_id,
        name=b.name,
        code=b.code,
        max_capacity=b.max_capacity,
        created_at=b.created_at
    )
