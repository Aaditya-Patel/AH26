"""
Calculator Agent - Calculate emissions and credit needs
"""

import math
from app.data.emission_factors import EMISSION_FACTORS, QUESTIONNAIRES


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
