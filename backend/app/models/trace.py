from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class Trace(Base):
    __tablename__ = "traces"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trace_id = Column(String, index=True)
    project_id = Column(String, ForeignKey("projects.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    model = Column(String)
    prompt = Column(String)
    response = Column(String)
    input_tokens = Column(Integer)
    output_tokens = Column(Integer)
    total_tokens = Column(Integer)
    latency_ms = Column(Float)
    cost = Column(Float)
    status = Column(String)
    error_message = Column(String, nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)

    project = relationship("Project")
