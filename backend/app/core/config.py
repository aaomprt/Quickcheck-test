from traitlets import Any
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    APP_NAME: str = "QuickCheck Backend"
    API_V1_PREFIX: str = "/api/v1"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173", "https://quickcheck-test.vercel.app"]
    DATABASE_URL: str

    # Supabase
    @field_validator("DATABASE_URL", mode="before")
    def assemble_db_connection(cls, v: str | None) -> Any:
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
