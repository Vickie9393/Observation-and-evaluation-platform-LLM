<!-- markdownlint-disable MD013 -->
# MiniObserve: Enterprise LLM Observability & Evaluation Platform

MiniObserve is a complete, full-stack developer platform designed for monitoring, evaluating, and improving LLM-powered applications. Built as a comprehensive system for a CS project or portfolio demonstration, it functions as a lightweight, privacy-focused alternative to commercial tools like LangSmith or Phoenix.

---

## 📖 Project Synopsis

As Large Language Models (LLMs) become central to modern software, developers face the "black box" problem: it is difficult to monitor exactly what data is being sent to LLMs, how much it costs, and whether the AI's responses are actually high quality.

**MiniObserve solves this by providing a unified, self-hosted platform that offers:**

1. **Real-time Observability**: Tracking every prompt, response, latency, and cost.
2. **Automated AI Evaluation**: Using "LLM-as-a-judge" to automatically grade the quality of AI responses.
3. **Retrieval-Augmented Generation (RAG)**: Built-in document vectorization and semantic search.
4. **Proactive Alerting**: Real-time webhook notifications for anomalies (e.g., high latency, errors).
5. **Prompt Engineering Hub**: Version-controlled prompt management.

---

## ✨ Key Features & Capabilities

- **📊 Live Analytics Dashboard**: Real-time SQL time-series data rendering usage statistics, cost analysis, and system health over the last 7 days.
- **🧠 True RAG Vector Store**: Integrated ChromaDB semantic search. Upload PDFs, chunk the text, generate embeddings (all-MiniLM-L6-v2), and dynamically inject context into prompts.
- **⚖️ LLM-as-a-Judge Evaluation Engine**: Background processing that secretly prompts a local Ollama model (`llama3.2`) to grade traces for *Relevance* and *Groundedness* on a strict 0.0-1.0 scale with detailed reasoning.
- **🚨 Webhook Alerting System**: Configure rules (e.g., Latency > 2000ms). When triggered, the background engine instantly pushes an HTTP POST payload to external services like Slack or Discord.
- **📝 Prompt Engineering Hub**: Centralized UI to create, edit, and version-control system instruction templates. Swap prompts dynamically in the Playground for A/B testing.
- **🔍 Trace Explorer**: Search, filter, and inspect individual traces and their evaluations in detail.
- **💻 Interactive Playground**: Chat directly with your local LLMs (via Ollama) and test your RAG documents, with all traffic automatically tracked as traces.
- **🎨 Premium UI/UX**: Modern dark-mode React frontend built with Tailwind CSS, Recharts, and glassmorphism design principles.

---

## 🏗 Architecture & Tech Stack

### System Flow

```text
[ Developer's AI App / Playground ]
        ↓ POST /v1/chat/completions (Proxy API)
[ FastAPI Backend Engine ]
        ├─→ Tracks Metadata (Tokens, Cost, Latency)
        ├─→ Queries ChromaDB Vector Store (if RAG is active)
        └─→ Forwards request to Local Ollama instance
        ↓
    SQLite Database
        ↓
[ Background Thread (Evaluation Engine) ]
        ├─→ Grades trace via LLM-as-a-judge (Ollama)
        └─→ Checks Rules -> Fires Webhook Alert (if threshold crossed)
        ↓
[ React Frontend Dashboard ]
```

### Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Backend API**: Python 3.11, FastAPI, SQLAlchemy, Pydantic, HTTPX.
- **Database**: PostgreSQL (Production) / SQLite (Local dev).
- **Background Tasks**: Celery & Redis.
- **Vector Database**: ChromaDB (Embeddings and Semantic Search).
- **LLM Engine**: Ollama (Running local models like `llama3.2`).
- **Data Visualization**: Recharts (React).

---

## 🚀 Setup & Installation Guide

To run this project locally, follow these steps.

### Prerequisites

1. **Python 3.10+**
2. **Node.js 18+**
3. **Ollama**: Download and install Ollama from [ollama.com](https://ollama.com/).

### 1. Start the Local AI Model (Ollama)

Open your terminal and pull the required model:

```bash
ollama run llama3.2
```

Keep Ollama running in the background.

### 2. Quick Start (Docker Compose)

The easiest way to start the entire stack (PostgreSQL, Redis, Backend, Celery Worker, Frontend) is via Docker Compose:

```bash
docker compose up -d --build
```

### 3. Manual Local Setup (Alternative)

If you prefer to run things manually without Docker:

**Backend Setup:**

```bash
cd miniobserve/backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend Setup:**

```bash
cd miniobserve/frontend
npm install
npm run dev
```

### 4. Access the Platform

- **Dashboard UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 💡 How to use the platform (Walkthrough)

1. **Create a Project**: Open the Dashboard and create a new project.
2. **Setup a Webhook Alert**: Go to the **Alerts** tab. Create an alert for `Latency > 0ms` and paste a URL from [Webhook.site](https://webhook.site).
3. **Upload Knowledge (RAG)**: Go to the **Playground**, click the Paperclip icon, and upload a PDF.
4. **Chat & Evaluate**: Send a message in the Playground. The backend will route the request to Ollama, inject your PDF context, track the trace, evaluate the output, and fire your webhook!
5. **View Results**: Check the **Dashboard** for updated graphs, and the **Traces** tab to see the detailed LLM-as-a-judge score and reasoning.

---

## 🗄️ Database Schema

- `projects`: Multitenancy and API keys.
- `traces`: Core observability data (latency, tokens, cost, text).
- `evaluations`: Computed scores and reasoning provided by the LLM Judge.
- `prompts` & `prompt_versions`: Version-controlled system instructions.
- `alerts` & `alert_events`: Notification rules and triggered event history.
