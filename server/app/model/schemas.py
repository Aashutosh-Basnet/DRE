from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field, constr

class DocumentMetaData(BaseModel):
    document_id: str
    filename: str
    content_type: str
    stored_path: str
    chunk_count: int = Field(..., ge=1)

class UploadResponse(BaseModel):
    session_id: str
    documents: List[DocumentMetaData]

class ChatRequest(BaseModel):
    session_id: constr(min_length=1)
    question: constr(min_length=1)
    document_ids: Optional[List[str]]= Field(
        default=None,
        description="Restrict retrieval to those document IDs"
    )

class Citation(BaseModel):
    document_id: str
    source: str
    chunk_index: int
    text_snippet: str


class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation]