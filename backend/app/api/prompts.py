from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.prompt import Prompt, PromptVersion
from app.schemas.prompt import PromptCreate, PromptResponse, PromptVersionCreate, PromptVersionResponse
from app.models.project import Project
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=PromptResponse)
def create_prompt(project_id: str, prompt_in: PromptCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    prompt = Prompt(project_id=project_id, name=prompt_in.name)
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt

@router.get("/", response_model=list[PromptResponse])
def get_prompts(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Prompt).filter(Prompt.project_id == project_id).all()

@router.post("/{prompt_id}/versions", response_model=PromptVersionResponse)
def add_prompt_version(prompt_id: str, version_in: PromptVersionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    prompt = db.query(Prompt).join(Project).filter(Prompt.id == prompt_id, Project.user_id == current_user.id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
        
    version = PromptVersion(
        prompt_id=prompt_id,
        version_tag=version_in.version_tag,
        template=version_in.template,
        model=version_in.model,
        parameters=version_in.parameters
    )
    db.add(version)
    db.commit()
    db.refresh(version)
    return version
