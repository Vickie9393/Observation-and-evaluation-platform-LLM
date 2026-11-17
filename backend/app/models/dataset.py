from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("DatasetItem", back_populates="dataset", cascade="all, delete")

class DatasetItem(Base):
    __tablename__ = "dataset_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    dataset_id = Column(String, ForeignKey("datasets.id"), index=True, nullable=False)
    input_text = Column(String, nullable=False)
    expected_output = Column(String)
    context_text = Column(String)

    dataset = relationship("Dataset", back_populates="items")
