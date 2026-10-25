from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models.guide import Category, Guide
from app.models.user import User
from app.schemas.guide import CategoryOut, CategoryCreate

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.display_order.asc(), Category.name.asc()).all()
    result = []
    for cat in categories:
        count = db.query(Guide).filter(Guide.category_id == cat.id).count()
        cat_out = CategoryOut.model_validate(cat)
        cat_out.guide_count = count
        result.append(cat_out)
    return result

@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    existing = db.query(Category).filter(Category.slug == cat_in.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category slug already exists")
    
    category = Category(**cat_in.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    cat_out = CategoryOut.model_validate(category)
    cat_out.guide_count = 0
    return cat_out
