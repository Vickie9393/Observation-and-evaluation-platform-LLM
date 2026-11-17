from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class TraceCreate(BaseModel):
    trace_id: Optional[str] = None
    model: str
    prompt: str
    response: str
    input_tokens: int
    output_tokens: int
    latency_ms: float
    status: str
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, alias="metadata_")

class TraceResponse(TraceCreate):
    id: str
    project_id: str
    timestamp: datetime
    total_tokens: int
    cost: float

    class Config:
        from_attributes = True
        populate_by_name = True
