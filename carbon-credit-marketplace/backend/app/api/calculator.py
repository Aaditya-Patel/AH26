from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.schemas import CalculationRequest, CalculationResponse
from app.agents.calculator_agent import calculate_emissions, get_questions_for_sector

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
