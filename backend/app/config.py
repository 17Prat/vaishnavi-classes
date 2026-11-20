from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "FeeFlow Fee Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Secret Key for JWT
    SECRET_KEY: str = Field(default="feeflow-super-secret-jwt-key-change-in-production-2026-secure-token", env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database URL - defaults to local aiosqlite for zero-config, supports Neon PostgreSQL via postgresql+asyncpg://
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./feeflow.db",
        env="DATABASE_URL"
    )
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Media & Uploads
    UPLOAD_DIR: str = os.path.join(os.getcwd(), "uploads")
    RECEIPTS_DIR: str = os.path.join(os.getcwd(), "receipts_storage")
    
    # Institute Defaults
    DEFAULT_INSTITUTE_NAME: str = "Apex Institute of Science & Technology"
    DEFAULT_INSTITUTE_CODE: str = "APEX01"
    DEFAULT_CURRENCY: str = "INR"
    DEFAULT_CURRENCY_SYMBOL: str = "₹"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.RECEIPTS_DIR, exist_ok=True)
