# 🔍 Gemini LangGraph Assistant (Tavily-Enabled)

A full-stack AI assistant powered by **Gemini 2.0 Flash**, **LangGraph**, and **Tavily Search API**. The app supports streaming AI responses and search tool usage in real time.

---

## ✨ Features

- **FastAPI backend** with LangGraph state machine
- Gemini LLM with **tool calling** capability (`tavily_search_results_json`)
- **Next.js client** for real-time streaming UI
- **Server-sent events (SSE)** for low-latency chat
- Visual search stages: `searching → reading → writing`

---

## 📦 Installation

### Backend (Python 3.10+)

```bash
cd server
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
