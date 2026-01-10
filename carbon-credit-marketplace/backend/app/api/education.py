from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.schemas.schemas import ChatRequest, ChatResponse
from app.agents.education_agent import chat_with_education_agent, chat_with_education_agent_stream

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


@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Chat with the education agent using streaming responses
    
    Uses RAG (Retrieval-Augmented Generation) with Server-Sent Events (SSE):
    - Searches Qdrant for relevant document chunks
    - Streams OpenAI GPT-4o-mini response chunks
    - Sends sources as final SSE event
    """
    
    async def generate():
        try:
            async for chunk in chat_with_education_agent_stream(request.question):
                # Check if it's a JSON string (sources) or text chunk
                if chunk.startswith("{") and '"type"' in chunk:
                    # Sources event
                    yield f"data: {chunk}\n\n"
                else:
                    # Text chunk
                    yield f"data: {chunk}\n\n"
        except Exception as e:
            error_data = f'{{"type": "error", "message": "{str(e)}"}}'
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
