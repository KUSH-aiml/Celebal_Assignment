# Document QA (RAG) — Setup Guide

## What this is
A RAG system that answers questions from an uploaded PDF/TXT document. FastAPI serves both the API and the web page, ChromaDB stores embeddings, and Ollama runs the LLM locally. Everything runs on one port.

## Part 1: Install Ollama (for the local LLM)
1. Download from https://ollama.com and install it.
2. Pull a model in your terminal:
   ```
   ollama pull llama3
   ```
3. Keep Ollama running in the background (it starts automatically after install on most systems).

## Part 2: Project setup in VS Code
1. Open this folder in VS Code.
2. Create a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate      (Windows)
   source venv/bin/activate   (Mac/Linux)
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` (defaults work fine to start).

## Part 3: Run the app
```
uvicorn app.main:app --reload --port 8000
```
Open http://localhost:8000 in your browser — this is the whole app, upload page and chat, on one page.

## Part 4: Using the app
1. Select or drop a PDF/TXT file — it gets processed automatically.
2. Once processing finishes, the page switches to the question view.
3. Type a question and hit Ask (or press Enter).
4. Expand "View source chunks used" under any answer to see which parts of the document it came from.
5. Click "Upload a different document" to start over with a new file.

## Notes
- The vector store persists in `data/vector_db`, so re-uploading the same file will add duplicate chunks. Delete that folder if you want to start fresh with a new document.
- If answers come back empty or slow, check that Ollama is running and the model name in `.env` matches what you pulled.
- To switch to an API-based LLM (like OpenAI) instead of Ollama, only `app/rag_pipeline.py` needs to change — the rest of the pipeline stays the same.
- Frontend files live in `frontend/static/` (`index.html`, `style.css`, `script.js`) — plain HTML/CSS/JS, no build step needed.
