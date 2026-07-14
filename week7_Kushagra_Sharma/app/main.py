import os
import shutil
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

load_dotenv()

from app.ingestion import process_file
from app.vector_store import build_vector_store
from app.rag_pipeline import answer_question

app = FastAPI(title="Document QA RAG API")

UPLOAD_DIR = "data/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory="frontend/static"), name="static")


class QueryRequest(BaseModel):
    question: str


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    chunks = process_file(file_path)
    build_vector_store(chunks)

    return {"filename": file.filename, "chunks_created": len(chunks)}


@app.post("/query")
async def query_document(request: QueryRequest):
    result = answer_question(request.question)
    return result


@app.get("/")
async def root():
    return FileResponse("frontend/static/index.html")
