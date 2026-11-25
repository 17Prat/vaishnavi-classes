from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EnquiryCreate(BaseModel):
    customer_name: str
    mobile_number: str
    email: Optional[str] = None
    service_type: str
    message: str

class EnquiryOut(BaseModel):
    id: str
    customer_name: str
    mobile_number: str
    email: Optional[str] = None
    service_type: str
    message: str
    source: str
    status: str
    whatsapp_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class EnquiryStatusUpdate(BaseModel):
    status: str
