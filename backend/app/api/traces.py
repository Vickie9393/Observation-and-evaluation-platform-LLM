from fastapi import APIRouter, Depends, HTTPException, Header, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.project import Project
from app.models.user import User
from app.api.deps import get_current_user
from app.models.trace import Trace
from app.schemas.trace import TraceCreate, TraceResponse
import uuid

router = APIRouter()

def get_project_by_api_key(api_key: str, db: Session) -> Project:
    project = db.query(Project).filter(Project.api_key == api_key).first()
    if not project:
        raise HTTPException(status_code=401, detail="Invalid API Key")
    return project

def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    # simple mock cost calculation
    # e.g. gpt-4o-mini is $0.15/1M input and $0.60/1M output
    pricing = {
        "gpt-4o-mini": {"input": 0.15 / 1000000, "output": 0.60 / 1000000},
        "gpt-4o": {"input": 5.0 / 1000000, "output": 15.0 / 1000000},
    }
    rates = pricing.get(model, {"input": 0.0, "output": 0.0})
    return (input_tokens * rates["input"]) + (output_tokens * rates["output"])

from app.workers.celery_worker import evaluate_trace_task

@router.post("/", response_model=TraceResponse)
def ingest_trace(
    trace_in: TraceCreate,
    background_tasks: BackgroundTasks,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid API key")
    
    api_key = authorization.replace("Bearer ", "")
    project = get_project_by_api_key(api_key, db)
    
    total_tokens = trace_in.input_tokens + trace_in.output_tokens
    cost = calculate_cost(trace_in.model, trace_in.input_tokens, trace_in.output_tokens)
    
    new_trace = Trace(
        trace_id=trace_in.trace_id or str(uuid.uuid4()),
        project_id=project.id,
        model=trace_in.model,
        prompt=trace_in.prompt,
        response=trace_in.response,
        input_tokens=trace_in.input_tokens,
        output_tokens=trace_in.output_tokens,
        total_tokens=total_tokens,
        latency_ms=trace_in.latency_ms,
        cost=cost,
        status=trace_in.status,
        error_message=trace_in.error_message,
        metadata_=trace_in.metadata
    )
    
    db.add(new_trace)
    db.commit()
    db.refresh(new_trace)
    
    # Trigger evaluation worker via BackgroundTasks
    background_tasks.add_task(evaluate_trace_task, new_trace.id)
    
    return new_trace

@router.get("/", response_model=list[TraceResponse])
def get_traces(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify the project belongs to the user
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    traces = db.query(Trace).filter(Trace.project_id == project_id).order_by(Trace.timestamp.desc()).limit(100).all()
    return traces
