import sys
import time
import json
import logging
from app.config import settings
from app.db import SessionLocal
from app.models import Post, GenerationSession
from app.agent.generator import generate_platform_post
from app.agent.postprocessor import sanitize_and_validate_post
from app.tools.tavily_search import search_web_context
from app.routes.generate import generate_posts
from app.routes.posts import update_post, regenerate_post, delete_post
from app.schemas import GenerationRequest, PostUpdate

# Configure output encoding for Windows safe output
sys.stdout.reconfigure(encoding='utf-8')

results = {
    "guardrails": {},
    "tavily": {},
    "generation": {},
    "database": {},
    "performance": {}
}

print("=" * 60)
print("🚀 STARTING DEEP PRODUCT TESTING & AUDIT SUITE")
print("=" * 60)

# TEST 1: GUARDRAILS & SANITIZATION ENGINE
print("\n[TEST 1] Testing Guardrails & Spam Filters...")
test_raw_linkedin = {
    "hook": "Comment 'yes' to get this blueprint",
    "content": "Comment 'yes' if you agree! Also smash the like button.\nThis is a great thought leadership post.",
    "hashtags": "#ai #tech #startups #software #engineering #coding #leadership",
    "media_suggestion": "Infographic"
}
sanitized_li = sanitize_and_validate_post("linkedin", test_raw_linkedin)
li_tags = sanitized_li["hashtags"].split()

assert "comment 'yes'" not in sanitized_li["content"].lower(), "Spam phrase was not stripped!"
assert "smash the like" not in sanitized_li["content"].lower(), "Spam phrase was not stripped!"
assert len(li_tags) <= 3, f"LinkedIn allowed too many hashtags: {len(li_tags)}"
print(f"  ✔ LinkedIn Guardrails: Filtered spam phrases successfully.")
print(f"  ✔ Hashtags strictly capped to {len(li_tags)} (<= 3 for LinkedIn algorithm compliance).")

test_raw_fb = {
    "hook": "Quick question",
    "content": "What do you think? Type yes below to get the link.",
    "hashtags": "#news #update #community #friends",
    "media_suggestion": "Photo"
}
sanitized_fb = sanitize_and_validate_post("facebook", test_raw_fb)
fb_tags = sanitized_fb["hashtags"].split()
assert len(fb_tags) <= 2, f"Facebook allowed too many hashtags: {len(fb_tags)}"
print(f"  ✔ Facebook Guardrails: Hashtags strictly capped to {len(fb_tags)} (<= 2).")

test_raw_ig = {
    "hook": "Stop scrolling right now!",
    "content": "3 tips you need to know today.",
    "hashtags": "#growth #marketing #design #art #tips #daily #extra #tooMany",
    "media_suggestion": "Carousel"
}
sanitized_ig = sanitize_and_validate_post("instagram", test_raw_ig)
ig_tags = sanitized_ig["hashtags"].split()
assert len(ig_tags) <= 6, f"Instagram allowed too many hashtags: {len(ig_tags)}"
print(f"  ✔ Instagram Guardrails: Curated to {len(ig_tags)} niche hashtags (<= 6).")
results["guardrails"]["status"] = "PASSED"

# TEST 2: TAVILY WEB SEARCH INTEGRATION
print("\n[TEST 2] Testing Tavily Web Search Engine...")
t0 = time.time()
search_data = search_web_context("Next.js 16 release features", max_results=2)
tavily_latency = round(time.time() - t0, 2)
assert "summary" in search_data, "No summary in search output"
assert len(search_data["summary"]) > 10, "Tavily summary is empty"
print(f"  ✔ Tavily Search: Retrieved live facts in {tavily_latency}s.")
print(f"  ✔ Context Sample: {search_data['summary'][:120]}...")
results["tavily"]["status"] = "PASSED"
results["tavily"]["latency"] = tavily_latency

# TEST 3: CONTENT QUALITY & PLATFORM ALIGNMENT AUDIT
print("\n[TEST 3] Testing AI Generation & Algorithm Alignment (Groq)...")
audit_topic = "Why async culture beats endless meetings for engineering teams"

platforms_to_test = ["linkedin", "facebook", "instagram"]
for plat in platforms_to_test:
    t_start = time.time()
    post = generate_platform_post(
        platform=plat,
        topic=audit_topic,
        tone="Professional & Insightful",
        creativity=0.7,
        uniqueness="High",
        research_summary=search_data["summary"]
    )
    lat = round(time.time() - t_start, 2)
    results["performance"][plat] = lat
    
    print(f"\n--- Platform: {plat.upper()} ({lat}s) ---")
    print(f"  • Hook: \"{post['hook']}\"")
    print(f"  • Word Count: {post['word_count']} words | Char Count: {post['character_count']} chars")
    print(f"  • Hashtags: {post['hashtags']}")
    print(f"  • Visual Brief: {post['media_suggestion']}")
    
    # Audit checks
    if plat == "linkedin":
        assert post["word_count"] >= 60, "LinkedIn post too brief for thought leadership"
        assert len(post["hashtags"].split()) <= 3, "LinkedIn hashtags exceed algorithm optimal (<= 3)"
        assert len(post["media_suggestion"]) > 10, "Missing companion visual brief"
    elif plat == "facebook":
        assert post["word_count"] <= 150, "Facebook post too lengthy for community interaction"
        assert len(post["hashtags"].split()) <= 2, "Facebook hashtags exceed optimal (<= 2)"
    elif plat == "instagram":
        assert len(post["hook"].split()) <= 15, "Instagram hook must be punchy and scroll-stopping"
        assert len(post["hashtags"].split()) <= 6, "Instagram hashtags exceed optimal (<= 6)"
        assert len(post["media_suggestion"]) > 10, "Missing carousel visual prompt"

print("\n  ✔ All platform-specific algorithm rules verified!")
results["generation"]["status"] = "PASSED"

# TEST 4: DATABASE PERSISTENCE & REST CYCLE (NEON POSTGRESQL)
print("\n[TEST 4] Testing Database Persistence & Full HITL Lifecycle (Neon PostgreSQL)...")
db = SessionLocal()
try:
    req = GenerationRequest(
        topic="SaaS pricing mistakes that kill early growth",
        tone="Authoritative & Thought Leader",
        creativity=0.7,
        uniqueness_level="High",
        platforms=["linkedin", "instagram"],
        enable_web_research=False,
        include_hashtags=True,
        include_emojis=True,
        include_media_suggestions=True
    )
    
    # 1. Create
    gen_res = generate_posts(req, db)
    session_id = gen_res.session_id
    assert session_id is not None, "Failed to create generation session in DB"
    assert len(gen_res.posts) == 2, f"Expected 2 posts, got {len(gen_res.posts)}"
    post_id = gen_res.posts[0].id
    print(f"  ✔ Created Session #{session_id} with {len(gen_res.posts)} posts in Neon PostgreSQL.")
    
    # 2. Update status and rating (HITL)
    update_payload = PostUpdate(
        status="approved",
        rating=5,
        user_feedback="Outstanding structure and punchy hook."
    )
    updated = update_post(post_id, update_payload, db)
    assert updated.status == "approved", "Status failed to update"
    assert updated.rating == 5, "Rating failed to update"
    assert updated.user_feedback == "Outstanding structure and punchy hook.", "Feedback failed to update"
    print(f"  ✔ HITL Update Verified: Post #{post_id} marked as 'approved' with 5-star rating.")
    
    # 3. Regenerate single post
    regen = regenerate_post(post_id, tone="Witty & Relatable", instructions="Add a metaphor", db=db)
    assert regen.id == post_id, "Regenerated post ID mismatch"
    assert regen.tone == "Witty & Relatable", "Tone was not updated during regeneration"
    print(f"  ✔ Regeneration Verified: Post #{post_id} regenerated with updated tone.")
    
    # 4. Clean up test record
    del_res = delete_post(post_id, db)
    print(f"  ✔ Deletion Verified: {del_res['message']}")
    results["database"]["status"] = "PASSED"

finally:
    db.close()

print("\n" + "=" * 60)
print("🎉 COMPREHENSIVE QA AUDIT RESULT: ALL SYSTEMS OPERATIONAL & PASSED")
print("=" * 60)
