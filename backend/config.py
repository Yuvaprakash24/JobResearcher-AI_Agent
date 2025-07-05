"""
Configuration settings for Job Research AI Agent
"""

import os
from pydantic import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    serpapi_key: str = os.getenv("SERPAPI_KEY", "")
    openrouter_api_key: str = os.getenv("OPENROUTER_API_KEY", "")
    
    # Server Configuration
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    
    # CORS Configuration
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Logging Configuration
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Database Configuration (optional)
    database_url: Optional[str] = os.getenv("DATABASE_URL", None)
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create settings instance
settings = Settings()

# Validation
def validate_settings():
    """Validate that required settings are present"""
    if not settings.serpapi_key:
        raise ValueError("SERPAPI_KEY environment variable is required")
    
    if not settings.openrouter_api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable is required")
    
    print("✅ Configuration validated successfully")
    print(f"📡 API will run on {settings.api_host}:{settings.api_port}")
    print(f"🌐 Frontend URL: {settings.frontend_url}")
    print(f"📝 Log level: {settings.log_level}")

if __name__ == "__main__":
    validate_settings() 