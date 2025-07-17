# 🔍 Gemini LangGraph Assistant — AI Chat with Real-Time Web Search

This project is a full-stack AI assistant that combines **Google's Gemini 2.0 Flash model** with **LangGraph** to enable tool-augmented reasoning. It features real-time response streaming, automatic web search via the **Tavily API**, and a seamless user experience powered by **FastAPI** and **Next.js**.

---

## 💡 Key Features

- 🤖 **LLM-Powered Chat**  
  Uses Gemini 2.0 to generate fast and context-aware responses.

- 🔧 **Tool-Augmented Reasoning**  
  Automatically invokes the Tavily Search API when web search is needed.

- 🔁 **LangGraph State Management**  
  Custom LangGraph workflow handles model-tool routing and memory checkpoints.

- 🌐 **Streaming User Interface**  
  Built with Next.js and Tailwind CSS, using Server-Sent Events (SSE) for smooth real-time updates.

- 🧠 **Search-Aware Feedback**  
  The UI visually reflects each stage of the assistant's process: `searching → reading → writing`.

---

## 📦 Project Structure
project-root/
├── client/ # Next.js frontend
│ ├── components/ # UI components (Header, MessageArea, InputBar)
│ ├── pages/ # Main UI entry
│ └── .env.local # Contains NEXT_PUBLIC_API_URL
│
├── server/ # FastAPI + LangGraph backend
│ ├── app.py # Main FastAPI server + LangGraph logic
│ └── requirements.txt # Python dependencies
│
└── README.md


## 📦 Installation


### Backend (Python 3.10+)

Create a .env file in server/:
TAVILY_API_KEY=your_tavily_api_key
GOOGLE_API_KEY=your_google_api_key


```bash
cd server
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
