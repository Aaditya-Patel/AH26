import { useState } from 'react';
import Layout from '../components/Layout';
import { calculatorAPI } from '../api/client';
import { CalculationResult } from '../types';

export default function Calculator() {
  const [step, setStep] = useState(1);
  const [sector, setSector] = useState('');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const sectors = [
    { value: 'cement', label: 'Cement' },
    { value: 'iron_steel', label: 'Iron & Steel' },
    { value: 'textiles', label: 'Textiles' },
  ];

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await calculatorAPI.calculate(sector, answers);
      setResult(response.data);
      setStep(3);
    } catch (error) {
      alert('Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Emission Calculator</h1>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2">Select Sector</span>
            </div>
            <div className="h-1 w-16 bg-gray-200"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2">Answer Questions</span>
            </div>
            <div className="h-1 w-16 bg-gray-200"></div>
            <div className={`flex items-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2">Results</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Select Your Sector</h2>
              <div className="space-y-4">
                {sectors.map((s) => (
                  <label key={s.value} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value={s.value}
                      checked={sector === s.value}
                      onChange={(e) => setSector(e.target.value)}
                      className="mr-4"
                    />
                    <span className="text-lg">{s.label}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!sector}
                className="mt-6 w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Answer Questions</h2>
              <p className="text-gray-600 mb-6">
                Provide data about your operations for {sectors.find(s => s.value === sector)?.label}
              </p>
              
              {/* Placeholder questions */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Production (tonnes)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border rounded-lg"
                    onChange={(e) => setAnswers({ ...answers, production: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Electricity Consumption (MWh)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border rounded-lg"
                    onChange={(e) => setAnswers({ ...answers, electricity: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
                >
                  Back
                </button>
                <button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Calculating...' : 'Calculate'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && result && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Your Results</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Total Emissions</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {result.total_emissions.toFixed(2)} tCO2e
                  </p>
                </div>
                
                <div className="bg-primary-50 p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Credits Needed</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {result.credits_needed} credits
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-4">Emission Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span>Scope 1 (Direct)</span>
                    <span className="font-semibold">{result.scope1_emissions.toFixed(2)} tCO2e</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span>Scope 2 (Electricity)</span>
                    <span className="font-semibold">{result.scope2_emissions.toFixed(2)} tCO2e</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded">
                    <span>Scope 3 (Other Indirect)</span>
                    <span className="font-semibold">{result.scope3_emissions.toFixed(2)} tCO2e</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Estimated Cost:</strong> ₹{result.cost_estimate.toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setStep(1)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
              >
                Start New Calculation
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
