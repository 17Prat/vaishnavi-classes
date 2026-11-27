import os
import uuid
import base64
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.institute import Institute, InstituteSettings, UpiAccount
from app.schemas.payment import (
    UpiAccountCreate, UpiAccountUpdate, UpiAccountOut,
    SignatureSettingsUpdate, SignatureSettingsOut,
    InstituteSettingsUpdate, InstituteSettingsOut
)
from app.utils.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/settings", tags=["Institute & Payment Settings"])

# Ensure uploads directory exists
SIGNATURES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "signatures")
os.makedirs(SIGNATURES_DIR, exist_ok=True)

@router.get("/institute", response_model=InstituteSettingsOut)
async def get_institute_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    inst_res = await db.execute(select(Institute).where(Institute.id == current_user.institute_id))
    inst = inst_res.scalar_one_or_none()
    if not inst:
        raise HTTPException(status_code=404, detail="Institute not found")

    sett_res = await db.execute(select(InstituteSettings).where(InstituteSettings.institute_id == inst.id))
    sett = sett_res.scalar_one_or_none()
    if not sett:
        sett = InstituteSettings(
            institute_id=inst.id,
            signatory_name="Director / Authorized Signatory",
            signatory_designation="Director & Head of Institute",
            signature_enabled=True,
            signature_version=1
        )
        db.add(sett)
        await db.commit()
        await db.refresh(sett)

    return InstituteSettingsOut(
        name=inst.name,
        code=inst.code,
        email=inst.email,
        phone=inst.phone,
        address=inst.address,
        currency_symbol=inst.currency_symbol,
        upi_id=inst.upi_id,
        receipt_prefix=inst.receipt_prefix,
        signatory_name=sett.signatory_name,
        signatory_designation=sett.signatory_designation,
        signature_image_path=sett.signature_image_path,
        signature_data_url=sett.signature_image_path if (sett.signature_image_path and sett.signature_image_path.startswith("data:")) else None,
        signature_enabled=bool(sett.signature_enabled)
    )

@router.put("/institute", response_model=InstituteSettingsOut)
async def update_institute_settings(
    payload: InstituteSettingsUpdate,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    inst_res = await db.execute(select(Institute).where(Institute.id == current_user.institute_id))
    inst = inst_res.scalar_one_or_none()
    if not inst:
        raise HTTPException(status_code=404, detail="Institute not found")

    if payload.name is not None:
        inst.name = payload.name
    if payload.code is not None:
        inst.code = payload.code
    if payload.email is not None:
        inst.email = payload.email
    if payload.phone is not None:
        inst.phone = payload.phone
    if payload.address is not None:
        inst.address = payload.address
    if payload.currency_symbol is not None:
        inst.currency_symbol = payload.currency_symbol
    if payload.upi_id is not None:
        inst.upi_id = payload.upi_id
    if payload.receipt_prefix is not None:
        inst.receipt_prefix = payload.receipt_prefix

    sett_res = await db.execute(select(InstituteSettings).where(InstituteSettings.institute_id == inst.id))
    sett = sett_res.scalar_one_or_none()
    if not sett:
        sett = InstituteSettings(institute_id=inst.id)
        db.add(sett)

    if payload.signatory_name is not None:
        sett.signatory_name = payload.signatory_name
    if payload.signatory_designation is not None:
        sett.signatory_designation = payload.signatory_designation
    if payload.signature_enabled is not None:
        sett.signature_enabled = payload.signature_enabled

    await db.commit()
    await db.refresh(inst)
    await db.refresh(sett)

    return InstituteSettingsOut(
        name=inst.name,
        code=inst.code,
        email=inst.email,
        phone=inst.phone,
        address=inst.address,
        currency_symbol=inst.currency_symbol,
        upi_id=inst.upi_id,
        receipt_prefix=inst.receipt_prefix,
        signatory_name=sett.signatory_name,
        signatory_designation=sett.signatory_designation,
        signature_image_path=sett.signature_image_path,
        signature_data_url=sett.signature_image_path if (sett.signature_image_path and sett.signature_image_path.startswith("data:")) else None,
        signature_enabled=bool(sett.signature_enabled)
    )

# Signature Settings
@router.get("/signature", response_model=SignatureSettingsOut)
async def get_signature_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    sett_res = await db.execute(select(InstituteSettings).where(InstituteSettings.institute_id == current_user.institute_id))
    sett = sett_res.scalar_one_or_none()
    if not sett:
        sett = InstituteSettings(
            institute_id=current_user.institute_id,
            signatory_name="Director / Authorized Signatory",
            signatory_designation="Director & Head of Institute",
            signature_enabled=True,
            signature_version=1
        )
        db.add(sett)
        await db.commit()
        await db.refresh(sett)

    return SignatureSettingsOut(
        signatory_name=sett.signatory_name or "Director / Authorized Signatory",
        signatory_designation=sett.signatory_designation or "Director & Head of Institute",
        signature_image_path=sett.signature_image_path,
        signature_data_url=sett.signature_image_path if (sett.signature_image_path and sett.signature_image_path.startswith("data:")) else None,
        signature_enabled=bool(sett.signature_enabled),
        signature_version=sett.signature_version or 1
    )

@router.put("/signature", response_model=SignatureSettingsOut)
async def update_signature_settings(
    payload: SignatureSettingsUpdate,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    sett_res = await db.execute(select(InstituteSettings).where(InstituteSettings.institute_id == current_user.institute_id))
    sett = sett_res.scalar_one_or_none()
    if not sett:
        sett = InstituteSettings(institute_id=current_user.institute_id)
        db.add(sett)

    if payload.signatory_name is not None:
        sett.signatory_name = payload.signatory_name
    if payload.signatory_designation is not None:
        sett.signatory_designation = payload.signatory_designation
    if payload.signature_enabled is not None:
        sett.signature_enabled = payload.signature_enabled
    if payload.signature_data_url is not None:
        sett.signature_image_path = payload.signature_data_url
        sett.signature_version = (sett.signature_version or 1) + 1
    elif payload.signature_image_path is not None:
        sett.signature_image_path = payload.signature_image_path
        sett.signature_version = (sett.signature_version or 1) + 1

    await db.commit()
    await db.refresh(sett)

    return SignatureSettingsOut(
        signatory_name=sett.signatory_name,
        signatory_designation=sett.signatory_designation,
        signature_image_path=sett.signature_image_path,
        signature_data_url=sett.signature_image_path if (sett.signature_image_path and sett.signature_image_path.startswith("data:")) else None,
        signature_enabled=bool(sett.signature_enabled),
        signature_version=sett.signature_version or 1
    )

@router.post("/signature/upload")
async def upload_signature_image(
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    content = await file.read()
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "png"
    safe_name = f"sig_{current_user.institute_id}_{int(datetime.utcnow().timestamp())}.{ext}"
    saved_path = os.path.join(SIGNATURES_DIR, safe_name)
    with open(saved_path, "wb") as f:
        f.write(content)

    # Convert to data URL for high portability and embedded rendering
    mime = "image/png" if ext == "png" else "image/jpeg"
    data_url = f"data:{mime};base64,{base64.b64encode(content).decode('utf-8')}"

    sett_res = await db.execute(select(InstituteSettings).where(InstituteSettings.institute_id == current_user.institute_id))
    sett = sett_res.scalar_one_or_none()
    if not sett:
        sett = InstituteSettings(institute_id=current_user.institute_id)
        db.add(sett)

    sett.signature_image_path = data_url
    sett.signature_enabled = True
    sett.signature_version = (sett.signature_version or 1) + 1
    await db.commit()

    return {
        "message": "Signature uploaded successfully",
        "file_path": saved_path,
        "data_url": data_url,
        "signature_version": sett.signature_version
    }

# UPI Accounts
@router.get("/upi-accounts", response_model=List[UpiAccountOut])
async def list_upi_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(UpiAccount)
        .where(UpiAccount.institute_id == current_user.institute_id)
        .order_by(UpiAccount.is_default.desc(), UpiAccount.created_at.desc())
    )
    res = await db.execute(stmt)
    accounts = res.scalars().all()
    if not accounts:
        # Check institute upi_id and create initial default
        inst_res = await db.execute(select(Institute).where(Institute.id == current_user.institute_id))
        inst = inst_res.scalar_one_or_none()
        if inst and inst.upi_id:
            default_acc = UpiAccount(
                institute_id=inst.id,
                account_holder_name=inst.name,
                upi_id=inst.upi_id,
                display_name="Primary Institute UPI",
                is_default=True,
                is_active=True
            )
            db.add(default_acc)
            await db.commit()
            await db.refresh(default_acc)
            return [default_acc]
    return accounts

@router.post("/upi-accounts", response_model=UpiAccountOut)
async def create_upi_account(
    payload: UpiAccountCreate,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    if payload.is_default:
        # Unset existing defaults
        await db.execute(
            update(UpiAccount)
            .where(UpiAccount.institute_id == current_user.institute_id)
            .values(is_default=False)
        )

    acc = UpiAccount(
        institute_id=current_user.institute_id,
        account_holder_name=payload.account_holder_name,
        upi_id=payload.upi_id,
        display_name=payload.display_name or payload.account_holder_name,
        is_default=payload.is_default,
        is_active=payload.is_active
    )
    db.add(acc)

    # If this is default, also sync to institute.upi_id
    if payload.is_default:
        inst_res = await db.execute(select(Institute).where(Institute.id == current_user.institute_id))
        inst = inst_res.scalar_one_or_none()
        if inst:
            inst.upi_id = payload.upi_id

    await db.commit()
    await db.refresh(acc)
    return acc

@router.put("/upi-accounts/{id}", response_model=UpiAccountOut)
async def update_upi_account(
    id: str,
    payload: UpiAccountUpdate,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UpiAccount).where(UpiAccount.id == id, UpiAccount.institute_id == current_user.institute_id)
    res = await db.execute(stmt)
    acc = res.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=404, detail="UPI account not found")

    if payload.is_default:
        await db.execute(
            update(UpiAccount)
            .where(UpiAccount.institute_id == current_user.institute_id)
            .values(is_default=False)
        )
        acc.is_default = True
        inst_res = await db.execute(select(Institute).where(Institute.id == current_user.institute_id))
        inst = inst_res.scalar_one_or_none()
        if inst:
            inst.upi_id = payload.upi_id or acc.upi_id
    elif payload.is_default is False:
        acc.is_default = False

    if payload.account_holder_name is not None:
        acc.account_holder_name = payload.account_holder_name
    if payload.upi_id is not None:
        acc.upi_id = payload.upi_id
    if payload.display_name is not None:
        acc.display_name = payload.display_name
    if payload.is_active is not None:
        acc.is_active = payload.is_active

    await db.commit()
    await db.refresh(acc)
    return acc

@router.delete("/upi-accounts/{id}")
async def delete_upi_account(
    id: str,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UpiAccount).where(UpiAccount.id == id, UpiAccount.institute_id == current_user.institute_id)
    res = await db.execute(stmt)
    acc = res.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=404, detail="UPI account not found")

    await db.delete(acc)
    await db.commit()
    return {"message": "UPI account deleted successfully", "id": id}

@router.post("/upi-accounts/{id}/set-default")
async def set_default_upi_account(
    id: str,
    current_user: User = Depends(require_roles(["admin"])),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(UpiAccount).where(UpiAccount.id == id, UpiAccount.institute_id == current_user.institute_id)
    res = await db.execute(stmt)
    acc = res.scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=404, detail="UPI account not found")

    await db.execute(
        update(UpiAccount)
        .where(UpiAccount.institute_id == current_user.institute_id)
        .values(is_default=False)
    )
    acc.is_default = True
    acc.is_active = True

    inst_res = await db.execute(select(Institute).where(Institute.id == current_user.institute_id))
    inst = inst_res.scalar_one_or_none()
    if inst:
        inst.upi_id = acc.upi_id

    await db.commit()
    return {"message": f"'{acc.display_name or acc.upi_id}' set as default UPI account", "id": id}
