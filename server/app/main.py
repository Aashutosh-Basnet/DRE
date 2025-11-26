from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.chat import router as chat_router
from app.routes.documents import router as document_router

app = FastAPI(title="RAG Application Server")

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "RAG backend is running. Use /document/upload and /chat/query."}


app.include_router(document_router, prefix="/document", tags=["Documents"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])