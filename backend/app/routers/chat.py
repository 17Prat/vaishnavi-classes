from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime
from app.database import get_db, AsyncSessionLocal
from app.models.chat import Conversation, ConversationMember, Message
from app.models.user import User
from app.schemas.chat import MessageCreate, MessageOut, ConversationOut
from app.services.chat_service import manager
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/chat", tags=["Real-Time Chat"])

@router.websocket("/ws/{user_id}")
async def websocket_chat_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Handle incoming message or ping
            msg_type = data.get("type", "message")
            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
            elif msg_type == "chat_message":
                conv_id = data.get("conversation_id")
                content = data.get("content")
                if conv_id and content:
                    async with AsyncSessionLocal() as session:
                        msg = Message(
                            conversation_id=conv_id,
                            sender_id=user_id,
                            content=content,
                            is_read=False
                        )
                        session.add(msg)

                        # Update conversation timestamp
                        c_stmt = select(Conversation).where(Conversation.id == conv_id).options(selectinload(Conversation.members))
                        c_res = await session.execute(c_stmt)
                        conv = c_res.scalar_one_or_none()
                        if conv:
                            conv.last_message_at = datetime.utcnow()
                            await session.commit()
                            await session.refresh(msg)

                            # Broadcast to all conversation members
                            target_users = [m.user_id for m in conv.members]
                            payload = {
                                "type": "new_message",
                                "message": {
                                    "id": msg.id,
                                    "conversation_id": conv_id,
                                    "sender_id": user_id,
                                    "content": content,
                                    "created_at": msg.created_at.isoformat()
                                }
                            }
                            await manager.broadcast_to_users(payload, target_users)
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)
    except Exception:
        manager.disconnect(user_id, websocket)

@router.get("/contacts")
async def list_chat_contacts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .where(
            and_(
                User.institute_id == current_user.institute_id,
                User.id != current_user.id
            )
        )
        .order_by(User.role.asc(), User.full_name.asc())
    )
    res = await db.execute(stmt)
    users = res.scalars().all()
    return [
        {
            "id": u.id,
            "login_id": u.login_id,
            "full_name": u.full_name,
            "role": u.role,
            "phone": u.phone or ""
        }
        for u in users
    ]

@router.get("/conversations", response_model=List[ConversationOut])
async def list_user_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Find all conversations where current_user is a member
    stmt = (
        select(Conversation)
        .join(ConversationMember)
        .where(ConversationMember.user_id == current_user.id)
        .options(
            selectinload(Conversation.members).selectinload(ConversationMember.user),
            selectinload(Conversation.messages)
        )
        .order_by(Conversation.last_message_at.desc())
    )
    res = await db.execute(stmt)
    conversations = res.scalars().all()

    # If user has no conversations yet, auto-create the default Campus Channel
    if not conversations:
        default_channel = Conversation(
            institute_id=current_user.institute_id,
            title="Vaishnavi Classes — Campus Notice & Chat Channel",
            is_direct=False,
            last_message_at=datetime.utcnow()
        )
        db.add(default_channel)
        await db.flush()

        # Add current user
        m1 = ConversationMember(conversation_id=default_channel.id, user_id=current_user.id)
        db.add(m1)

        # Welcome message
        welcome_msg = Message(
            conversation_id=default_channel.id,
            sender_id=current_user.id,
            content="Welcome to the Vaishnavi Classes Real-Time Discussion Portal! Send your queries or fee updates here.",
            is_read=True
        )
        db.add(welcome_msg)
        await db.commit()

        # Re-fetch
        res2 = await db.execute(stmt)
        conversations = res2.scalars().all()

    out = []
    for conv in conversations:
        other_members = [m.user for m in conv.members if m.user_id != current_user.id]
        names = [u.full_name for u in other_members] if other_members else ["Only You"]
        uids = [u.id for u in other_members]

        last_msg = conv.messages[-1].content if conv.messages else None
        unread = sum(1 for m in conv.messages if not m.is_read and m.sender_id != current_user.id)

        out.append(ConversationOut(
            id=conv.id,
            title=conv.title or (", ".join(names)),
            is_direct=conv.is_direct,
            participant_names=names,
            participant_ids=uids,
            last_message=last_msg,
            last_message_at=conv.last_message_at,
            unread_count=unread
        ))
    return out

@router.get("/messages/{conversation_id}", response_model=List[MessageOut])
async def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .options(selectinload(Message.sender))
        .order_by(Message.created_at.asc())
    )
    res = await db.execute(stmt)
    messages = res.scalars().all()

    # Mark as read
    for m in messages:
        if m.sender_id != current_user.id and not m.is_read:
            m.is_read = True
    await db.commit()

    out = []
    for m in messages:
        out.append(MessageOut(
            id=m.id,
            conversation_id=m.conversation_id,
            sender_id=m.sender_id,
            sender_name=m.sender.full_name if m.sender else "Unknown",
            sender_role=m.sender.role if m.sender else "user",
            content=m.content,
            is_read=m.is_read,
            created_at=m.created_at
        ))
    return out

@router.post("/messages", response_model=MessageOut)
async def send_chat_message(
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    conv_id = payload.conversation_id

    # If starting a direct conversation with a recipient user
    if not conv_id and payload.recipient_user_id:
        # Check if conversation already exists
        conv = Conversation(
            institute_id=current_user.institute_id,
            title=None,
            is_direct=True,
            last_message_at=datetime.utcnow()
        )
        db.add(conv)
        await db.flush()

        m1 = ConversationMember(conversation_id=conv.id, user_id=current_user.id)
        m2 = ConversationMember(conversation_id=conv.id, user_id=payload.recipient_user_id)
        db.add_all([m1, m2])
        conv_id = conv.id

    if not conv_id:
        raise HTTPException(status_code=400, detail="conversation_id or recipient_user_id required")

    msg = Message(
        conversation_id=conv_id,
        sender_id=current_user.id,
        content=payload.content,
        is_read=False
    )
    db.add(msg)

    # Update conversation last_message_at
    c_stmt = select(Conversation).where(Conversation.id == conv_id).options(selectinload(Conversation.members))
    c_res = await db.execute(c_stmt)
    conv = c_res.scalar_one_or_none()
    if conv:
        conv.last_message_at = datetime.utcnow()

    await db.commit()
    await db.refresh(msg)

    # Broadcast via WebSocket
    if conv:
        target_users = [m.user_id for m in conv.members]
        ws_payload = {
            "type": "new_message",
            "message": {
                "id": msg.id,
                "conversation_id": conv_id,
                "sender_id": current_user.id,
                "sender_name": current_user.full_name,
                "sender_role": current_user.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
            }
        }
        await manager.broadcast_to_users(ws_payload, target_users)

    return MessageOut(
        id=msg.id,
        conversation_id=msg.conversation_id,
        sender_id=current_user.id,
        sender_name=current_user.full_name,
        sender_role=current_user.role,
        content=msg.content,
        is_read=msg.is_read,
        created_at=msg.created_at
    )
