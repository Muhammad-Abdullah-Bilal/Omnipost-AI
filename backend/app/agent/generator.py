import json
import logging
import re
from typing import Dict, Any, Optional
from app.config import settings
from app.agent.prompts import PLATFORM_PROMPT_SYSTEM, build_user_prompt
from app.agent.postprocessor import sanitize_and_validate_post

logger = logging.getLogger(__name__)

def generate_platform_post(
    platform: str,
    topic: str,
    tone: str = "Professional & Insightful",
    creativity: float = 0.7,
    uniqueness: str = "High",
    research_summary: str = "",
    custom_instructions: str = "",
    model_override: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates a tailored social media post using Groq (primary) or OpenAI (fallback).
    """
    user_prompt = build_user_prompt(
        platform=platform,
        topic=topic,
        tone=tone,
        uniqueness=uniqueness,
        research_summary=research_summary,
        custom_instructions=custom_instructions
    )

    # 1. Primary Engine: Groq
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip():
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            active_model = model_override or settings.GROQ_MODEL
            logger.info(f"Generating with Groq model: {active_model} for {platform}")

            response = client.chat.completions.create(
                model=active_model,
                messages=[
                    {"role": "system", "content": PLATFORM_PROMPT_SYSTEM},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=creativity,
                response_format={"type": "json_object"},
                max_tokens=3500
            )

            raw_content = response.choices[0].message.content
            # Handle potential markdown code fencing if model wraps JSON
            if "```json" in raw_content:
                raw_content = re.search(r"```json\s*(.*?)\s*```", raw_content, re.DOTALL).group(1)
            elif "```" in raw_content:
                raw_content = re.search(r"```\s*(.*?)\s*```", raw_content, re.DOTALL).group(1)

            data = json.loads(raw_content)
            return sanitize_and_validate_post(platform, data)

        except Exception as e:
            logger.error(f"Error generating post with Groq ({settings.GROQ_MODEL}): {e}")
            # Try fallback to OpenAI or demo if Groq encounters an error
            pass

    # 2. Fallback Engine: OpenAI
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip():
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": PLATFORM_PROMPT_SYSTEM},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=creativity,
                response_format={"type": "json_object"},
                max_tokens=1500
            )

            raw_content = response.choices[0].message.content
            data = json.loads(raw_content)
            return sanitize_and_validate_post(platform, data)

        except Exception as e:
            logger.error(f"Error generating post with OpenAI: {e}")

    # 3. Demo fallback if no API keys configured
    logger.warning("No LLM keys configured or generation failed. Using demo post.")
    return generate_demo_post(platform, topic, tone)


def generate_demo_post(platform: str, topic: str, tone: str) -> Dict[str, Any]:
    """Fallback generator for local preview and testing without API credentials."""
    if platform.lower() == "linkedin":
        hook = f"Most people approach {topic} completely backwards. Here is what really works:"
        content = (
            f"Most people approach {topic} completely backwards. Here is what really works:\n\n"
            f"Over the last few months, I've spent considerable time analyzing real-world outcomes in this space. "
            f"The biggest misconception? Thinking more complexity equals better results.\n\n"
            f"Three simple shifts that deliver outsized impact:\n"
            f"1. Simplify your core objective before adding automation.\n"
            f"2. Focus on consistency over short-lived spikes.\n"
            f"3. Measure genuine user outcomes, not just vanity metrics.\n\n"
            f"When you get these fundamentals right, everything else compounds quickly.\n\n"
            f"How is your team tackling {topic} this quarter? I'd love to hear your perspective below."
        )
        hashtags = f"#{topic.replace(' ', '')} #Innovation #Leadership"
        media = f"A clean, minimalist 3-slide carousel breaking down the 3 core shifts for {topic} with bold typography."

    elif platform.lower() == "facebook":
        hook = f"Curious to know everyone's take on {topic}!"
        content = (
            f"Quick question for the community: What has your experience been with {topic} recently? 🤔✨\n\n"
            f"We've been seeing a massive shift lately, and it feels like old playbooks just aren't cutting it anymore. "
            f"Sometimes the simplest tweaks end up making the biggest difference.\n\n"
            f"Are you all-in on this, or taking a wait-and-see approach? Drop a comment below—let's discuss! 👇"
        )
        hashtags = f"#{topic.replace(' ', '')} #CommunityTalk"
        media = f"An engaging behind-the-scenes photo or interactive poll graphic asking: 'Which shift resonates most?'"

    else: # instagram
        hook = f"Stop overcomplicating {topic}! 🛑"
        content = (
            f"Stop overcomplicating {topic}! 🛑 Swipe for the only 3 principles you actually need to know ➡️\n\n"
            f"Save this for your next project review 📌\n\n"
            f"1️⃣ Master the basics before scaling\n"
            f"2️⃣ Test in small batches to validate fast\n"
            f"3️⃣ Build systems that compound over time\n\n"
            f"Double tap if this saved you time today, and tag a teammate who needs to see this! 🔥"
        )
        hashtags = f"#{topic.replace(' ', '')} #CreatorEconomy #GrowthTips #LearnDaily #NextGenTech"
        media = f"A vibrant 4-slide carousel with high-contrast dark theme, bold punchy headings, and clean swipe indicators."

    return sanitize_and_validate_post(platform, {
        "hook": hook,
        "content": content,
        "hashtags": hashtags,
        "media_suggestion": media
    })
