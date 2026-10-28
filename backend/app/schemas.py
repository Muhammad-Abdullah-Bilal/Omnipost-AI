from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class GenerationRequest(BaseModel):
    topic: str = Field(..., description="The main subject or idea for the post")
    tone: str = Field("Professional & Insightful", description="Tone of voice")
    creativity: float = Field(0.7, ge=0.0, le=1.0, description="Creativity temperature")
    uniqueness_level: str = Field("High", description="Uniqueness preference: High, Medium, Standard")
    platforms: List[str] = Field(default=["linkedin", "facebook", "instagram"], description="Target platforms")
    enable_web_research: bool = Field(True, description="Whether to fetch real-time facts via Tavily")
    include_hashtags: bool = Field(True, description="Whether to include platform-optimal hashtags")
    include_emojis: bool = Field(True, description="Whether to include emojis")
    include_media_suggestions: bool = Field(True, description="Provide prompt/idea for companion visuals")
    model: Optional[str] = Field(None, description="Optional LLM model override (e.g. openai/gpt-oss-120b, openai/gpt-oss-20b)")
    custom_instructions: Optional[str] = Field(None, description="Optional extra directives")

class PostResponse(BaseModel):
    id: int
    session_id: Optional[int] = None
    platform: str
    topic: str
    tone: str
    content: str
    hook: Optional[str] = None
    hashtags: Optional[str] = None
    media_suggestion: Optional[str] = None
    character_count: int
    word_count: int
    status: str
    rating: Optional[int] = None
    user_feedback: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PostUpdate(BaseModel):
    content: Optional[str] = None
    status: Optional[str] = None # draft, approved, scheduled, rejected
    rating: Optional[int] = None
    user_feedback: Optional[str] = None

class GenerationResult(BaseModel):
    session_id: int
    research_summary: Optional[str] = None
    posts: List[PostResponse]

class ResearchRequest(BaseModel):
    query: str

class ResearchResponse(BaseModel):
    query: str
    summary: str
    results: List[dict]
