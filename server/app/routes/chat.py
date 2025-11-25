from fastapi import FastAPI, APIRouter, Depends

router = APIRouter()


@router.post("/query")
def query_documents():
    response = "response"
    return response