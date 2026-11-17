from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DatasetItemBase(BaseModel):
    input_text: str
    expected_output: Optional[str] = None
    context_text: Optional[str] = None

class DatasetItemCreate(DatasetItemBase):
    pass

class DatasetItemResponse(DatasetItemBase):
    id: str
    dataset_id: str

    class Config:
        from_attributes = True

class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None

class DatasetCreate(DatasetBase):
    pass

class DatasetResponse(DatasetBase):
    id: str
    project_id: str
    created_at: datetime
    items: List[DatasetItemResponse] = []

    class Config:
        from_attributes = True
