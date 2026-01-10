from fastapi import APIRouter
from app.schemas.schemas import ChatRequest, ChatResponse
from app.agents.education_agent import chat_with_education_agent

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the education agent about carbon credits
    
    Uses RAG (Retrieval-Augmented Generation) to answer questions:
    - Searches Qdrant for relevant document chunks
    - Uses OpenAI GPT-4o-mini for response generation
    - Returns answer with source citations
    """
    
    result = await chat_with_education_agent(request.question)
    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"]
    )
