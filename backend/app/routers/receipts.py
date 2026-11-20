import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from app.database import get_db
from app.config import settings
from app.models.payment import Receipt, Payment
from app.models.user import User, StudentProfile
from app.schemas.payment import ReceiptOut
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/receipts", tags=["Receipts System"])

@router.get("", response_model=List[ReceiptOut])
async def list_receipts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Receipt)
        .join(Payment)
        .where(Payment.institute_id == current_user.institute_id)
        .options(
            selectinload(Receipt.payment).selectinload(Payment.student).selectinload(StudentProfile.user),
            selectinload(Receipt.payment).selectinload(Payment.institute)
        )
        .order_by(Receipt.generated_at.desc())
    )

    if current_user.role == "student" and current_user.student_profile:
        stmt = stmt.where(Payment.student_id == current_user.student_profile.id)

    res = await db.execute(stmt)
    receipts = res.scalars().all()

    out = []
    for r in receipts:
        student = r.payment.student if r.payment else None
        out.append(ReceiptOut(
            id=r.id,
            payment_id=r.payment_id,
            receipt_number=r.receipt_number,
            amount_paid=float(r.amount_paid),
            balance_after=float(r.balance_after),
            qr_code_data=r.qr_code_data,
            pdf_url=f"/receipts-pdf/{r.pdf_filename}",
            generated_at=r.generated_at,
            student_name=student.user.full_name if student else "N/A",
            student_id=student.student_id if student else "N/A",
            payment_method=r.payment.payment_method if r.payment else "N/A",
            institute_name=r.payment.institute.name if r.payment and r.payment.institute else "FeeFlow"
        ))
    return out

@router.get("/{receipt_number}/pdf")
async def download_receipt_pdf(receipt_number: str):
    file_path = os.path.join(settings.RECEIPTS_DIR, f"{receipt_number}.pdf")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Receipt PDF file not found")

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=f"{receipt_number}.pdf"
    )

@router.get("/verify/{receipt_number}")
async def verify_receipt_public(
    receipt_number: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Public verification endpoint for scanned QR codes on printed receipts
    """
    stmt = (
        select(Receipt)
        .where(Receipt.receipt_number == receipt_number)
        .options(
            selectinload(Receipt.payment).selectinload(Payment.student).selectinload(StudentProfile.user),
            selectinload(Receipt.payment).selectinload(Payment.institute)
        )
    )
    res = await db.execute(stmt)
    receipt = res.scalar_one_or_none()
    if not receipt:
        return {"is_valid": False, "message": "Receipt not found in database"}

    payment = receipt.payment
    student = payment.student if payment else None

    return {
        "is_valid": True,
        "receipt_number": receipt.receipt_number,
        "institute_name": payment.institute.name if payment and payment.institute else "FeeFlow Institute",
        "student_name": student.user.full_name if student else "N/A",
        "student_id": student.student_id if student else "N/A",
        "amount_paid": float(receipt.amount_paid),
        "balance_after": float(receipt.balance_after),
        "payment_date": payment.payment_date.strftime("%d %b %Y") if payment else "N/A",
        "payment_method": payment.payment_method if payment else "N/A",
        "status": payment.status if payment else "verified",
        "verified_at": receipt.generated_at.strftime("%d %b %Y %H:%M UTC")
    }
