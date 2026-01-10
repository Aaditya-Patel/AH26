"""
Emission factors and questionnaires by sector for all 9 CCTS sectors

Sectors covered (as per Carbon Credit Trading Scheme):
1. Aluminium
2. Chlor-alkali
3. Cement
4. Fertilizer
5. Iron & Steel
6. Pulp & Paper
7. Petrochemicals
8. Petroleum Refining
9. Textiles
"""

# Emission factors (tCO2e per unit)
EMISSION_FACTORS = {
    "aluminium": {
        "scope1": {
            "aluminium_smelting": 1.65,  # tCO2e per tonne aluminium
            "anode_consumption": 0.33,  # tCO2e per tonne aluminium (perfluorocarbon emissions)
            "fuel_consumption": 2.68,  # tCO2e per kL fuel
        },
        "scope2": {
            "electricity": 0.82,  # tCO2e per MWh (grid average)
        },
        "scope3": {
            "raw_material_transport": 0.08,  # tCO2e per tonne-km
        }
    },
    "chlor_alkali": {
        "scope1": {
            "process_emissions": 0.18,  # tCO2e per tonne caustic soda
            "fuel_consumption": 2.68,  # tCO2e per kL fuel
        },
        "scope2": {
            "electricity": 0.82,  # tCO2e per MWh
        },
        "scope3": {
            "brine_transport": 0.05,  # tCO2e per tonne-km
        }
    },
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
    "fertilizer": {
        "scope1": {
            "ammonia_production": 1.87,  # tCO2e per tonne ammonia
            "urea_production": 0.73,  # tCO2e per tonne urea
            "fuel_natural_gas": 2.03,  # tCO2e per m³ natural gas (×1000)
        },
        "scope2": {
            "electricity": 0.82,  # tCO2e per MWh
        },
        "scope3": {
            "raw_material_transport": 0.10,  # tCO2e per tonne-km
        }
    },
    "iron_steel": {
        "scope1": {
            "blast_furnace": 1.85,  # tCO2e per tonne steel (BF-BOF route)
            "electric_arc": 0.40,  # tCO2e per tonne steel (EAF route)
            "coke_production": 0.42,  # tCO2e per tonne coke
        },
        "scope2": {
            "electricity": 0.82,  # tCO2e per MWh
        },
        "scope3": {
            "raw_material_transport": 0.08,  # tCO2e per tonne-km
        }
    },
    "pulp_paper": {
        "scope1": {
            "pulping_process": 0.45,  # tCO2e per tonne pulp
            "fuel_coal": 2.86,  # tCO2e per tonne coal
            "fuel_biomass": 0.15,  # tCO2e per tonne biomass (carbon neutral adjustment)
        },
        "scope2": {
            "electricity": 0.82,  # tCO2e per MWh
        },
        "scope3": {
            "water_treatment": 0.03,  # tCO2e per m³ water
            "wood_transport": 0.07,  # tCO2e per tonne-km
        }
    },
    "petrochemicals": {
        "scope1": {
            "steam_cracking": 0.95,  # tCO2e per tonne ethylene
            "fuel_consumption": 2.68,  # tCO2e per kL fuel
            "process_emissions": 0.35,  # tCO2e per tonne product
        },
        "scope2": {
            "electricity": 0.82,  # tCO2e per MWh
        },
        "scope3": {
            "feedstock_transport": 0.09,  # tCO2e per tonne-km
        }
    },
    "petroleum_refining": {
        "scope1": {
            "crude_processing": 0.28,  # tCO2e per tonne crude processed
            "hydrogen_production": 9.0,  # tCO2e per tonne hydrogen
            "fuel_consumption": 2.68,  # tCO2e per kL fuel
        },
        "scope2": {
            "electricity": 0.82,  # tCO2e per MWh
        },
        "scope3": {
            "crude_transport": 0.06,  # tCO2e per tonne-km
        }
    },
    "textiles": {
        "scope1": {
            "dyeing_gas": 2.03,  # tCO2e per '000 m³ natural gas
            "processing_fuel": 2.68,  # tCO2e per kL fuel
        },
        "scope2": {
            "electricity": 0.82,  # tCO2e per MWh
        },
        "scope3": {
            "water_treatment": 0.05,  # tCO2e per m³ water
        }
    }
}

# Sector-specific questionnaires for all 9 CCTS sectors
QUESTIONNAIRES = {
    "aluminium": [
        {
            "id": "aluminium_smelting",
            "question": "Annual aluminium production (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "anode_consumption",
            "question": "Annual anode consumption (tonnes of aluminium equivalent)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "electricity",
            "question": "Annual electricity consumption (MWh)",
            "type": "number",
            "unit": "MWh"
        },
        {
            "id": "fuel_consumption",
            "question": "Annual fuel consumption (kilolitres)",
            "type": "number",
            "unit": "kL"
        }
    ],
    "chlor_alkali": [
        {
            "id": "process_emissions",
            "question": "Annual caustic soda production (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "electricity",
            "question": "Annual electricity consumption (MWh)",
            "type": "number",
            "unit": "MWh"
        },
        {
            "id": "fuel_consumption",
            "question": "Annual fuel consumption (kilolitres)",
            "type": "number",
            "unit": "kL"
        }
    ],
    "cement": [
        {
            "id": "clinker_production",
            "question": "Annual clinker production (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "fuel_coal",
            "question": "Annual coal consumption (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "electricity",
            "question": "Annual electricity consumption (MWh)",
            "type": "number",
            "unit": "MWh"
        },
        {
            "id": "fuel_diesel",
            "question": "Annual diesel consumption (kilolitres)",
            "type": "number",
            "unit": "kL"
        }
    ],
    "fertilizer": [
        {
            "id": "ammonia_production",
            "question": "Annual ammonia production (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "urea_production",
            "question": "Annual urea production (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "fuel_natural_gas",
            "question": "Annual natural gas consumption ('000 cubic meters)",
            "type": "number",
            "unit": "'000 m³"
        },
        {
            "id": "electricity",
            "question": "Annual electricity consumption (MWh)",
            "type": "number",
            "unit": "MWh"
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
            "id": "coke_production",
            "question": "Annual coke consumption (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "electricity",
            "question": "Annual electricity consumption (MWh)",
            "type": "number",
            "unit": "MWh"
        }
    ],
    "pulp_paper": [
        {
            "id": "pulping_process",
            "question": "Annual pulp production (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "fuel_coal",
            "question": "Annual coal consumption (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "fuel_biomass",
            "question": "Annual biomass consumption (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "electricity",
            "question": "Annual electricity consumption (MWh)",
            "type": "number",
            "unit": "MWh"
        },
        {
            "id": "water_treatment",
            "question": "Annual water treatment volume (cubic meters)",
            "type": "number",
            "unit": "m³"
        }
    ],
    "petrochemicals": [
        {
            "id": "steam_cracking",
            "question": "Annual ethylene production (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "process_emissions",
            "question": "Annual product output (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "electricity",
            "question": "Annual electricity consumption (MWh)",
            "type": "number",
            "unit": "MWh"
        },
        {
            "id": "fuel_consumption",
            "question": "Annual fuel consumption (kilolitres)",
            "type": "number",
            "unit": "kL"
        }
    ],
    "petroleum_refining": [
        {
            "id": "crude_processing",
            "question": "Annual crude oil processed (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "hydrogen_production",
            "question": "Annual hydrogen production (tonnes)",
            "type": "number",
            "unit": "tonnes"
        },
        {
            "id": "electricity",
            "question": "Annual electricity consumption (MWh)",
            "type": "number",
            "unit": "MWh"
        },
        {
            "id": "fuel_consumption",
            "question": "Annual fuel consumption (kilolitres)",
            "type": "number",
            "unit": "kL"
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
            "id": "dyeing_gas",
            "question": "Annual natural gas consumption ('000 cubic meters)",
            "type": "number",
            "unit": "'000 m³"
        },
        {
            "id": "electricity",
            "question": "Annual electricity consumption (MWh)",
            "type": "number",
            "unit": "MWh"
        },
        {
            "id": "processing_fuel",
            "question": "Annual processing fuel consumption (kilolitres)",
            "type": "number",
            "unit": "kL"
        },
        {
            "id": "water_treatment",
            "question": "Annual water treatment volume (cubic meters)",
            "type": "number",
            "unit": "m³"
        }
    ]
}

# Sector display names
SECTOR_NAMES = {
    "aluminium": "Aluminium",
    "chlor_alkali": "Chlor-Alkali",
    "cement": "Cement",
    "fertilizer": "Fertilizer",
    "iron_steel": "Iron & Steel",
    "pulp_paper": "Pulp & Paper",
    "petrochemicals": "Petrochemicals",
    "petroleum_refining": "Petroleum Refining",
    "textiles": "Textiles"
}
