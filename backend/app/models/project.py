from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import uuid
import secrets
from datetime import datetime
from app.core.database import Base

def generate_api_key():
    return "mo_" + secrets.token_urlsafe(32)

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    api_key = Column(String, unique=True, index=True, default=generate_api_key)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    eval_relevance_enabled = Column(Boolean, default=True)
    eval_groundedness_enabled = Column(Boolean, default=True)
    owner = relationship("User", back_populates="projects")
    openai_api_key = Column(String, nullable=True)
    anthropic_api_key = Column(String, nullable=True)
    gemini_api_key = Column(String, nullable=True)
    groq_api_key = Column(String, nullable=True)
    # we will add relationships to traces, etc. later
