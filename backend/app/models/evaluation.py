from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trace_id = Column(String, ForeignKey("traces.id"), index=True, nullable=False)
    evaluator = Column(String, nullable=False) # e.g. relevance, groundedness
    score = Column(Float, nullable=False)
    reason = Column(String)
    evaluator_version = Column(String, default="1.0")
    created_at = Column(DateTime, default=datetime.utcnow)

    trace = relationship("Trace")
