export interface Question {
  id: string;
  question: string;
  type: 'number' | 'select';
  unit?: string;
  options?: string[];
}

export interface Questionnaire {
  [sector: string]: Question[];
}

export const QUESTIONNAIRES: Questionnaire = {
  cement: [
    {
      id: 'clinker_production',
      question: 'Annual clinker production (tonnes)',
      type: 'number',
      unit: 'tonnes',
    },
    {
      id: 'coal_consumption',
      question: 'Annual coal consumption (tonnes)',
      type: 'number',
      unit: 'tonnes',
    },
    {
      id: 'electricity_consumption',
      question: 'Annual electricity consumption (MWh)',
      type: 'number',
      unit: 'MWh',
    },
    {
      id: 'diesel_consumption',
      question: 'Annual diesel consumption (kilolitres)',
      type: 'number',
      unit: 'kL',
    },
  ],
  iron_steel: [
    {
      id: 'production_method',
      question: 'Primary steel production method',
      type: 'select',
      options: ['Blast Furnace', 'Electric Arc Furnace', 'Both'],
    },
    {
      id: 'steel_production',
      question: 'Annual steel production (tonnes)',
      type: 'number',
      unit: 'tonnes',
    },
    {
      id: 'electricity_consumption',
      question: 'Annual electricity consumption (MWh)',
      type: 'number',
      unit: 'MWh',
    },
  ],
  textiles: [
    {
      id: 'fabric_production',
      question: 'Annual fabric production (tonnes)',
      type: 'number',
      unit: 'tonnes',
    },
    {
      id: 'natural_gas_consumption',
      question: 'Annual natural gas consumption (cubic meters)',
      type: 'number',
      unit: 'm³',
    },
    {
      id: 'electricity_consumption',
      question: 'Annual electricity consumption (MWh)',
      type: 'number',
      unit: 'MWh',
    },
    {
      id: 'water_consumption',
      question: 'Annual water consumption (cubic meters)',
      type: 'number',
      unit: 'm³',
    },
  ],
};

