from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db import get_db
from app.models import Post
from app.schemas import PostResponse, PostUpdate
from app.agent.generator import generate_platform_post

router = APIRouter(prefix="/posts", tags=["Posts Management"])

@router.get("", response_model=List[PostResponse])
def get_posts(
    platform: Optional[str] = Query(None, description="Filter by platform"),
    status: Optional[str] = Query(None, description="Filter by status (draft, approved, scheduled, rejected)"),
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    query = db.query(Post)
    if platform:
        query = query.filter(Post.platform == platform.lower())
    if status:
        query = query.filter(Post.status == status.lower())
    
    posts = query.order_by(Post.created_at.desc()).offset(offset).limit(limit).all()
    return [PostResponse.model_validate(p) for p in posts]


@router.get("/{post_id}", response_model=PostResponse)
def get_single_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return PostResponse.model_validate(post)


@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, payload: PostUpdate, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if payload.content is not None:
        post.content = payload.content
        post.word_count = len(payload.content.split())
        post.character_count = len(payload.content)
    if payload.status is not None:
        post.status = payload.status
    if payload.rating is not None:
        post.rating = payload.rating
    if payload.user_feedback is not None:
        post.user_feedback = payload.user_feedback

    db.commit()
    db.refresh(post)
    return PostResponse.model_validate(post)


@router.post("/{post_id}/regenerate", response_model=PostResponse)
def regenerate_post(
    post_id: int,
    tone: Optional[str] = None,
    creativity: Optional[float] = 0.7,
    instructions: Optional[str] = None,
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    use_tone = tone or post.tone
    regenerated = generate_platform_post(
        platform=post.platform,
        topic=post.topic,
        tone=use_tone,
        creativity=creativity or 0.7,
        custom_instructions=instructions or ""
    )

    post.content = regenerated.get("content", post.content)
    post.hook = regenerated.get("hook", post.hook)
    post.hashtags = regenerated.get("hashtags", post.hashtags)
    post.media_suggestion = regenerated.get("media_suggestion", post.media_suggestion)
    post.word_count = regenerated.get("word_count", post.word_count)
    post.character_count = regenerated.get("character_count", post.character_count)
    post.tone = use_tone

    db.commit()
    db.refresh(post)
    return PostResponse.model_validate(post)


@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(post)
    db.commit()
    return {"message": f"Post {post_id} successfully deleted"}
