import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Search for .env in current dir, parent, or project root
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent.parent
load_dotenv(dotenv_path=current_dir / ".env")
load_dotenv(dotenv_path=root_dir / ".env")

class Settings(BaseSettings):
    APP_NAME: str = "KritiAI Background Sidecar"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Server configuration
    HOST: str = os.getenv("SIDECAR_HOST", "127.0.0.1")
    PORT: int = int(os.getenv("SIDECAR_PORT", "8000"))
    
    # Local Ollama Orchestration
    OLLAMA_HOST: str = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")
    DEFAULT_LOCAL_MODEL: str = os.getenv("DEFAULT_LOCAL_MODEL", "qwen2.5:latest")
    
    # Cloud AI Providers
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    
    AI_DEFAULT_PROVIDER: str = os.getenv("AI_DEFAULT_PROVIDER", "ollama")
    
    # Supabase Realtime Sync
    SUPABASE_URL: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""))
    
    # Assist Mode & Screen Capture
    ASSIST_CAPTURE_INTERVAL_SEC: float = float(os.getenv("ASSIST_CAPTURE_INTERVAL_SEC", "3.0"))
    ASSIST_DIFF_THRESHOLD: float = float(os.getenv("ASSIST_DIFF_THRESHOLD", "0.08"))
    ENABLE_FAILSAFE: bool = os.getenv("ENABLE_FAILSAFE", "true").lower() == "true"
    
    # Meeting Delegate
    MEETING_DELEGATE_NAME: str = os.getenv("MEETING_DELEGATE_NAME", "KritiAI Delegate")
    MEETING_HEADLESS: bool = os.getenv("MEETING_HEADLESS", "true").lower() == "true"
    WHISPER_MODEL_SIZE: str = os.getenv("WHISPER_MODEL_SIZE", "base")
    
    # Gmail SMTP
    GMAIL_USER: str = os.getenv("GMAIL_USER", "")
    GMAIL_APP_PASSWORD: str = os.getenv("GMAIL_APP_PASSWORD", "")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
