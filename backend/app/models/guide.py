from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=True)
    name_mr = Column(String(100), nullable=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), default="Smartphone")
    display_order = Column(Integer, default=0)

    guides = relationship("Guide", back_populates="category", cascade="all, delete-orphan")


class Guide(Base):
    __tablename__ = "guides"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    # Multilingual Titles & Descriptions
    title = Column(String(200), nullable=False, index=True)
    title_hi = Column(String(200), nullable=True)
    title_mr = Column(String(200), nullable=True)
    
    description = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=True)
    description_mr = Column(Text, nullable=True)
    
    difficulty = Column(String(50), default="Easy") # Easy, Medium
    
    # JSON strings containing array of steps [{step: 1, text: "...", detail: "...", text_hi: "...", text_mr: "..."}]
    steps_json = Column(Text, nullable=False)
    
    # JSON strings containing safety tips [{tip: "...", tip_hi: "...", tip_mr: "..."}]
    safety_tips_json = Column(Text, nullable=True)
    
    # JSON array of guide IDs or search queries
    related_guides_json = Column(Text, nullable=True)
    
    tags = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="guides")
    saved_by_users = relationship("SavedGuide", back_populates="guide", cascade="all, delete-orphan")


class SavedGuide(Base):
    __tablename__ = "saved_guides"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    guide_id = Column(Integer, ForeignKey("guides.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_guides")
    guide = relationship("Guide", back_populates="saved_by_users")
