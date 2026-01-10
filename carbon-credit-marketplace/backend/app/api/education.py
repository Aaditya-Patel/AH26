from fastapi import APIRouter
from app.schemas.schemas import ChatRequest, ChatResponse
# from app.agents.education_agent import chat_with_education_agent

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with the education agent about carbon credits
    
    TODO: Implement education agent logic
    - Developer 2 will implement RAG-based Q&A
    - Uses Qdrant for document retrieval
    - Uses OpenAI GPT-4o-mini for response generation
    """
    
    # Placeholder response
    # Real implementation by Developer 2
    return ChatResponse(
        answer="This is a placeholder response. Developer 2 will implement the RAG-based education agent.",
        sources=["Carbon Credits Research Report - Section 1"]
    )
