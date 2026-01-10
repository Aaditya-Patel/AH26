import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../components/Layout';
import { calculatorAPI } from '../api/client';
import { CalculationResult } from '../types';
import { QUESTIONNAIRES } from '../data/questionnaires';
import { useToast } from '../context/ToastContext';
import AnimatedInput from '../components/AnimatedInput';
import AnimatedButton from '../components/AnimatedButton';
import { slideInLeft, slideInRight, scale, staggerContainer, staggerItem } from '../utils/animations';

export default function Calculator() {
  const [step, setStep] = useState(1);
  const [sector, setSector] = useState('');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, any>>({
    defaultValues: {},
  });

  const sectors = [
    { value: 'cement', label: 'Cement' },
    { value: 'iron_steel', label: 'Iron & Steel' },
    { value: 'textiles', label: 'Textiles' },
  ];

  const questions = sector ? QUESTIONNAIRES[sector] || [] : [];

  const onSubmitQuestions = async (answers: Record<string, any>) => {
    try {
      const response = await calculatorAPI.calculate(sector, answers);
      setResult(response.data);
      setStep(3);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Calculation failed. Please try again.', 'error');
    }
  };

  const handleReset = () => {
    setStep(1);
    setSector('');
    reset();
    setResult(null);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Emission Calculator</h1>

        {/* Progress */}
        <div className="mb-8">
          <motion.div
            className="flex items-center justify-center space-x-2 md:space-x-4 overflow-x-auto pb-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div
              className={`flex items-center flex-shrink-0 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}
              variants={staggerItem}
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
                animate={step >= 1 ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                1
              </motion.div>
              <span className="ml-2 text-sm md:text-base">Select Sector</span>
            </motion.div>
            <div className="h-1 w-8 md:w-16 bg-gray-200 flex-shrink-0"></div>
            <motion.div
              className={`flex items-center flex-shrink-0 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}
              variants={staggerItem}
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
                animate={step >= 2 ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                2
              </motion.div>
              <span className="ml-2 text-sm md:text-base">Answer Questions</span>
            </motion.div>
            <div className="h-1 w-8 md:w-16 bg-gray-200 flex-shrink-0"></div>
            <motion.div
              className={`flex items-center flex-shrink-0 ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}
              variants={staggerItem}
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}
                animate={step >= 3 ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                3
              </motion.div>
              <span className="ml-2 text-sm md:text-base">Results</span>
            </motion.div>
          </motion.div>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={slideInLeft}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h2 className="text-2xl font-semibold mb-6">Select Your Sector</h2>
                <motion.div
                  className="space-y-4"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {sectors.map((s) => (
                    <motion.label
                      key={s.value}
                      className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                      variants={staggerItem}
                      whileHover={{ scale: 1.02, x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <input
                        type="radio"
                        value={s.value}
                        checked={sector === s.value}
                        onChange={(e) => {
                          setSector(e.target.value);
                          reset();
                        }}
                        className="mr-4"
                      />
                      <span className="text-lg">{s.label}</span>
                    </motion.label>
                  ))}
                </motion.div>
                <AnimatedButton
                  onClick={() => setStep(2)}
                  disabled={!sector}
                  className="mt-6 w-full py-3"
                >
                  Next
                </AnimatedButton>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={slideInRight}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h2 className="text-2xl font-semibold mb-6">Answer Questions</h2>
                <p className="text-gray-600 mb-6">
                  Provide data about your operations for {sectors.find(s => s.value === sector)?.label}
                </p>
                
                <form onSubmit={handleSubmit(onSubmitQuestions)}>
                  <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {questions.map((q) => (
                      <motion.div key={q.id} variants={staggerItem}>
                        {q.type === 'number' ? (
                          <AnimatedInput
                            {...register(q.id, { valueAsNumber: true })}
                            type="number"
                            step="any"
                            label={`${q.question} ${q.unit ? `(${q.unit})` : ''}`}
                            placeholder={`Enter value in ${q.unit || 'units'}`}
                            error={errors[q.id]?.message as string}
                          />
                        ) : q.type === 'select' && q.options ? (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {q.question}
                            </label>
                            <Controller
                              name={q.id}
                              control={control}
                              render={({ field }) => (
                                <motion.select
                                  {...field}
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                                  whileFocus={{ scale: 1.01 }}
                                >
                                  <option value="">Select an option</option>
                                  {q.options.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </motion.select>
                              )}
                            />
                          </div>
                        ) : null}
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="mt-6 flex space-x-4">
                    <AnimatedButton
                      type="button"
                      variant="secondary"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3"
                    >
                      Back
                    </AnimatedButton>
                    <AnimatedButton
                      type="submit"
                      isLoading={isSubmitting}
                      className="flex-1 py-3"
                    >
                      {isSubmitting ? 'Calculating...' : 'Calculate'}
                    </AnimatedButton>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && result && (
              <motion.div
                key="step3"
                variants={scale}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h2 className="text-2xl font-semibold mb-6">Your Results</h2>
                
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div
                    className="bg-blue-50 p-6 rounded-lg"
                    variants={staggerItem}
                    whileHover={{ scale: 1.05 }}
                  >
                    <p className="text-sm text-gray-600 mb-2">Total Emissions</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-600">
                      {result.total_emissions.toFixed(2)} tCO2e
                    </p>
                  </motion.div>
                  
                  <motion.div
                    className="bg-primary-50 p-6 rounded-lg"
                    variants={staggerItem}
                    whileHover={{ scale: 1.05 }}
                  >
                    <p className="text-sm text-gray-600 mb-2">Credits Needed</p>
                    <p className="text-2xl md:text-3xl font-bold text-primary-600">
                      {result.credits_needed} credits
                    </p>
                  </motion.div>
                </motion.div>

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

              {result.breakdown && result.breakdown.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-4">Emission Breakdown by Source</h3>
                  <div className="space-y-2">
                    {result.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>{item.source}</span>
                        <span className="font-semibold">{item.emissions.toFixed(2)} tCO2e</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                <div className="flex flex-col sm:flex-row gap-4">
                  <AnimatedButton
                    onClick={() => navigate('/matching', { state: { creditsNeeded: result.credits_needed, costEstimate: result.cost_estimate } })}
                    className="flex-1 py-3"
                  >
                    Find Matched Sellers
                  </AnimatedButton>
                  <AnimatedButton
                    variant="secondary"
                    onClick={handleReset}
                    className="flex-1 py-3"
                  >
                    Start New Calculation
                  </AnimatedButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
