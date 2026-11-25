from sqlalchemy import Column, String, Text, ForeignKey
from app.database import Base
from app.models.base import UUIDPrimaryKeyMixin, TimestampMixin

class Enquiry(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "enquiries"

    institute_id = Column(String(36), ForeignKey("institutes.id", ondelete="CASCADE"), nullable=True, index=True)
    customer_name = Column(String(150), nullable=False)
    mobile_number = Column(String(30), nullable=False, index=True)
    email = Column(String(150), nullable=True)
    service_type = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    source = Column(String(50), default="Website Contact Form", nullable=False)
    status = Column(String(30), default="pending", nullable=False) # pending, contacted, converted, closed
