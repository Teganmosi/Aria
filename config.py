from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import json
import os

class Settings(BaseSettings):
    # API Keys (Still needed)
    openai_api_key: str = ""
    nvidia_api_key: str = ""
    api_bible_key: str = ""
    
    # Supabase (Legacy/Empty)
    supabase_url: Optional[str] = ""
    supabase_key: Optional[str] = ""
    
    # Database
    database_url: str = "postgresql://postgres:password@localhost:5433/aria"

    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    redis_enabled: bool = False
    
    # Application Configuration
    app_name: str = "Aria - Your Spiritual Companion"
    app_version: str = "1.0.0"
    debug: bool = False
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    
    # CORS Configuration
    cors_origins: str = '["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:8000", "http://localhost:8002"]'
    
    @property
    def cors_origins_list(self) -> List[str]:
        try:
            return json.loads(self.cors_origins)
        except (json.JSONDecodeError, TypeError):
            return ["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Pull from OS ENV if available
        self.openai_api_key = os.getenv('OPENAI_API_KEY', self.openai_api_key)
        self.nvidia_api_key = os.getenv('NVIDIA_API_KEY', self.nvidia_api_key)
        self.api_bible_key = os.getenv('API_BIBLE_KEY', self.api_bible_key)
        env_secret = os.getenv('SECRET_KEY')
        if env_secret:
            self.secret_key = env_secret
        self.redis_enabled = os.getenv('REDIS_ENABLED', str(self.redis_enabled)).lower() == 'true'

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra='ignore'
    )

settings = Settings()
