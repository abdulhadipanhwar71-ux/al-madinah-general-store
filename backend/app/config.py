import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./dukaanos.db",
        description="Database connection URI (MySQL, PostgreSQL, or SQLite)"
    )

    # JWT Authentication
    JWT_SECRET_KEY: str = Field(
        default="default_insecure_secret_key_change_in_production_33215689",
        description="Secret key for signing JWT tokens"
    )
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 hours

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"

    # Rate Limiting
    LOGIN_RATE_LIMIT_PER_MINUTE: int = 10

    # Server Info
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "info"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        if self.ENVIRONMENT == "production" and "*" in origins:
            raise ValueError("Wildcard '*' CORS origin is strictly forbidden in production mode.")
        return origins

    def validate_production_security(self):
        """Enforces security constraints for production deployment"""
        if self.ENVIRONMENT == "production":
            if "default_insecure" in self.JWT_SECRET_KEY or len(self.JWT_SECRET_KEY) < 32:
                raise ValueError(
                    "CRITICAL SECURITY CONFIGURATION ERROR: "
                    "JWT_SECRET_KEY must be a securely generated secret of at least 32 characters in production! "
                    "Update your backend/.env file."
                )

settings = Settings()
settings.validate_production_security()

