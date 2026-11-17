from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.alert import Alert, AlertEvent
from app.schemas.alert import AlertCreate, AlertResponse
from app.models.project import Project
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=AlertResponse)
def create_alert(project_id: str, alert_in: AlertCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    alert = Alert(
        project_id=project_id,
        name=alert_in.name,
        condition=alert_in.condition,
        threshold=alert_in.threshold
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@router.get("/", response_model=list[AlertResponse])
def get_alerts(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Alert).filter(Alert.project_id == project_id).all()
