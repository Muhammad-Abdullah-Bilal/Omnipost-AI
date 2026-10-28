# OmniPost AI - Social Media Content Writing Agent
> Multi-Platform Content Generation Agent for **LinkedIn**, **Facebook**, and **Instagram**

Built strictly in accordance with your specifications:
- **Frontend:** Next.js 16 (App Router, React 19, TypeScript, Tailwind CSS 4, Lucide Icons)
- **Backend:** FastAPI (Python 3.12/3.13)
- **LLM Engine:** **Groq Cloud** ultra-fast inference (with OpenAI fallback)
  - Models supported: `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `qwen/qwen3.8-27b`
- **Database:** Serverless PostgreSQL on **Neon DB**
- **Web Search Engine:** **Tavily Search API** for real-time web context & trending topic research

---

## Verified Service Integrations

All three external services were verified and tested directly in the project:
1. **Groq LLM Engine:** Tested and confirmed working with `openai/gpt-oss-120b` and `openai/gpt-oss-20b` producing structured JSON posts.
2. **Tavily Web Search:** Verified live search queries for context extraction.
3. **Neon PostgreSQL Database:** Connected, verified (`SELECT 1`), and all tables (`generation_sessions`, `posts`, `style_memories`) initialized and persisting posts.

---

## How to Run

### 1. Run Backend (FastAPI)
```powershell
cd backend
uv run uvicorn main:app --reload --port 8000
```
API Documentation: `http://localhost:8000/docs`

### 2. Run Frontend (Next.js)
```powershell
cd frontend
npm run dev
```
Open `http://localhost:3000` in your browser.
