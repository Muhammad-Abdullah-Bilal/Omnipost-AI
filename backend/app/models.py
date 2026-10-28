import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class GenerationSession(Base):
    __tablename__ = "generation_sessions"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(500), nullable=False)
    tone = Column(String(100), default="Professional & Insightful")
    creativity = Column(Float, default=0.7)
    target_platforms = Column(String(200), default="linkedin,facebook,instagram")
    research_context = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    posts = relationship("Post", back_populates="session", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("generation_sessions.id", ondelete="SET NULL"), nullable=True)
    platform = Column(String(50), nullable=False, index=True) # linkedin, facebook, instagram
    topic = Column(String(500), nullable=False)
    tone = Column(String(100), default="Professional")
    content = Column(Text, nullable=False)
    hook = Column(Text, nullable=True)
    hashtags = Column(Text, nullable=True) # JSON or comma separated
    media_suggestion = Column(Text, nullable=True) # companion visual idea/prompt
    character_count = Column(Integer, default=0)
    word_count = Column(Integer, default=0)
    status = Column(String(50), default="draft") # draft, approved, scheduled, rejected
    rating = Column(Integer, nullable=True) # 1 to 5
    user_feedback = Column(Text, nullable=True) # HITL feedback
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    session = relationship("GenerationSession", back_populates="posts")


class StyleMemory(Base):
    __tablename__ = "style_memories"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    sample_text = Column(Text, nullable=False)
    insights = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
