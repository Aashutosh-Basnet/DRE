from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    groq_api_key: str = Field(..., env= "GROQ_API_KEY")
    groq_model: str = Field(
        "llama-3.1-8b-instant",
        description="Groq chat model indentifier",
    )
    embedding_model: str = Field(
        "sentence-transformers/all-MiniLM-L6-v2",
        description="SentenceTransformers model used for embeddings"
    )

    chunk_size: int = Field(512, ge=128, description="character count per chunk")
    chunk_overlap: int = Field(128, ge=0, description="overlap between adjacent chunk")
    top_k: int = Field(4, ge=1, description="number of chunks to retrieve for answers")

    upload_dir: Path = Field(default=Path("uploads"), description= "Raw upload storage")
    vector_store_dir: Path = Field(
        default=Path("vectorstores"),
        description="Directory for persisted vector stores"
    )

    env_file = Optional[str] = Field(".env", description="Optional env file path")

    class Config:
        env_file = ".env"
        env_file_encoding = "UTF-8"


    @validator("uploads_dir", "vector_store_dir", pre=True)
    def _ensure_path(cls, value):
        return value if isinstance(value, path) else Path(value)
    

@lru_cache(maxsize=1)
def get_settings() -> Settings:
    settings = Settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    settings.vector_store_dir.mkdir(parents=True, exist_ok=True)
    return settings