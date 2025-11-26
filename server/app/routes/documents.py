from typing import List

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.dependencies import get_document_service
from app.model.schemas import UploadResponse
from app.services.document_service import DocumentIngestionService


router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload_documents(
    files: List[UploadFile] = File(..., description="Upload up to two documents."),
    session_id: str | None = Form(default=None),
    service: DocumentIngestionService = Depends(get_document_service),
):
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload at least one document.",
        )
    if len(files) > 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can upload a maximum of two documents per request.",
        )

    session, documents = service.ingest(files, session_id=session_id)
    return UploadResponse(session_id=session, documents=documents)

