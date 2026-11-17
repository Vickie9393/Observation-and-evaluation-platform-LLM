from pydantic import BaseModel
from typing import List
from datetime import datetime

class AlertEventResponse(BaseModel):
    id: str
    alert_id: str
    details: str
    created_at: datetime

    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    name: str
    condition: str
    threshold: float
    webhook_url: str | None = None

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: str
    project_id: str
    created_at: datetime
    events: List[AlertEventResponse] = []

    class Config:
        from_attributes = True
