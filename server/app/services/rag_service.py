from __future__ import annotations

from typing import List, Optional

from fastapi import HTTPException, status
from langchain_chroma import Chroma
from langchain_core.messages import BaseMessage
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_groq import ChatGroq

from app.config.config import get_settings
from app.model.schemas import ChatResponse, Citation
from app.services.Prompt import QA_PROMPT


class RAGService:
    """Resolve chat questions using retrieval-augmented generation."""

    fallback_message = "I don't know based on the provided documents"

    def __init__(self) -> None:
        self.settings = get_settings()
        self.embedding_model = HuggingFaceEmbeddings(
            model_name=self.settings.embedding_model,
        )
        self.chat_model = ChatGroq(
            groq_api_key=self.settings.groq_api_key,
            model_name=self.settings.groq_model,
            temperature=0,
        )

    def answer(
        self,
        *,
        question: str,
        session_id: str,
        document_ids: Optional[List[str]] = None,
    ) -> ChatResponse:
        vector_store = self._load_vector_store(session_id)

        where_filter = None
        if document_ids:
            where_filter = {"document_id": {"$in": document_ids}}

        matches = vector_store.similarity_search(
            question,
            k=self.settings.top_k,
            filter=where_filter,
        )

        if not matches:
            return ChatResponse(answer=self.fallback_message, citations=[])

        context, citations = self._prepare_context(matches)
        messages: List[BaseMessage] = QA_PROMPT.format_messages(
            context=context,
            question=question,
        )

        llm_response = self.chat_model.invoke(messages)
        answer = getattr(llm_response, "content", str(llm_response)).strip()
        if not answer:
            answer = self.fallback_message

        return ChatResponse(answer=answer, citations=citations)

    def _load_vector_store(self, session_id: str) -> Chroma:
        session_dir = self.settings.vector_store_dir / session_id
        if not session_dir.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found. Please upload documents first.",
            )

        return Chroma(
            collection_name=session_id,
            embedding_function=self.embedding_model,
            persist_directory=str(session_dir),
        )

    def _prepare_context(self, matches):
        context_chunks = []
        citations: List[Citation] = []

        for doc in matches:
            metadata = doc.metadata or {}
            document_id = metadata.get("document_id", "unknown")
            chunk_index = metadata.get("chunk_index", -1)
            source = metadata.get("source", "unknown")
            snippet = doc.page_content.strip()

            context_chunks.append(
                f"[{document_id}#chunk{chunk_index}] {snippet}"
            )

            citations.append(
                Citation(
                    document_id=document_id,
                    source=source,
                    chunk_index=chunk_index,
                    text_snippet=snippet[:200],
                )
            )

        context = "\n\n".join(context_chunks)
        return context, citations
