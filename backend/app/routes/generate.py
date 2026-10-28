from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import GenerationSession, Post
from app.schemas import GenerationRequest, GenerationResult, ResearchRequest, ResearchResponse, PostResponse
from app.tools.tavily_search import search_web_context
from app.agent.generator import generate_platform_post

router = APIRouter(prefix="", tags=["Generation & Research"])

@router.post("/generate", response_model=GenerationResult)
def generate_posts(payload: GenerationRequest, db: Session = Depends(get_db)):
    """
    Main agent endpoint:
    1. Conducts web research (Tavily) if enabled.
    2. Generates tailored drafts for each requested platform using LLM & algorithm best practices.
    3. Persists the session and post records in the database.
    """
    research_summary = ""
    if payload.enable_web_research:
        search_res = search_web_context(payload.topic)
        research_summary = search_res.get("summary", "")

    # Create generation session
    session_record = GenerationSession(
        topic=payload.topic,
        tone=payload.tone,
        creativity=payload.creativity,
        target_platforms=",".join(payload.platforms),
        research_context=research_summary
    )
    db.add(session_record)
    db.commit()
    db.refresh(session_record)

    generated_posts = []
    for platform in payload.platforms:
        clean_platform = platform.strip().lower()
        post_data = generate_platform_post(
            platform=clean_platform,
            topic=payload.topic,
            tone=payload.tone,
            creativity=payload.creativity,
            uniqueness=payload.uniqueness_level,
            research_summary=research_summary,
            custom_instructions=payload.custom_instructions or "",
            model_override=payload.model
        )

        post_record = Post(
            session_id=session_record.id,
            platform=clean_platform,
            topic=payload.topic,
            tone=payload.tone,
            content=post_data.get("content", ""),
            hook=post_data.get("hook", ""),
            hashtags=post_data.get("hashtags", ""),
            media_suggestion=post_data.get("media_suggestion", ""),
            word_count=post_data.get("word_count", 0),
            character_count=post_data.get("character_count", 0),
            status="draft"
        )
        db.add(post_record)
        generated_posts.append(post_record)

    db.commit()
    for p in generated_posts:
        db.refresh(p)

    return GenerationResult(
        session_id=session_record.id,
        research_summary=research_summary,
        posts=[PostResponse.model_validate(p) for p in generated_posts]
    )

@router.post("/research", response_model=ResearchResponse)
def execute_research(payload: ResearchRequest):
    """Standalone endpoint for testing live web research via Tavily."""
    res = search_web_context(payload.query)
    return ResearchResponse(
        query=res.get("query", payload.query),
        summary=res.get("summary", ""),
        results=res.get("results", [])
    )
