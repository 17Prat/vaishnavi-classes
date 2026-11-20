import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class UUIDPrimaryKeyMixin:
    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)

class TimestampMixin:
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
