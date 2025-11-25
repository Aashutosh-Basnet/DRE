from fastapi import FastAPI
from fastapi import APIRouter

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="RAG server")

allowed_origins = [
    "http://localhost:3000",
    "https://127:0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allowed_origins=allowed_origins,
    allowed_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "RAG backend is running."
    }


