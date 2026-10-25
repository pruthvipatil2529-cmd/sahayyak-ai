from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.api.deps import get_optional_current_user, get_current_admin
from app.models.guide import Guide, Category, SavedGuide
from app.models.user import User
from app.schemas.guide import GuideOut, GuideCreate, GuideUpdate

router = APIRouter(prefix="/guides", tags=["Guides"])

@router.get("", response_model=List[GuideOut])
def get_guides(
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search by title, description or tags"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    query = db.query(Guide)
    if category_id:
        query = query.filter(Guide.category_id == category_id)
    if difficulty:
        query = query.filter(Guide.difficulty.ilike(difficulty))
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Guide.title.ilike(search_pattern),
                Guide.title_hi.ilike(search_pattern),
                Guide.title_mr.ilike(search_pattern),
                Guide.description.ilike(search_pattern),
                Guide.tags.ilike(search_pattern)
            )
        )

    guides = query.order_by(Guide.id.asc()).all()

    # Determine which guides are saved by the current user
    saved_guide_ids = set()
    if current_user:
        saved = db.query(SavedGuide.guide_id).filter(SavedGuide.user_id == current_user.id).all()
        saved_guide_ids = {s[0] for s in saved}

    results = []
    for g in guides:
        g_out = GuideOut.model_validate(g)
        g_out.is_saved = g.id in saved_guide_ids
        results.append(g_out)

    return results

@router.get("/{guide_id}", response_model=GuideOut)
def get_guide_by_id(
    guide_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")

    is_saved = False
    if current_user:
        is_saved = db.query(SavedGuide).filter(
            SavedGuide.user_id == current_user.id,
            SavedGuide.guide_id == guide_id
        ).first() is not None

    g_out = GuideOut.model_validate(guide)
    g_out.is_saved = is_saved
    return g_out

@router.post("", response_model=GuideOut, status_code=status.HTTP_201_CREATED)
def create_guide(
    guide_in: GuideCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    # Verify category exists
    category = db.query(Category).filter(Category.id == guide_in.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="Invalid category ID")

    guide = Guide(**guide_in.model_dump())
    db.add(guide)
    db.commit()
    db.refresh(guide)
    return GuideOut.model_validate(guide)

@router.put("/{guide_id}", response_model=GuideOut)
def update_guide(
    guide_id: int,
    guide_update: GuideUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")

    update_data = guide_update.model_dump(exclude_unset=True)
    if "category_id" in update_data and update_data["category_id"] is not None:
        cat = db.query(Category).filter(Category.id == update_data["category_id"]).first()
        if not cat:
            raise HTTPException(status_code=400, detail="Category does not exist")

    for field, value in update_data.items():
        setattr(guide, field, value)

    db.commit()
    db.refresh(guide)
    return GuideOut.model_validate(guide)

@router.delete("/{guide_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_guide(
    guide_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    guide = db.query(Guide).filter(Guide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")

    db.delete(guide)
    db.commit()
    return None
