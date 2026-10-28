import logging
from typing import Optional, Dict, Any, List
from app.config import settings

logger = logging.getLogger(__name__)

def search_web_context(query: str, max_results: int = 3) -> Dict[str, Any]:
    """
    Fetches real-time web context using Tavily API.
    If Tavily API key is not configured, provides a clean fallback.
    """
    if not settings.TAVILY_API_KEY or settings.TAVILY_API_KEY.strip() == "":
        logger.warning("Tavily API key not configured. Using standard knowledge context.")
        return {
            "query": query,
            "summary": f"Real-time web search skipped (No TAVILY_API_KEY provided). Generating posts using core knowledge base for: {query}",
            "results": []
        }

    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=settings.TAVILY_API_KEY)
        response = client.search(
            query=query,
            search_depth="basic",
            max_results=max_results,
            include_answer=True
        )

        answer = response.get("answer", "")
        raw_results = response.get("results", [])
        
        extracted_results = []
        for r in raw_results:
            extracted_results.append({
                "title": r.get("title", ""),
                "url": r.get("url", ""),
                "content": r.get("content", "")
            })

        summary = answer or (extracted_results[0]["content"] if extracted_results else "No explicit search answer found.")

        return {
            "query": query,
            "summary": summary,
            "results": extracted_results
        }
    except Exception as e:
        logger.error(f"Error during Tavily search: {e}")
        return {
            "query": query,
            "summary": f"Web context lookup attempted for '{query}', proceeding with core model capabilities.",
            "results": [],
            "error": str(e)
        }
