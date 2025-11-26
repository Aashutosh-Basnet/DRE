from __future__ import annotations

import shutil
from pathlib import Path
from typing import List, Tuple
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from langchain_core.documents import Document
from langchain_chroma import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config.config import get_settings
from app.model.schemas import DocumentMetaData
from app.services.parsers import extract_text

class DocumentIngestionService:

    def __init__(self) -> None:
        self.settings = get_settings()
        self.splitter = RecursiveCharacterTextSplitter(
            separators=["\n\n", "\n", " ", ""],
            chunk_size=self.settings.chunk_size,
            chunk_overlap=self.settings.chunk_overlap,
        )
        self.embedding_model = HuggingFaceEmbeddings(model_name = self.settings.embedding_model)

    def ingest(
            self, files: List[UploadFile], session_id: str | None = None
    ) -> Tuple[str, List[DocumentMetaData]]:
        
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
        
        session = session_id or str(uuid4())
        upload_dir = self.settings.uploads_dir / session
        upload_dir.mkdir(parents=True, exist_ok=True)
        vector_dir = self.settings.vector_store_dir / session
        vector_dir.mkdir(parents=True, exist_ok=True)

        documents_meta: List[DocumentMetaData] = []
        documents_for_embedding: List[Document] = []
        chunk_ids: List[str] = []

        for upload in files:
            filename = Path(upload.filename or "document").name
            document_id = str(uuid4())
            stored_name = f"{document_id}_{filename}"
            stored_path = upload_dir / stored_name

            upload.file.seek(0)
            with stored_path.open("wb") as buffer:
                shutil.copyfileobj(upload.file, buffer)

            text = extract_text(stored_path, upload.content_type)
            if not text.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{filename} does not contain readable text.",
                )

            chunk_documents = self._chunk_text(
                text=text,
                document_id=document_id,
                source=stored_name,
                session_id=session,
            )

            if not chunk_documents:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"{filename} could not be chunked into readable sections.",
                )

            documents_for_embedding.extend(chunk_documents)
            chunk_ids.extend(
                [
                    f"{document_id}_{doc.metadata['chunk_index']}"
                    for doc in chunk_documents
                ]
            )

            documents_meta.append(
                DocumentMetaData(
                    document_id=document_id,
                    filename=filename,
                    content_type=upload.content_type
                    or "application/octet-stream",
                    stored_path=str(stored_path),
                    chunk_count=len(chunk_documents),
                )
            )

        vector_store = Chroma(
            collection_name=session,
            embedding_function=self.embedding_model,
            persist_directory=str(vector_dir),
        )
        vector_store.add_documents(documents_for_embedding, ids=chunk_ids)

        return session, documents_meta
    
    def _chunk_text(
        self, *, text: str, document_id: str, source: str, session_id: str
    ) -> List[Document]:
        """Split raw text into LangChain Document chunks with metadata."""

        chunks = self.splitter.split_text(text)
        documents: List[Document] = []
        for idx, chunk in enumerate(chunks):
            documents.append(
                Document(
                    page_content=chunk,
                    metadata={
                        "document_id": document_id,
                        "source": source,
                        "chunk_index": idx,
                        "session_id": session_id,
                    },
                )
            )
        return documents