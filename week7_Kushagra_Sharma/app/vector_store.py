import os
from langchain_community.vectorstores import Chroma
from app.embeddings import get_embedding_model

VECTOR_DB_DIR = os.getenv("VECTOR_DB_DIR", "data/vector_db")

_vector_store = None


def build_vector_store(chunks):
    global _vector_store
    embedding_model = get_embedding_model()
    _vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model,
        persist_directory=VECTOR_DB_DIR
    )
    return _vector_store


def load_vector_store():
    global _vector_store
    if _vector_store is None:
        embedding_model = get_embedding_model()
        _vector_store = Chroma(
            persist_directory=VECTOR_DB_DIR,
            embedding_function=embedding_model
        )
    return _vector_store


def get_retriever(k=4):
    store = load_vector_store()
    return store.as_retriever(search_kwargs={"k": k})
