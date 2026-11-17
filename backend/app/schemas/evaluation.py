from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EvaluationBase(BaseModel):
    evaluator: str
    score: float
    reason: Optional[str] = None
    evaluator_version: str = "1.0"

class EvaluationResponse(EvaluationBase):
    id: str
    trace_id: str
    created_at: datetime

    class Config:
        from_attributes = True
