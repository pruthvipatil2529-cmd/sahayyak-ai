import json
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_optional_current_user
from app.models.user import User
from app.models.guide import Guide
from app.models.conversation import Conversation, Message
from app.schemas.ai import AIChatRequest, AIChatResponse
from app.services.safety_service import inspect_safety
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["AI"])

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(
    req: AIChatRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    lang = req.language or (current_user.preferred_language if current_user else "en")
    
    # 1. Safety check & sanitization
    is_flagged, safety_warning, safe_message = inspect_safety(req.message, language=lang)

    # 2. Retrieve guides for context/related recommendations
    guides = db.query(Guide).all()

    # 3. Format conversation history
    history = []
    if req.conversation_history:
        history = [item.model_dump() for item in req.conversation_history]

    # 4. Generate structured response
    ai_result = await ai_service.generate_response(
        message=safe_message,
        language=lang,
        conversation_history=history,
        db_guides=guides
    )

    combined_warning = safety_warning or ai_result.get("safety_warning")

    # 5. Persist conversation and messages if authenticated or continuing conversation
    active_conv_id = req.conversation_id
    if current_user or active_conv_id:
        conversation = None
        if active_conv_id:
            conversation = db.query(Conversation).filter(Conversation.id == active_conv_id).first()
        
        if not conversation:
            title = req.message[:50] + ("..." if len(req.message) > 50 else "")
            conversation = Conversation(
                user_id=current_user.id if current_user else None,
                title=title
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
        
        active_conv_id = conversation.id

        # Save user message
        user_msg = Message(
            conversation_id=conversation.id,
            role="user",
            content=safe_message,
            language=lang,
            safety_warning=safety_warning
        )
        db.add(user_msg)

        # Save assistant message
        steps_json_str = json.dumps(ai_result.get("steps", []))
        assistant_msg = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=ai_result.get("answer", ""),
            language=lang,
            steps_json=steps_json_str,
            safety_warning=combined_warning
        )
        db.add(assistant_msg)
        db.commit()

    return AIChatResponse(
        conversation_id=active_conv_id,
        answer=ai_result.get("answer", ""),
        intro=ai_result.get("intro"),
        closing=ai_result.get("closing"),
        language=lang,
        steps=ai_result.get("steps", []),
        safety_warning=combined_warning,
        related_guides=ai_result.get("related_guides", [])
    )
