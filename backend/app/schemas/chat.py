from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MessageCreate(BaseModel):
    conversation_id: Optional[str] = None
    recipient_user_id: Optional[str] = None # For 1-to-1 conversation initiation
    content: str = Field(..., min_length=1)

class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    id: str
    title: Optional[str] = None
    is_direct: bool
    participant_names: List[str]
    participant_ids: List[str]
    last_message: Optional[str] = None
    last_message_at: datetime
    unread_count: int = 0

    class Config:
        from_attributes = True
