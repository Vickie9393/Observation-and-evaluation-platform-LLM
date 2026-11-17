import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MiniObserve"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./miniobserve.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "miniobserve_secret_key_change_me")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # System-level fallback keys
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY: str | None = os.getenv("ANTHROPIC_API_KEY")
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY")
    GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")

    model_config = {"env_file": ".env"}

settings = Settings()
