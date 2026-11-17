from pydantic import BaseModel
from datetime import datetime

class ProjectBase(BaseModel):
    name: str

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: str
    api_key: str
    user_id: str
    created_at: datetime
    eval_relevance_enabled: bool
    eval_groundedness_enabled: bool
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    gemini_api_key: str | None = None
    groq_api_key: str | None = None

class ProjectUpdate(BaseModel):
    eval_relevance_enabled: bool | None = None
    eval_groundedness_enabled: bool | None = None
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    gemini_api_key: str | None = None
    groq_api_key: str | None = None

    class Config:
        from_attributes = True
