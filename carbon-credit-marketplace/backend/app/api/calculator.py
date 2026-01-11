from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from app.schemas.schemas import CalculationRequest, CalculationResponse, CalculatorChatRequest
from app.agents.calculator_agent import calculate_emissions, get_questions_for_sector, chat_with_calculator_agent_stream
import json

router = APIRouter()


@router.get("/questions/{sector}")
async def get_questions(sector: str):
    """
    Get questionnaire questions for a specific sector
    """
    questions = get_questions_for_sector(sector)
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No questions found for sector: {sector}"
        )
    return {"sector": sector, "questions": questions}


@router.post("/calculate", response_model=CalculationResponse)
async def calculate(request: CalculationRequest):
    """
    Calculate emissions based on sector-specific questionnaire answers
    
    Uses emission_factors.py for sector-specific calculations.
    Supports sectors: cement, iron_steel, textiles
    """
    
    try:
        result = calculate_emissions(request.sector, request.answers)
        return CalculationResponse(
            sector=request.sector,
            **result
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error calculating emissions: {str(e)}"
        )


@router.post("/chat/stream")
async def chat_calculator_stream(request: CalculatorChatRequest):
    """
    Chat with calculator agent using streaming responses
    
    Uses Server-Sent Events (SSE) to stream responses in real-time.
    Returns conversation state updates as final event.
    """
    conversation_state = None
    if request.conversation_state:
        conversation_state = request.conversation_state.model_dump()
    
    async def generate():
        try:
            async for chunk in chat_with_calculator_agent_stream(request.question, conversation_state):
                # Check if it's a JSON string (state update) or text chunk
                if chunk.startswith("{") and '"type"' in chunk:
                    # State update event
                    yield f"data: {chunk}\n\n"
                else:
                    # Text chunk
                    yield f"data: {chunk}\n\n"
        except Exception as e:
            error_data = json.dumps({"type": "error", "message": str(e)})
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
