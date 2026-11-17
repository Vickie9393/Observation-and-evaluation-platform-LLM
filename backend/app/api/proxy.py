from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks, Request, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.traces import get_project_by_api_key, calculate_cost
from app.models.trace import Trace
from app.workers.celery_worker import evaluate_trace_task
import os
import uuid
import time
import httpx
from pypdf import PdfReader
import io
import chromadb
from chromadb.utils import embedding_functions
import litellm
router = APIRouter()
chroma_client = chromadb.Client()
embedding_fn = embedding_functions.DefaultEmbeddingFunction()

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1/chat/completions")

@router.post("/chat/completions")
async def chat_completions(
    request: Request,
    background_tasks: BackgroundTasks,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid API key")
    
    api_key = authorization.replace("Bearer ", "")
    project = get_project_by_api_key(api_key, db)
    
    # Read the incoming OpenAI-format payload
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
    model = payload.get("model", "llama3.2")
    
    # Reconstruct the prompt string for tracing
    messages = payload.get("messages", [])
    prompt_str = "\n".join([f"{m.get('role', 'user')}: {m.get('content', '')}" for m in messages])
    
    doc_id = payload.pop("document_id", None)
    if doc_id:
        user_prompt = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                user_prompt = m.get("content", "")
                break
                
        if user_prompt:
            try:
                collection = chroma_client.get_collection(name=doc_id, embedding_function=embedding_fn)
                results = collection.query(query_texts=[user_prompt], n_results=3)
                if results and results.get("documents") and results["documents"][0]:
                    context_str = "\n".join(results["documents"][0])
                    payload["messages"] = [
                        {"role": "system", "content": f"You are a helpful assistant. Use the following retrieved document context to answer the user's question:\n\n{context_str}"}
                    ] + messages
            except Exception as e:
                print(f"RAG query failed: {e}")
    
    start_time = time.time()
    
    is_external = any(model.startswith(prefix) for prefix in ["gpt-", "claude-", "gemini-", "groq/"])
    
    try:
        if is_external:
            from app.core.config import settings
            api_key = None
            if model.startswith("gpt-"):
                api_key = project.openai_api_key or settings.OPENAI_API_KEY
            elif model.startswith("claude-"):
                api_key = project.anthropic_api_key or settings.ANTHROPIC_API_KEY
            elif model.startswith("gemini-"):
                api_key = project.gemini_api_key or settings.GEMINI_API_KEY
            elif model.startswith("groq/"):
                api_key = project.groq_api_key or settings.GROQ_API_KEY
                
            if not api_key:
                raise HTTPException(status_code=400, detail=f"API Key for model {model} is not configured in Project settings or System.")
                
            response = await litellm.acompletion(
                model=model,
                messages=payload["messages"],
                api_key=api_key,
                stream=False
            )
            data = response.model_dump()
            try:
                cost = litellm.completion_cost(completion_response=response)
            except Exception:
                cost = 0.0
                
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            usage = data.get("usage", {})
            input_tokens = usage.get("prompt_tokens", 0)
            output_tokens = usage.get("completion_tokens", 0)
            total_tokens = input_tokens + output_tokens
        else:
            async with httpx.AsyncClient() as client:
                # We enforce non-streaming for simplicity in this proxy implementation
                payload["stream"] = False
                response = await client.post(OLLAMA_BASE_URL, json=payload, timeout=120.0)
                
                if response.status_code != 200:
                    raise HTTPException(status_code=response.status_code, detail=f"Ollama Error: {response.text}")
                    
                data = response.json()
            
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            usage = data.get("usage", {})
            input_tokens = usage.get("prompt_tokens", 0)
            output_tokens = usage.get("completion_tokens", 0)
            total_tokens = input_tokens + output_tokens
            cost = calculate_cost(model, input_tokens, output_tokens)

    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Could not connect to Ollama. Is it running on localhost:11434?")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error connecting to LLM: {str(e)}")
        
    latency_ms = (time.time() - start_time) * 1000
    
    # Save the trace to the database automatically
    new_trace = Trace(
        trace_id=str(uuid.uuid4()),
        project_id=project.id,
        model=model,
        prompt=prompt_str,
        response=content,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        total_tokens=total_tokens,
        latency_ms=latency_ms,
        cost=cost,
        status="success"
    )
    
    db.add(new_trace)
    db.commit()
    db.refresh(new_trace)
    
    # Trigger evaluations in background
    background_tasks.add_task(evaluate_trace_task, new_trace.id)
    
    # Return the exact payload so the OpenAI client is happy
    return data

@router.post("/parse-pdf")
async def parse_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        content = await file.read()
        reader = PdfReader(io.BytesIO(content))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
                
        # Split text into chunks
        chunks = []
        chunk_size = 800
        for i in range(0, len(text), chunk_size):
            chunk = text[i:i+chunk_size].strip()
            if chunk:
                chunks.append(chunk)
                
        doc_id = str(uuid.uuid4())
        
        # If no chunks, return error
        if not chunks:
            raise HTTPException(status_code=400, detail="PDF has no readable text")
            
        collection = chroma_client.create_collection(name=doc_id, embedding_function=embedding_fn)
        ids = [str(i) for i in range(len(chunks))]
        collection.add(documents=chunks, ids=ids)
                
        return {"document_id": doc_id, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")
