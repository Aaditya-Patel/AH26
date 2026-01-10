"""
Emission factors and questionnaires by sector

TODO: Developer 2 will populate with:
- Emission factors by sector
- Questionnaires for each sector (3-4 key questions)
- Calculation formulas
"""

# Emission factors (tCO2e per unit)
EMISSION_FACTORS = {
    "cement": {
        "scope1": {
            "clinker_production": 0.85,  # tCO2e per tonne clinker
            "fuel_coal": 2.86,  # tCO2e per tonne coal
            "fuel_diesel": 2.68,  # tCO2e per kL diesel
        },
        "scope2": {
            "electricity": 0.82,  # tCO2e per MWh (grid average)
        },
        "scope3": {
            "transportation": 0.12,  # tCO2e per tonne-km
        }
    },
    "iron_steel": {
        "scope1": {
            "blast_furnace": 1.85,  # tCO2e per tonne steel
            "electric_arc": 0.40,  # tCO2e per tonne steel
        },
        "scope2": {
            "electricity": 0.82,
        }
    },
    "textiles": {
        "scope1": {
            "dyeing_gas": 2.03,  # tCO2e per m³ natural gas
            "processing_fuel": 2.68,  # tCO2e per kL fuel
        },
        "scope2": {
            "electricity": 0.82,
        },
        "scope3": {
            "water_treatment": 0.05,  # tCO2e per m³ water
        }
    }
}

# Sector-specific questionnaires
QUESTIONNAIRES = {
    "cement": [
        {
            "id": "clinker_production",
            "question": "Annual clinker production (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "coal_consumption",
            "question": "Annual coal consumption (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "electricity_consumption",
            "question": "Annual electricity consumption (MWh)",
            "type": "number",
            "unit": "MWh"
        },
        {
            "id": "diesel_consumption",
            "question": "Annual diesel consumption (kilolitres)",
            "type": "number",
            "unit": "kL"
        }
    ],
    "iron_steel": [
        {
            "id": "production_method",
            "question": "Primary steel production method",
            "type": "select",
            "options": ["Blast Furnace", "Electric Arc Furnace", "Both"]
        },
        {
            "id": "steel_production",
            "question": "Annual steel production (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "electricity_consumption",
            "question": "Annual electricity consumption (MWh)",
            "type": "number",
            "unit": "MWh"
        }
    ],
    "textiles": [
        {
            "id": "fabric_production",
            "question": "Annual fabric production (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "natural_gas_consumption",
            "question": "Annual natural gas consumption (cubic meters)",
            "type": "number",
            "unit": "m³"
        },
        {
            "id": "electricity_consumption",
            "question": "Annual electricity consumption (MWh)",
            "type": "number",
            "unit": "MWh"
        },
        {
            "id": "water_consumption",
            "question": "Annual water consumption (cubic meters)",
            "type": "number",
            "unit": "m³"
        }
    ]
}
