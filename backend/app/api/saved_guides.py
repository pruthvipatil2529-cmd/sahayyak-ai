from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.guide import Guide, SavedGuide
from app.models.user import User
from app.schemas.guide import SavedGuideOut, GuideOut

router = APIRouter(prefix="/saved-guides", tags=["Saved Guides"])

@router.get("", response_model=List[SavedGuideOut])
def get_saved_guides(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved_items = db.query(SavedGuide).filter(SavedGuide.user_id == current_user.id).all()
    results = []
    for item in saved_items:
        g = item.guide
        g_out = GuideOut.model_validate(g)
        g_out.is_saved = True
        
        s_out = SavedGuideOut.model_validate(item)
        s_out.guide = g_out
        results.append(s_out)
    return results

@router.post("/{guide_id}", response_model=SavedGuideOut, status_code=status.HTTP_201_CREATED)
def save_guide(
    guide_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")

    existing = db.query(SavedGuide).filter(
        SavedGuide.user_id == current_user.id,
        SavedGuide.guide_id == guide_id
    ).first()

    if existing:
        return existing

    saved = SavedGuide(user_id=current_user.id, guide_id=guide_id)
    db.add(saved)
    db.commit()
    db.refresh(saved)
    return saved

@router.delete("/{guide_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_saved_guide(
    guide_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved = db.query(SavedGuide).filter(
        SavedGuide.user_id == current_user.id,
        SavedGuide.guide_id == guide_id
    ).first()

    if not saved:
        raise HTTPException(status_code=404, detail="Saved guide not found")

    db.delete(saved)
    db.commit()
    return None
