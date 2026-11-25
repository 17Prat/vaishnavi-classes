import urllib.parse
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from app.database import get_db
from app.models.enquiry import Enquiry
from app.models.institute import Institute
from app.models.user import User
from app.models.notification import Notification
from app.schemas.enquiry import EnquiryCreate, EnquiryOut, EnquiryStatusUpdate
from app.utils.dependencies import require_roles
from app.config import settings

router = APIRouter(prefix="/enquiries", tags=["Website Enquiries"])

def normalize_phone(raw_phone: str) -> str:
    digits = "".join(filter(str.isdigit, raw_phone or ""))
    if not digits:
        return ""
    if len(digits) == 10:
        return "91" + digits
    if len(digits) == 11 and digits.startswith("0"):
        return "91" + digits[1:]
    if len(digits) == 12 and digits.startswith("91"):
        return digits
    return digits

def format_enquiry_whatsapp_message(
    customer_name: str,
    mobile_number: str,
    email: Optional[str],
    service_type: str,
    message: str
) -> str:
    email_text = email if (email and email.strip()) else "Not provided"
    return (
        f"*New Website Enquiry*\n\n"
        f"Customer Name: {customer_name}\n"
        f"Mobile Number: {mobile_number}\n"
        f"Email: {email_text}\n"
        f"Service: {service_type}\n"
        f"Message: {message}\n\n"
        f"Source: Website Contact Form"
    )

@router.post("", response_model=EnquiryOut)
async def submit_website_enquiry(
    payload: EnquiryCreate,
    db: AsyncSession = Depends(get_db)
):
    if not payload.customer_name.strip():
        raise HTTPException(status_code=400, detail="Customer Name is required")
    if not payload.mobile_number.strip():
        raise HTTPException(status_code=400, detail="Mobile Number is required")
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    # Fetch default institute
    inst_res = await db.execute(select(Institute).limit(1))
    institute = inst_res.scalar_one_or_none()
    inst_id = institute.id if institute else None

    # Determine business owner WhatsApp number (default 919664257346)
    business_phone = normalize_phone(settings.BUSINESS_WHATSAPP_NUMBER) or "919664257346"

    # Save to database
    enquiry = Enquiry(
        institute_id=inst_id,
        customer_name=payload.customer_name.strip(),
        mobile_number=payload.mobile_number.strip(),
        email=payload.email.strip() if payload.email else None,
        service_type=payload.service_type.strip(),
        message=payload.message.strip(),
        source="Website Contact Form",
        status="pending"
    )
    db.add(enquiry)
    await db.flush()

    # Create admin in-app notification
    admin_res = await db.execute(select(User).where(User.role == "admin").limit(1))
    admin_user = admin_res.scalar_one_or_none()
    if admin_user:
        notif = Notification(
            user_id=admin_user.id,
            title="New Website Enquiry Received",
            message=f"{payload.customer_name} ({payload.mobile_number}) enquired for {payload.service_type}",
            notification_type="alert",
            action_url="/admin/enquiries"
        )
        db.add(notif)

    await db.commit()
    await db.refresh(enquiry)

    # Format official WhatsApp Click-to-Chat URL
    msg_text = format_enquiry_whatsapp_message(
        customer_name=enquiry.customer_name,
        mobile_number=enquiry.mobile_number,
        email=enquiry.email,
        service_type=enquiry.service_type,
        message=enquiry.message
    )
    encoded_text = urllib.parse.quote(msg_text)
    wa_url = f"https://wa.me/{business_phone}?text={encoded_text}"

    return EnquiryOut(
        id=enquiry.id,
        customer_name=enquiry.customer_name,
        mobile_number=enquiry.mobile_number,
        email=enquiry.email,
        service_type=enquiry.service_type,
        message=enquiry.message,
        source=enquiry.source,
        status=enquiry.status,
        whatsapp_url=wa_url,
        created_at=enquiry.created_at
    )

@router.get("", response_model=List[EnquiryOut])
async def list_enquiries(
    current_user: User = Depends(require_roles(["admin", "staff"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Enquiry)
        .order_by(Enquiry.created_at.desc())
    )
    res = await db.execute(stmt)
    enquiries = res.scalars().all()

    business_phone = normalize_phone(settings.BUSINESS_WHATSAPP_NUMBER) or "919664257346"

    out = []
    for e in enquiries:
        msg_text = format_enquiry_whatsapp_message(
            customer_name=e.customer_name,
            mobile_number=e.mobile_number,
            email=e.email,
            service_type=e.service_type,
            message=e.message
        )
        encoded_text = urllib.parse.quote(msg_text)
        wa_url = f"https://wa.me/{business_phone}?text={encoded_text}"

        out.append(EnquiryOut(
            id=e.id,
            customer_name=e.customer_name,
            mobile_number=e.mobile_number,
            email=e.email,
            service_type=e.service_type,
            message=e.message,
            source=e.source,
            status=e.status,
            whatsapp_url=wa_url,
            created_at=e.created_at
        ))
    return out

@router.patch("/{enquiry_id}/status", response_model=EnquiryOut)
async def update_enquiry_status(
    enquiry_id: str,
    payload: EnquiryStatusUpdate,
    current_user: User = Depends(require_roles(["admin", "staff"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Enquiry).where(Enquiry.id == enquiry_id)
    res = await db.execute(stmt)
    enquiry = res.scalar_one_or_none()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")

    enquiry.status = payload.status
    await db.commit()
    await db.refresh(enquiry)

    business_phone = normalize_phone(settings.BUSINESS_WHATSAPP_NUMBER) or "919664257346"
    msg_text = format_enquiry_whatsapp_message(
        customer_name=enquiry.customer_name,
        mobile_number=enquiry.mobile_number,
        email=enquiry.email,
        service_type=enquiry.service_type,
        message=enquiry.message
    )
    encoded_text = urllib.parse.quote(msg_text)
    wa_url = f"https://wa.me/{business_phone}?text={encoded_text}"

    return EnquiryOut(
        id=enquiry.id,
        customer_name=enquiry.customer_name,
        mobile_number=enquiry.mobile_number,
        email=enquiry.email,
        service_type=enquiry.service_type,
        message=enquiry.message,
        source=enquiry.source,
        status=enquiry.status,
        whatsapp_url=wa_url,
        created_at=enquiry.created_at
    )
