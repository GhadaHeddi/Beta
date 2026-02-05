"""
Configuration de l'application ORYEM
Gestion des variables d'environnement et paramètres globaux
"""
from pydantic_settings import BaseSettings
from typing import List, Union
from functools import lru_cache
from pydantic import field_validator
import json


class Settings(BaseSettings):
    """Paramètres de configuration de l'application"""

    # Application
    APP_NAME: str = "ORYEM"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql://oryem_user:oryem_password@localhost:5432/oryem_db"

    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 heures

    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]

    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS depuis une chaîne JSON ou retourne la liste directement"""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [origin.strip() for origin in v.split(',')]
        return v

    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS: Union[List[str], str] = [".pdf", ".jpg", ".jpeg", ".png", ".docx", ".xlsx"]

    @field_validator('ALLOWED_EXTENSIONS', mode='before')
    @classmethod
    def parse_allowed_extensions(cls, v):
        """Parse ALLOWED_EXTENSIONS depuis une chaîne JSON ou retourne la liste directement"""
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [ext.strip() for ext in v.split(',')]
        return v

    # DVF
    DVF_DATA_PATH: str = "data/dvf"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Retourne une instance singleton des paramètres"""
    return Settings()


settings = get_settings()
