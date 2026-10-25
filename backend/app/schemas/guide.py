from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    name_hi: Optional[str] = None
    name_mr: Optional[str] = None
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = "Smartphone"
    display_order: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    guide_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class GuideStep(BaseModel):
    step_number: int
    title: str
    instruction: str
    tip: Optional[str] = None
    instruction_hi: Optional[str] = None
    instruction_mr: Optional[str] = None

class GuideBase(BaseModel):
    category_id: int
    title: str
    title_hi: Optional[str] = None
    title_mr: Optional[str] = None
    description: str
    description_hi: Optional[str] = None
    description_mr: Optional[str] = None
    difficulty: Optional[str] = "Easy"
    steps_json: str # JSON string of steps
    safety_tips_json: Optional[str] = "[]"
    related_guides_json: Optional[str] = "[]"
    tags: Optional[str] = None

class GuideCreate(GuideBase):
    pass

class GuideUpdate(BaseModel):
    category_id: Optional[int] = None
    title: Optional[str] = None
    title_hi: Optional[str] = None
    title_mr: Optional[str] = None
    description: Optional[str] = None
    description_hi: Optional[str] = None
    description_mr: Optional[str] = None
    difficulty: Optional[str] = None
    steps_json: Optional[str] = None
    safety_tips_json: Optional[str] = None
    related_guides_json: Optional[str] = None
    tags: Optional[str] = None

class GuideOut(GuideBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryBase] = None
    is_saved: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)

class SavedGuideOut(BaseModel):
    id: int
    user_id: int
    guide_id: int
    created_at: datetime
    guide: Optional[GuideOut] = None

    model_config = ConfigDict(from_attributes=True)
