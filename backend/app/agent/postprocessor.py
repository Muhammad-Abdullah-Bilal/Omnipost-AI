import re
from typing import Dict, Any

SPAMMY_PHRASES = [
    "comment 'yes'",
    "type yes",
    "smash the like",
    "like and share to win",
    "click link in bio or else"
]

def sanitize_and_validate_post(platform: str, post_data: Dict[str, Any]) -> Dict[str, Any]:
    content = post_data.get("content", "").strip()
    hook = post_data.get("hook", "").strip()
    hashtags = post_data.get("hashtags", "").strip()
    media_suggestion = post_data.get("media_suggestion", "").strip()

    # Calculate word and char count
    words = len(content.split())
    chars = len(content)

    # Check for spam triggers and clean them
    lower_content = content.lower()
    for phrase in SPAMMY_PHRASES:
        if phrase in lower_content:
            content = re.sub(re.escape(phrase), "share your thoughts", content, flags=re.IGNORECASE)

    # Clean hashtags
    tag_list = re.findall(r"#\w+", hashtags)
    if platform.lower() == "linkedin":
        # Keep maximum 3 hashtags for LinkedIn
        tag_list = tag_list[:3]
    elif platform.lower() == "facebook":
        # Keep maximum 2 hashtags for Facebook
        tag_list = tag_list[:2]
    elif platform.lower() == "instagram":
        # Keep 4-6 hashtags for Instagram
        tag_list = tag_list[:6]

    clean_hashtags = " ".join(tag_list) if tag_list else ""

    # If hashtags are not at the end of content and user platform is IG/LinkedIn, append if missing
    if clean_hashtags and clean_hashtags not in content:
        # We store hashtags in the separate field and optionally append to full text
        pass

    return {
        "hook": hook,
        "content": content,
        "hashtags": clean_hashtags,
        "media_suggestion": media_suggestion,
        "word_count": words,
        "character_count": chars
    }
