from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "QuickCheck Backend"
    API_V1_PREFIX: str = "/api/v1"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]
    DATABASE_URL: str

    class Config:
        env_file = ".env"

settings = Settings()
