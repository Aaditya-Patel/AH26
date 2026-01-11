import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calculator as CalculatorIcon, TrendingUp, ArrowRight, Leaf, IndianRupee, AlertCircle, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';
import { calculatorAPI } from '../api/client';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '../context/ToastContext';

interface Question {
  id: string;
  question: string;
  type: 'number' | 'select';
  unit?: string;
  options?: string[];
}

interface CalculationResult {
  total_emissions: number;
  scope1_emissions: number;
  scope2_emissions: number;
  scope3_emissions: number;
  credits_needed: number;
  cost_estimate: number;
  breakdown: Array<{
    source: string;
    emissions: number;
  }>;
}

const SECTORS = [
  { value: 'aluminium', label: 'Aluminium' },
  { value: 'chlor_alkali', label: 'Chlor-Alkali' },
  { value: 'cement', label: 'Cement' },
  { value: 'fertilizer', label: 'Fertilizer' },
  { value: 'iron_steel', label: 'Iron & Steel' },
  { value: 'pulp_paper', label: 'Pulp & Paper' },
  { value: 'petrochemicals', label: 'Petrochemicals' },
  { value: 'petroleum_refining', label: 'Petroleum Refining' },
  { value: 'textiles', label: 'Textiles' },
];

export default function Calculator() {
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Load questions when sector is selected
  useEffect(() => {
    if (selectedSector) {
      loadQuestions();
    } else {
      setQuestions([]);
      setAnswers({});
      setResult(null);
    }
  }, [selectedSector]);

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const response = await calculatorAPI.getQuestions(selectedSector);
      setQuestions(response.data.questions || []);
      setAnswers({});
      setResult(null);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to load questions. Please try again.', 'error');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value === '' ? undefined : value,
    }));
  };

  const handleCalculate = async () => {
    if (!selectedSector || questions.length === 0) {
      showToast('Please select a sector first.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await calculatorAPI.calculate(selectedSector, answers);
      setResult(response.data);
      showToast('Calculation completed successfully!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to calculate emissions. Please check your inputs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFindSellers = () => {
    if (result) {
      navigate('/matching', {
        state: {
          creditsNeeded: result.credits_needed,
          costEstimate: result.cost_estimate,
        },
      });
    }
  };

  const handleReset = () => {
    setSelectedSector('');
    setQuestions([]);
    setAnswers({});
    setResult(null);
  };

  const formatSectorName = (sector: string) => {
    return SECTORS.find(s => s.value === sector)?.label || sector;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-swachh-marigold-500 to-swachh-saffron flex items-center justify-center">
              <CalculatorIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">
                Emission <GradientText>Calculator</GradientText>
              </h1>
              <p className="text-muted-foreground">Calculate your carbon footprint</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sector Selection */}
            <GlassCard className="p-6" hover={false}>
              <Label htmlFor="sector" className="text-base font-semibold mb-3 block">
                Select Your Sector
              </Label>
              <Select
                value={selectedSector}
                onValueChange={setSelectedSector}
                disabled={loadingQuestions}
              >
                <SelectTrigger id="sector" variant="glass">
                  <SelectValue placeholder="Choose your industry sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector.value} value={sector.value}>
                      {sector.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingQuestions && (
                <p className="text-sm text-muted-foreground mt-2">Loading questions...</p>
              )}
            </GlassCard>

            {/* Questions Form */}
            {questions.length > 0 && (
              <GlassCard className="p-6" hover={false}>
                <h2 className="text-xl font-semibold font-display mb-6">
                  Provide Your Data
                </h2>
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <motion.div
                      key={question.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="space-y-2"
                    >
                      <Label htmlFor={question.id} className="text-sm font-medium">
                        {question.question}
                        {question.unit && (
                          <span className="text-muted-foreground ml-2">({question.unit})</span>
                        )}
                      </Label>
                      {question.type === 'number' ? (
                        <Input
                          id={question.id}
                          type="number"
                          step="any"
                          placeholder={`Enter value in ${question.unit || 'units'}`}
                          value={answers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, parseFloat(e.target.value) || '')}
                          variant="glass"
                          className="w-full"
                        />
                      ) : question.type === 'select' && question.options ? (
                        <Select
                          value={answers[question.id] || ''}
                          onValueChange={(value) => handleAnswerChange(question.id, value)}
                        >
                          <SelectTrigger variant="glass">
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options.map((option) => (
                              <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, '_')}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : null}
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <Button
                    onClick={handleCalculate}
                    disabled={loading || questions.length === 0}
                    variant="gradient"
                    className="flex-1"
                  >
                    {loading ? 'Calculating...' : 'Calculate Emissions'}
                    <CalculatorIcon className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    disabled={loading}
                  >
                    Reset
                  </Button>
                </div>
              </GlassCard>
            )}

            {/* Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <GlassCard className="p-6" glow="orange">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-swachh-marigold-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-swachh-marigold-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold font-display">
                          Calculation Results
                        </h2>
                        <p className="text-sm text-muted-foreground">{formatSectorName(selectedSector)} Sector</p>
                      </div>
                    </div>
                  </div>

                  {/* Total Emissions */}
                  <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-swachh-marigold-500/10 to-swachh-saffron/10 border border-swachh-marigold-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Emissions</p>
                        <p className="text-3xl font-bold font-display text-swachh-marigold-600">
                          {result.total_emissions.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                          <span className="text-lg ml-2">tCO₂e</span>
                        </p>
                      </div>
                      <Leaf className="w-12 h-12 text-swachh-marigold-500/30" />
                    </div>
                  </div>

                  {/* Scope Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-lg glass">
                      <p className="text-xs text-muted-foreground mb-1">Scope 1</p>
                      <p className="text-lg font-semibold">
                        {result.scope1_emissions.toLocaleString('en-IN', { maximumFractionDigits: 2 })} tCO₂e
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Direct Emissions</p>
                    </div>
                    <div className="p-4 rounded-lg glass">
                      <p className="text-xs text-muted-foreground mb-1">Scope 2</p>
                      <p className="text-lg font-semibold">
                        {result.scope2_emissions.toLocaleString('en-IN', { maximumFractionDigits: 2 })} tCO₂e
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Indirect (Energy)</p>
                    </div>
                    <div className="p-4 rounded-lg glass">
                      <p className="text-xs text-muted-foreground mb-1">Scope 3</p>
                      <p className="text-lg font-semibold">
                        {result.scope3_emissions.toLocaleString('en-IN', { maximumFractionDigits: 2 })} tCO₂e
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Other Indirect</p>
                    </div>
                  </div>

                  {/* Credits Needed & Cost */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-lg glass">
                      <p className="text-xs text-muted-foreground mb-1">Carbon Credits Needed</p>
                      <p className="text-2xl font-bold font-display">
                        {result.credits_needed.toLocaleString('en-IN')}
                        <span className="text-sm ml-2 font-normal text-muted-foreground">credits</span>
                      </p>
                    </div>
                    <div className="p-4 rounded-lg glass">
                      <p className="text-xs text-muted-foreground mb-1">Estimated Cost</p>
                      <p className="text-2xl font-bold font-display flex items-center">
                        <IndianRupee className="w-5 h-5" />
                        {result.cost_estimate.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Breakdown */}
                  {result.breakdown && result.breakdown.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold mb-3">Emission Breakdown</h3>
                      <div className="space-y-2">
                        {result.breakdown.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg glass"
                          >
                            <span className="text-sm">{item.source}</span>
                            <Badge variant="outline" className="font-mono">
                              {item.emissions.toLocaleString('en-IN', { maximumFractionDigits: 2 })} tCO₂e
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
                    <Button
                      onClick={handleFindSellers}
                      variant="gradient"
                      className="flex-1"
                    >
                      Find Matched Sellers
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="flex-1"
                    >
                      New Calculation
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="p-6" hover={false}>
              <h3 className="font-semibold font-display mb-4 flex items-center">
                <CalculatorIcon className="w-4 h-4 text-swachh-marigold-500 mr-2" />
                About Calculator
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your operational data to calculate your carbon emissions. 
                The calculator uses standard emission factors for each sector.
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Available for all 9 CCTS sectors</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Calculates Scope 1, 2, and 3 emissions</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Provides credit requirements</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Cost estimates included</span>
                </div>
              </div>
            </GlassCard>

            {/* Info Card */}
            <GlassCard className="p-6" glow="orange">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-swachh-marigold-500/10 flex items-center justify-center mb-3">
                  <TrendingUp className="w-6 h-6 text-swachh-marigold-500" />
                </div>
                <h4 className="font-semibold mb-2">Emission Factors</h4>
                <p className="text-xs text-muted-foreground">
                  Calculations use standard emission factors for each sector based on CCTS regulations.
                </p>
              </div>
            </GlassCard>

            {/* Instructions */}
            {!selectedSector && (
              <GlassCard className="p-6" glow="green">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-swachh-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-2">Getting Started</h4>
                    <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                      <li>Select your industry sector</li>
                      <li>Fill in the operational data</li>
                      <li>Click "Calculate Emissions"</li>
                      <li>View results and find sellers</li>
                    </ol>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
