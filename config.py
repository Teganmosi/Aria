from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import json
import logging
import os

logger = logging.getLogger(__name__)

# Secret values that must never be used to sign JWTs in a running server.
# Anyone who knows these (they're in public docs/examples) can forge valid auth tokens.
_INSECURE_SECRET_KEYS = {
    "",
    "your_secret_key_here",
    "your_secret_key_for_jwt",
    "secret",
    "changeme",
    "change_me",
}

class Settings(BaseSettings):
    # API Keys (Still needed)
    openai_api_key: str = ""
    nvidia_api_key: str = ""
    api_bible_key: str = ""
    yarngpt_api_key: str = ""
    google_application_credentials: Optional[str] = None
    gcp_service_account_json: Optional[str] = None
    
    # Supabase Configuration
    supabase_url: str = ""
    supabase_key: str = ""
    
    # Database
    database_url: str = "postgresql://postgres:password@localhost:5433/aria"
    # Modest defaults: Supabase free tier allows ~20 concurrent connections total.
    db_pool_min: int = 2
    db_pool_max: int = 10

    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    redis_enabled: bool = False
    
    # Application Configuration
    aria_custom_prompt: Optional[str] = None # Added support for custom prompt
    app_name: str = "Aria - Your Spiritual Companion"
    app_version: str = "1.0.0"
    debug: bool = False
    secret_key: str = "your_secret_key_here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    
    # CORS Configuration
    cors_origins: str = '["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:8000", "http://localhost:8002"]'
    
    @property
    def cors_origins_list(self) -> List[str]:
        try:
            origins = json.loads(self.cors_origins)
            if not isinstance(origins, list):
                raise ValueError("CORS_ORIGINS must be a JSON array")
            return origins
        except (json.JSONDecodeError, TypeError, ValueError):
            logger.warning(
                "CORS_ORIGINS is not a valid JSON array (got %r) — falling back to localhost "
                'origins. In production set it like: \'["https://your-frontend.example.com"]\'',
                self.cors_origins,
            )
            return ["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Pull from OS ENV if available
        self.openai_api_key = os.getenv('OPENAI_API_KEY', self.openai_api_key)
        self.nvidia_api_key = os.getenv('NVIDIA_API_KEY', self.nvidia_api_key)
        self.api_bible_key = os.getenv('API_BIBLE_KEY', self.api_bible_key)
        self.yarngpt_api_key = os.getenv('YARNGPT_API_KEY', self.yarngpt_api_key)
        self.google_application_credentials = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', self.google_application_credentials)
        self.gcp_service_account_json = os.getenv('GCP_SERVICE_ACCOUNT_JSON', self.gcp_service_account_json)
        env_secret = os.getenv('SECRET_KEY')
        if env_secret:
            self.secret_key = env_secret
        if self.secret_key in _INSECURE_SECRET_KEYS:
            raise RuntimeError(
                "SECRET_KEY is a known insecure placeholder — anyone could forge auth tokens with it. "
                "Generate a strong key with: "
                'python -c "import secrets; print(secrets.token_urlsafe(48))" '
                "and set it in your .env (local) or the Render dashboard (production)."
            )
        if len(self.secret_key) < 32:
            logger.warning(
                "SECRET_KEY is shorter than 32 characters — generate a stronger key before deploying to production."
            )
        self.redis_enabled = os.getenv('REDIS_ENABLED', str(self.redis_enabled)).lower() == 'true'

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra='ignore'
    )

settings = Settings()
