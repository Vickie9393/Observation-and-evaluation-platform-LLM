from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, projects, traces, metrics, datasets, prompts, experiments, alerts, evaluations, proxy, code_runner
from app.core.database import Base, engine

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(traces.router, prefix="/traces", tags=["traces"])
app.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
app.include_router(datasets.router, prefix="/datasets", tags=["datasets"])
app.include_router(prompts.router, prefix="/prompts", tags=["prompts"])
app.include_router(experiments.router, prefix="/experiments", tags=["experiments"])
app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
app.include_router(evaluations.router, prefix="/evaluations", tags=["evaluations"])
app.include_router(proxy.router, prefix="/v1", tags=["proxy"])
app.include_router(code_runner.router, prefix="/v1/code", tags=["code"])
@app.get("/")
def read_root():
    return {"message": "Welcome to MiniObserve API"}
