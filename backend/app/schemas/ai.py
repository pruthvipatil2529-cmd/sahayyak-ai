from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatHistoryItem(BaseModel):
    role: str # 'user' or 'assistant'
    content: str

class AIChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en" # 'en', 'hi', 'mr'
    conversation_id: Optional[int] = None
    conversation_history: Optional[List[ChatHistoryItem]] = []
    category: Optional[str] = None

class AIChatResponse(BaseModel):
    conversation_id: Optional[int] = None
    answer: str
    intro: Optional[str] = None
    closing: Optional[str] = None
    language: str
    steps: Optional[List[Dict[str, Any]]] = []
    safety_warning: Optional[str] = None
    related_guides: Optional[List[Dict[str, Any]]] = []

class MessageOut(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    language: str
    steps_json: Optional[str] = None
    safety_warning: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationOut(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: Optional[List[MessageOut]] = []

    model_config = ConfigDict(from_attributes=True)
