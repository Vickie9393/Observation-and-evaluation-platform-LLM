from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class PromptVersionBase(BaseModel):
    version_tag: str
    template: str
    model: str
    parameters: Optional[Dict[str, Any]] = None

class PromptVersionCreate(PromptVersionBase):
    pass

class PromptVersionResponse(PromptVersionBase):
    id: str
    prompt_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class PromptBase(BaseModel):
    name: str

class PromptCreate(PromptBase):
    pass

class PromptResponse(PromptBase):
    id: str
    project_id: str
    created_at: datetime
    versions: List[PromptVersionResponse] = []

    class Config:
        from_attributes = True
