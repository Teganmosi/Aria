from pydantic_settings import BaseSettings
from typing import List
import json
import os


class Settings(BaseSettings):
    # Supabase Configuration
    supabase_url: str = ""
    supabase_key: str = ""
    supabase_service_role_key: str = ""
    
    # OpenAI Configuration
    openai_api_key: str = ""
    
    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    redis_enabled: bool = False
    
    # API.Bible Configuration
    api_bible_key: str = ""
    
    # Application Configuration
    app_name: str = "Aria - Your Spiritual Companion"
    app_version: str = "1.0.0"
    debug: bool = True
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    
    # CORS Configuration
    cors_origins: str = '["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:8000", "http://localhost:8002"]'
    
    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.cors_origins)
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Provide defaults from environment if available
        if not self.supabase_url:
            self.supabase_url = os.getenv('SUPABASE_URL', '')
        if not self.supabase_key:
            self.supabase_key = os.getenv('SUPABASE_KEY', '')
        if not self.supabase_service_role_key:
            self.supabase_service_role_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
        if not self.openai_api_key:
            self.openai_api_key = os.getenv('OPENAI_API_KEY', '')
        if not self.secret_key:
            self.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
        if not self.redis_url:
            self.redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379')
        if not self.redis_enabled:
            self.redis_enabled = os.getenv('REDIS_ENABLED', 'false').lower() == 'true'
        if not self.api_bible_key:
            self.api_bible_key = os.getenv('API_BIBLE_KEY', '')
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
