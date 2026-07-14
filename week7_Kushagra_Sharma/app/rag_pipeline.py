import os
from langchain_ollama import OllamaLLM
from app.vector_store import get_retriever

LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "llama3")
TOP_K = int(os.getenv("TOP_K", 4))

PROMPT_TEMPLATE = """Answer the question using only the context below.
If the answer is not present in the context, say you don't know.

Context:
{context}

Question: {question}
Answer:"""


def get_llm():
    return OllamaLLM(model=LLM_MODEL_NAME)


def answer_question(question):
    retriever = get_retriever(k=TOP_K)
    retrieved_docs = retriever.invoke(question)

    context_text = "\n\n".join(doc.page_content for doc in retrieved_docs)
    prompt = PROMPT_TEMPLATE.format(context=context_text, question=question)

    llm = get_llm()
    answer = llm.invoke(prompt)

    sources = [
        {
            "content": doc.page_content[:300],
            "page": doc.metadata.get("page", "N/A")
        }
        for doc in retrieved_docs
    ]

    return {"answer": answer, "sources": sources}
