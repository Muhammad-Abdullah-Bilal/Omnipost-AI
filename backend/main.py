from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db import engine, Base
from app.routes.generate import router as generate_router
from app.routes.posts import router as posts_router

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for AI-Driven Social Media Post Writing Agent (LinkedIn, Facebook, Instagram)",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(generate_router, prefix="/api")
app.include_router(posts_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "database": "connected (Neon PostgreSQL)" if "neon.tech" in settings.DATABASE_URL else "local (SQLite)",
        "groq_configured": bool(settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip()),
        "groq_model": settings.GROQ_MODEL,
        "openai_configured": bool(settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip()),
        "openai_model": settings.OPENAI_MODEL,
        "tavily_configured": bool(settings.TAVILY_API_KEY and settings.TAVILY_API_KEY.strip())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
