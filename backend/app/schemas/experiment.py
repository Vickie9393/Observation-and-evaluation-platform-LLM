from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ExperimentRunBase(BaseModel):
    prompt_version_id: str
    metrics: Optional[Dict[str, Any]] = None

class ExperimentRunCreate(ExperimentRunBase):
    pass

class ExperimentRunResponse(ExperimentRunBase):
    id: str
    experiment_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ExperimentBase(BaseModel):
    dataset_id: str
    name: str

class ExperimentCreate(ExperimentBase):
    pass

class ExperimentResponse(ExperimentBase):
    id: str
    project_id: str
    created_at: datetime
    runs: List[ExperimentRunResponse] = []

    class Config:
        from_attributes = True
