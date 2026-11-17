from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.evaluation import Evaluation
from app.models.trace import Trace
from app.models.project import Project
from app.schemas.evaluation import EvaluationResponse
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=list[EvaluationResponse])
def get_evaluations(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify the project belongs to the user
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch evaluations for all traces in this project
    evaluations = db.query(Evaluation).join(Trace).filter(Trace.project_id == project_id).order_by(Evaluation.created_at.desc()).all()
    
    return evaluations
