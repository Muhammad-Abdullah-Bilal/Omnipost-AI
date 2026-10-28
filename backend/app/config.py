import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Social Media Post Writing Agent"
    API_V1_STR: str = "/api"
    
    # Groq Configuration (Primary LLM Engine)
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    
    # OpenAI Configuration (Fallback)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    
    # Tavily Web Search
    TAVILY_API_KEY: Optional[str] = os.getenv("TAVILY_API_KEY", "")
    
    # PostgreSQL / NeonDB Connection String
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./posts_local.db")
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
