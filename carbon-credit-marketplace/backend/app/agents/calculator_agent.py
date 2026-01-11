"""
Calculator Agent - Calculate emissions and credit needs
"""

import math
import re
import json
from typing import Dict, Any, Optional
from app.data.emission_factors import EMISSION_FACTORS, QUESTIONNAIRES
from app.agents.llm_client import get_completion, get_completion_stream


def get_questions_for_sector(sector: str) -> list:
    """Get questionnaire for specific sector"""
    return QUESTIONNAIRES.get(sector, [])


def calculate_emissions(sector: str, answers: dict) -> dict:
    """
    Calculate emissions based on answers
    
    Returns:
        dict: {
            "total_emissions": float,
            "scope1_emissions": float,
            "scope2_emissions": float,
            "scope3_emissions": float,
            "credits_needed": int,
            "cost_estimate": float,
            "breakdown": list
        }
    """
    if sector not in EMISSION_FACTORS:
        raise ValueError(f"Unknown sector: {sector}")
    
    factors = EMISSION_FACTORS[sector]
    breakdown = []
    scope1 = 0.0
    
    # Special handling for iron_steel sector (needs to be done first)
    if sector == "iron_steel":
        production_method = str(answers.get("production_method", "")).lower()
        steel_production = answers.get("steel_production", 0) or 0
        
        if steel_production > 0:
            if "blast" in production_method:
                blast_emission = steel_production * factors["scope1"]["blast_furnace"]
                scope1 = blast_emission
                breakdown.append({
                    "source": "Blast Furnace Production",
                    "emissions": round(blast_emission, 2)
                })
            elif "electric" in production_method:
                electric_emission = steel_production * factors["scope1"]["electric_arc"]
                scope1 = electric_emission
                breakdown.append({
                    "source": "Electric Arc Furnace Production",
                    "emissions": round(electric_emission, 2)
                })
            elif production_method == "both":
                # Split production between methods (50/50 for simplicity)
                blast_emission = (steel_production / 2) * factors["scope1"]["blast_furnace"]
                electric_emission = (steel_production / 2) * factors["scope1"]["electric_arc"]
                scope1 = blast_emission + electric_emission
                breakdown.append({
                    "source": "Blast Furnace Production (50%)",
                    "emissions": round(blast_emission, 2)
                })
                breakdown.append({
                    "source": "Electric Arc Furnace Production (50%)",
                    "emissions": round(electric_emission, 2)
                })
    else:
        # Calculate Scope 1 emissions for other sectors
        scope1 = 0.0
        if "scope1" in factors:
            for key, factor in factors["scope1"].items():
                value = answers.get(key, 0) or 0
                if isinstance(value, (int, float)) and value > 0:
                    emission = value * factor
                    scope1 += emission
                    breakdown.append({
                        "source": key.replace("_", " ").title(),
                        "emissions": round(emission, 2)
                    })
    
    # Calculate Scope 2 emissions
    scope2 = 0.0
    if "scope2" in factors:
        for key, factor in factors["scope2"].items():
            value = answers.get(key, 0) or 0
            if isinstance(value, (int, float)) and value > 0:
                emission = value * factor
                scope2 += emission
                breakdown.append({
                    "source": key.replace("_", " ").title(),
                    "emissions": round(emission, 2)
                })
    
    # Calculate Scope 3 emissions
    scope3 = 0.0
    if "scope3" in factors:
        for key, factor in factors["scope3"].items():
            value = answers.get(key, 0) or 0
            if isinstance(value, (int, float)) and value > 0:
                emission = value * factor
                scope3 += emission
                breakdown.append({
                    "source": key.replace("_", " ").title(),
                    "emissions": round(emission, 2)
                })
    
    # Calculate total emissions
    total_emissions = scope1 + scope2 + scope3
    
    # Calculate credits needed (round up)
    credits_needed = math.ceil(total_emissions)
    
    # Calculate cost estimate (average price ₹2,500 per credit)
    cost_estimate = credits_needed * 2500
    
    return {
        "total_emissions": round(total_emissions, 2),
        "scope1_emissions": round(scope1, 2),
        "scope2_emissions": round(scope2, 2),
        "scope3_emissions": round(scope3, 2),
        "credits_needed": credits_needed,
        "cost_estimate": round(cost_estimate, 2),
        "breakdown": breakdown
    }


# ==================== INTERACTIVE CHAT FUNCTIONS ====================

def get_initial_calculator_state(sector: Optional[str] = None) -> Dict[str, Any]:
    """Get initial conversation state for calculator"""
    return {
        "sector": sector,  # Selected sector
        "answers": {},  # Collected answers {question_id: value}
        "current_question_index": 0,  # Index of current question being asked
        "conversation_history": [],  # Chat history
        "status": "asking_questions"  # "asking_questions" or "calculation_complete"
    }


def detect_sector_from_message(user_message: str) -> Optional[str]:
    """Detect sector from user message"""
    user_message_lower = user_message.lower().strip()
    
    # Sector mappings
    sector_keywords = {
        "cement": ["cement"],
        "iron_steel": ["iron", "steel", "iron & steel", "iron and steel"],
        "textiles": ["textile", "textiles"],
        "aluminium": ["aluminium", "aluminum"],
        "chlor_alkali": ["chlor", "alkali", "chlor-alkali"],
        "fertilizer": ["fertilizer", "fertiliser"],
        "pulp_paper": ["pulp", "paper"],
        "petrochemicals": ["petrochemical"],
        "petroleum_refining": ["petroleum", "refining", "refinery"]
    }
    
    for sector, keywords in sector_keywords.items():
        if any(keyword in user_message_lower for keyword in keywords):
            return sector
    
    return None


async def extract_answer_from_message(state: Dict[str, Any], user_message: str) -> Optional[Any]:
    """Extract answer value from user message"""
    if not state.get("sector"):
        return None
    
    questions = QUESTIONNAIRES.get(state["sector"], [])
    if not questions:
        return None
    
    current_index = state.get("current_question_index", 0)
    if current_index >= len(questions):
        return None
    
    current_question = questions[current_index]
    question_type = current_question.get("type")
    
    if question_type == "number":
        # Extract number from message using regex
        # Look for numbers with optional decimal points
        numbers = re.findall(r'\d+\.?\d*', user_message.replace(',', ''))
        if numbers:
            try:
                value = float(numbers[0])
                if value > 0:
                    return value
            except ValueError:
                pass
        # Try using LLM as fallback
        try:
            prompt = f"""Extract a numerical value from the following user message. 
The user is answering: "{current_question.get('question')}" (unit: {current_question.get('unit', 'N/A')})

User message: "{user_message}"

Return ONLY the numerical value as a number (no text, no explanation). If no clear number is found, return "null"."""
            result = await get_completion(prompt, "You are a helpful assistant that extracts numerical values from text.")
            try:
                value = float(result.strip())
                if value > 0:
                    return value
            except ValueError:
                pass
        except:
            pass
        return None
    
    elif question_type == "select":
        # Match user response to options
        options = current_question.get("options", [])
        user_message_lower = user_message.lower().strip()
        
        # Direct matching
        for option in options:
            if option.lower() == user_message_lower:
                return option
            if option.lower() in user_message_lower or user_message_lower in option.lower():
                return option
        
        # Check for partial matches
        for option in options:
            option_words = option.lower().split()
            if any(word in user_message_lower for word in option_words if len(word) > 3):
                return option
        
        # Try using LLM as fallback
        try:
            prompt = f"""Extract the selected option from the following user message.
The user is answering: "{current_question.get('question')}"

Available options: {', '.join(options)}

User message: "{user_message}"

Return ONLY the exact option text that matches the user's message. If no clear match, return "null"."""
            result = await get_completion(prompt, "You are a helpful assistant that matches user text to options.")
            result = result.strip().strip('"').strip("'")
            if result in options:
                return result
        except:
            pass
        return None
    
    return None


def update_state_from_message(state: Dict[str, Any], user_message: str) -> Dict[str, Any]:
    """Update conversation state based on user message"""
    # Detect sector if not set
    if not state.get("sector"):
        sector = detect_sector_from_message(user_message)
        if sector:
            state["sector"] = sector
            state["current_question_index"] = 0
    
    # Add to conversation history
    state["conversation_history"].append({"role": "user", "content": user_message})
    
    return state


def get_next_question(state: Dict[str, Any]) -> Optional[str]:
    """Determine the next question to ask based on collected answers"""
    sector = state.get("sector")
    if not sector:
        return "Hello! I'm your Calculator Agent. I'll help you calculate your carbon emissions. Let's start - **Which sector are you in?** (e.g., Cement, Iron & Steel, Textiles, Aluminium, Chlor-Alkali, Fertilizer, Pulp & Paper, Petrochemicals, or Petroleum Refining)"
    
    questions = QUESTIONNAIRES.get(sector, [])
    if not questions:
        return f"Sorry, I don't have questions configured for the {sector} sector. Please choose a different sector."
    
    current_index = state.get("current_question_index", 0)
    if current_index >= len(questions):
        return None  # All questions answered
    
    current_question = questions[current_index]
    question_text = current_question.get("question", "")
    unit = current_question.get("unit")
    
    if unit:
        return f"{question_text} (Unit: {unit})"
    else:
        options = current_question.get("options")
        if options:
            return f"{question_text} (Options: {', '.join(options)})"
        return question_text


def are_all_questions_answered(state: Dict[str, Any]) -> bool:
    """Check if all required questions are answered"""
    sector = state.get("sector")
    if not sector:
        return False
    
    questions = QUESTIONNAIRES.get(sector, [])
    answers = state.get("answers", {})
    
    # Check if we have answers for all questions
    required_question_ids = [q.get("id") for q in questions]
    answered_ids = list(answers.keys())
    
    return len(answered_ids) >= len(required_question_ids) and all(qid in answered_ids for qid in required_question_ids)


async def generate_calculation_explanation(sector: str, result: Dict[str, Any]) -> str:
    """Generate explanation of calculation results using LLM"""
    try:
        breakdown_text = "\n".join([
            f"- {item['source']}: {item['emissions']} tCO2e"
            for item in result.get("breakdown", [])
        ])
        
        prompt = f"""Provide a clear, concise explanation of the carbon emissions calculation results for the {sector} sector.

Results:
- Total Emissions: {result.get('total_emissions')} tCO2e
- Scope 1 (Direct): {result.get('scope1_emissions')} tCO2e
- Scope 2 (Electricity): {result.get('scope2_emissions')} tCO2e
- Scope 3 (Other Indirect): {result.get('scope3_emissions')} tCO2e
- Credits Needed: {result.get('credits_needed')} carbon credits
- Estimated Cost: ₹{result.get('cost_estimate'):,.0f}

Breakdown by Source:
{breakdown_text}

Provide a 2-3 paragraph explanation that:
1. Summarizes the total emissions and what they represent
2. Explains the breakdown by scope (Scope 1, 2, 3)
3. Mentions the credits needed and estimated cost
4. Provides brief context about what these numbers mean for compliance

Write in a friendly, informative tone suitable for a business owner."""
        
        explanation = await get_completion(
            prompt,
            "You are a helpful carbon emissions calculator that explains calculation results clearly and concisely."
        )
        return explanation
    except Exception as e:
        # Fallback explanation if LLM fails
        return f"""## Calculation Results

Your total carbon emissions are **{result.get('total_emissions')} tCO2e** (tonnes of CO2 equivalent).

**Breakdown by Scope:**
- Scope 1 (Direct Emissions): {result.get('scope1_emissions')} tCO2e
- Scope 2 (Electricity): {result.get('scope2_emissions')} tCO2e
- Scope 3 (Other Indirect): {result.get('scope3_emissions')} tCO2e

**Credits Needed:** {result.get('credits_needed')} carbon credits

**Estimated Cost:** ₹{result.get('cost_estimate'):,.0f}

These calculations are based on standard emission factors for the {sector} sector. You'll need to purchase the indicated number of carbon credits to offset your emissions for compliance with CCTS regulations."""


async def chat_with_calculator_agent_stream(question: str, conversation_state: Optional[Dict[str, Any]] = None):
    """
    Chat with calculator agent with streaming response
    
    Yields:
        str: Text chunks from LLM response, then a final JSON string with conversation_state
    """
    try:
        # Initialize or use provided state
        if conversation_state is None:
            state = get_initial_calculator_state()
        else:
            state = conversation_state.copy()
        
        # Update state based on user message
        state = update_state_from_message(state, question)
        
        # Extract answer if we have a sector and are asking questions
        if state.get("sector") and state.get("status") == "asking_questions":
            extracted_answer = await extract_answer_from_message(state, question)
            if extracted_answer is not None:
                questions = QUESTIONNAIRES.get(state["sector"], [])
                current_index = state.get("current_question_index", 0)
                if current_index < len(questions):
                    question_id = questions[current_index].get("id")
                    state["answers"][question_id] = extracted_answer
                    state["current_question_index"] = current_index + 1
        
        # Check if all questions are answered
        if state.get("sector") and are_all_questions_answered(state):
            # Calculate results
            result = calculate_emissions(state["sector"], state["answers"])
            
            # Generate explanation
            explanation = await generate_calculation_explanation(state["sector"], result)
            
            # Format results message
            breakdown_text = "\n".join([
                f"- **{item['source']}**: {item['emissions']} tCO2e"
                for item in result.get("breakdown", [])
            ])
            
            results_message = f"""## Calculation Complete! 🎉

**Total Emissions:** {result.get('total_emissions')} tCO2e

**Breakdown by Scope:**
- **Scope 1 (Direct):** {result.get('scope1_emissions')} tCO2e
- **Scope 2 (Electricity):** {result.get('scope2_emissions')} tCO2e
- **Scope 3 (Other Indirect):** {result.get('scope3_emissions')} tCO2e

**Credits Needed:** {result.get('credits_needed')} carbon credits

**Estimated Cost:** ₹{result.get('cost_estimate'):,.0f}

**Breakdown by Source:**
{breakdown_text}

---

{explanation}
"""
            
            # Stream the results message
            for char in results_message:
                yield char
            
            state["status"] = "calculation_complete"
            state["conversation_history"].append({"role": "assistant", "content": results_message})
            state["calculation_result"] = result
            
            # Send final state
            yield json.dumps({"type": "state", "conversation_state": state})
            return
        
        # Get next question
        next_question = get_next_question(state)
        if next_question:
            # Stream the question
            for char in next_question:
                yield char
            state["conversation_history"].append({"role": "assistant", "content": next_question})
            yield json.dumps({"type": "state", "conversation_state": state})
            return
        
        # If no question, provide helpful response
        response = "I need more information to proceed. Please answer the questions I've asked."
        for char in response:
            yield char
        state["conversation_history"].append({"role": "assistant", "content": response})
        yield json.dumps({"type": "state", "conversation_state": state})
        
    except Exception as e:
        error_message = f"I encountered an error: {str(e)}. Please try again or start a new calculation."
        for char in error_message:
            yield char
        error_json = json.dumps({"type": "error", "message": str(e)})
        yield error_json
