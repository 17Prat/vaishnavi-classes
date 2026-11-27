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
    BatchCreate, BatchUpdate, BatchOut
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
    await db.flush()

    # Automatically create a default standard class for this course so batches work instantly
    sc = SchoolClass(
        course_id=course.id,
        name=f"{course.name} (Main)",
        code=f"{course.code}-SEC"
    )
    db.add(sc)
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
        .order_by(Batch.created_at.desc())
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
            subject=b.subject,
            start_date=b.start_date,
            end_date=b.end_date,
            start_time=b.start_time,
            end_time=b.end_time,
            batch_days=b.batch_days,
            assigned_staff_name=b.assigned_staff_name,
            description=b.description,
            status=b.status or "active",
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
    # Verify or resolve class_id
    sc_res = await db.execute(select(SchoolClass).where(SchoolClass.id == payload.class_id))
    sc = sc_res.scalar_one_or_none()
    target_class_id = payload.class_id

    if not sc:
        # Check if caller passed a course_id
        c_res = await db.execute(select(Course).where(Course.id == payload.class_id))
        course = c_res.scalar_one_or_none()
        if course:
            sc_first = await db.execute(select(SchoolClass).where(SchoolClass.course_id == course.id))
            found_sc = sc_first.scalars().first()
            if not found_sc:
                found_sc = SchoolClass(
                    course_id=course.id,
                    name=f"{course.name} (Main)",
                    code=f"{course.code}-SEC"
                )
                db.add(found_sc)
                await db.flush()
            target_class_id = found_sc.id
        else:
            # Fallback to first existing class of institute
            sc_any = await db.execute(
                select(SchoolClass).join(Course).where(Course.institute_id == current_user.institute_id)
            )
            default_sc = sc_any.scalars().first()
            if default_sc:
                target_class_id = default_sc.id
            else:
                # Create a default course and class
                c_new = Course(
                    institute_id=current_user.institute_id,
                    name="General Coaching",
                    code="GEN-01",
                    description="General Coaching Program",
                    duration_months=12
                )
                db.add(c_new)
                await db.flush()
                sc_new = SchoolClass(course_id=c_new.id, name="Standard (Main)", code="GEN-SEC")
                db.add(sc_new)
                await db.flush()
                target_class_id = sc_new.id

    b = Batch(
        class_id=target_class_id,
        name=payload.name,
        code=payload.code,
        max_capacity=payload.max_capacity,
        subject=payload.subject,
        start_date=payload.start_date,
        end_date=payload.end_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        batch_days=payload.batch_days,
        assigned_staff_name=payload.assigned_staff_name,
        description=payload.description,
        status=payload.status or "active",
        created_by=current_user.id
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
        subject=b.subject,
        start_date=b.start_date,
        end_date=b.end_date,
        start_time=b.start_time,
        end_time=b.end_time,
        batch_days=b.batch_days,
        assigned_staff_name=b.assigned_staff_name,
        description=b.description,
        status=b.status or "active",
        created_at=b.created_at
    )

@router.put("/batches/{batch_id}", response_model=BatchOut)
async def update_batch(
    batch_id: str,
    payload: BatchUpdate,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Batch).where(Batch.id == batch_id)
    res = await db.execute(stmt)
    b = res.scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Batch not found")

    if payload.name is not None:
        b.name = payload.name
    if payload.code is not None:
        b.code = payload.code
    if payload.max_capacity is not None:
        b.max_capacity = payload.max_capacity
    if payload.subject is not None:
        b.subject = payload.subject
    if payload.start_time is not None:
        b.start_time = payload.start_time
    if payload.end_time is not None:
        b.end_time = payload.end_time
    if payload.batch_days is not None:
        b.batch_days = payload.batch_days
    if payload.assigned_staff_name is not None:
        b.assigned_staff_name = payload.assigned_staff_name
    if payload.description is not None:
        b.description = payload.description
    if payload.status is not None:
        b.status = payload.status

    await db.commit()
    await db.refresh(b)
    return BatchOut(
        id=b.id,
        class_id=b.class_id,
        name=b.name,
        code=b.code,
        max_capacity=b.max_capacity,
        subject=b.subject,
        start_date=b.start_date,
        end_date=b.end_date,
        start_time=b.start_time,
        end_time=b.end_time,
        batch_days=b.batch_days,
        assigned_staff_name=b.assigned_staff_name,
        description=b.description,
        status=b.status or "active",
        created_at=b.created_at
    )

@router.delete("/batches/{batch_id}")
async def delete_batch(
    batch_id: str,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Batch).where(Batch.id == batch_id)
    res = await db.execute(stmt)
    b = res.scalar_one_or_none()
    if not b:
        raise HTTPException(status_code=404, detail="Batch not found")

    await db.delete(b)
    await db.commit()
    return {"message": "Batch deleted successfully", "id": batch_id}
