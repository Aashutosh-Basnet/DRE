from fastapi import APIRouter, Depends

from app.dependencies import get_rag_service
from app.model.schemas import ChatRequest, ChatResponse
from app.services.rag_service import RAGService

router = APIRouter()


@router.post("/query", response_model=ChatResponse)
async def query_documents(
    payload: ChatRequest,
    service: RAGService = Depends(get_rag_service),
) -> ChatResponse:
    """Answer a user question constrained to the uploaded documents."""

    response = service.answer(
        question=payload.question,
        session_id=payload.session_id,
        document_ids=payload.document_ids,
    )
    return response
