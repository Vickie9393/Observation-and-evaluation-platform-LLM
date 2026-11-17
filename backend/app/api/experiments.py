from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.experiment import Experiment, ExperimentRun
from app.schemas.experiment import ExperimentCreate, ExperimentResponse, ExperimentRunCreate, ExperimentRunResponse
from app.models.project import Project
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=ExperimentResponse)
def create_experiment(project_id: str, exp_in: ExperimentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    exp = Experiment(project_id=project_id, dataset_id=exp_in.dataset_id, name=exp_in.name)
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.get("/", response_model=list[ExperimentResponse])
def get_experiments(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Experiment).filter(Experiment.project_id == project_id).all()

@router.post("/{exp_id}/runs", response_model=ExperimentRunResponse)
def add_experiment_run(exp_id: str, run_in: ExperimentRunCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    exp = db.query(Experiment).join(Project).filter(Experiment.id == exp_id, Project.user_id == current_user.id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
        
    run = ExperimentRun(
        experiment_id=exp_id,
        prompt_version_id=run_in.prompt_version_id,
        metrics=run_in.metrics
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run
