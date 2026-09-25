from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_DATABASE_URL = f"sqlite:///{(BACKEND_DIR / 'staybnb.db').as_posix()}"


class Settings(BaseSettings):
    app_name: str = "Staybnb API"
    database_url: str = DEFAULT_DATABASE_URL
    frontend_origin: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
