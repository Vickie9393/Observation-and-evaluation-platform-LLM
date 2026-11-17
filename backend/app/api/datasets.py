from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.dataset import Dataset, DatasetItem
from app.schemas.dataset import DatasetCreate, DatasetResponse, DatasetItemCreate, DatasetItemResponse
from app.models.project import Project
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=DatasetResponse)
def create_dataset(project_id: str, dataset_in: DatasetCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    dataset = Dataset(project_id=project_id, name=dataset_in.name, description=dataset_in.description)
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return dataset

@router.get("/", response_model=list[DatasetResponse])
def get_datasets(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Dataset).filter(Dataset.project_id == project_id).all()

@router.post("/{dataset_id}/items", response_model=DatasetItemResponse)
def add_dataset_item(dataset_id: str, item_in: DatasetItemCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    dataset = db.query(Dataset).join(Project).filter(Dataset.id == dataset_id, Project.user_id == current_user.id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    item = DatasetItem(
        dataset_id=dataset_id,
        input_text=item_in.input_text,
        expected_output=item_in.expected_output,
        context_text=item_in.context_text
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
