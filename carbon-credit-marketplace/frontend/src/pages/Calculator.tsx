import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator as CalculatorIcon, 
  Factory, 
  ClipboardList, 
  TrendingUp, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Leaf,
  IndianRupee
} from 'lucide-react';
import Layout from '../components/Layout';
import { calculatorAPI } from '../api/client';
import { CalculationResult } from '../types';
import { QUESTIONNAIRES } from '../data/questionnaires';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem } from '../utils/animations';

const sectors = [
  { value: 'cement', label: 'Cement', icon: '🏭', description: 'Cement manufacturing' },
  { value: 'iron_steel', label: 'Iron & Steel', icon: '⚙️', description: 'Iron and steel production' },
  { value: 'textiles', label: 'Textiles', icon: '🧵', description: 'Textile manufacturing' },
];

const steps = [
  { id: 1, title: 'Select Sector', icon: Factory },
  { id: 2, title: 'Answer Questions', icon: ClipboardList },
  { id: 3, title: 'View Results', icon: TrendingUp },
];

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

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <motion.div
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-xl transition-all",
                    step >= s.id
                      ? "glass bg-swachh-green-500/10"
                      : "opacity-50"
                  )}
                  animate={{ scale: step === s.id ? 1.05 : 1 }}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      step > s.id
                        ? "bg-swachh-green-500 text-white"
                        : step === s.id
                        ? "bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                  </div>
                  <span className={cn(
                    "text-sm font-medium hidden sm:block",
                    step >= s.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {s.title}
                  </span>
                </motion.div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-8 md:w-16 h-1 mx-2 rounded-full transition-colors",
                    step > s.id ? "bg-swachh-green-500" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <GlassCard className="p-8" hover={false}>
          <AnimatePresence mode="wait">
            {/* Step 1: Select Sector */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold font-display mb-2">Select Your Industry Sector</h2>
                <p className="text-muted-foreground mb-6">Choose the sector that best describes your operations</p>
                
                <motion.div
                  className="space-y-4"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {sectors.map((s) => (
                    <motion.button
                      key={s.value}
                      type="button"
                      onClick={() => {
                        setSector(s.value);
                        reset();
                      }}
                      className={cn(
                        "w-full flex items-center p-4 rounded-xl border-2 transition-all text-left",
                        sector === s.value
                          ? "border-swachh-green-500 bg-swachh-green-500/10"
                          : "border-border hover:border-swachh-green-500/50 hover:bg-muted/50"
                      )}
                      variants={staggerItem}
                      whileHover={{ x: 4 }}
                    >
                      <span className="text-3xl mr-4">{s.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{s.label}</div>
                        <div className="text-sm text-muted-foreground">{s.description}</div>
                      </div>
                      {sector === s.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-swachh-green-500 flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </motion.div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!sector}
                  variant="gradient"
                  size="lg"
                  className="w-full mt-6"
                >
                  Continue
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Answer Questions */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <h2 className="text-2xl font-bold font-display mb-2">Provide Your Data</h2>
                <p className="text-muted-foreground mb-6">
                  Enter operational data for <Badge variant="secondary">{sectors.find(s => s.value === sector)?.label}</Badge>
                </p>
                
                <form onSubmit={handleSubmit(onSubmitQuestions)}>
                  <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {questions.map((q) => (
                      <motion.div key={q.id} variants={staggerItem} className="space-y-2">
                        <Label htmlFor={q.id} className="flex items-center space-x-2">
                          <span>{q.question}</span>
                          {q.unit && <Badge variant="outline" className="text-xs">{q.unit}</Badge>}
                        </Label>
                        
                        {q.type === 'number' ? (
                          <Input
                            {...register(q.id, { valueAsNumber: true })}
                            id={q.id}
                            type="number"
                            step="any"
                            placeholder={`Enter value ${q.unit ? `in ${q.unit}` : ''}`}
                            className={cn(
                              errors[q.id] && "border-destructive"
                            )}
                          />
                        ) : q.type === 'select' && q.options ? (
                          <Controller
                            name={q.id}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent>
                                  {q.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        ) : null}
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="flex gap-4 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      className="flex-1"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <motion.div
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                      ) : (
                        <>
                          Calculate
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3: Results */}
            {step === 3 && result && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="text-center mb-8">
                  <motion.div
                    className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 flex items-center justify-center mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <TrendingUp className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold font-display">Your Carbon Footprint</h2>
                  <p className="text-muted-foreground">Based on your operational data</p>
                </div>
                
                {/* Main Stats */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div variants={staggerItem}>
                    <GlassCard className="p-6 text-center" glow="orange">
                      <Leaf className="w-8 h-8 mx-auto mb-2 text-swachh-marigold-500" />
                      <p className="text-sm text-muted-foreground mb-1">Total Emissions</p>
                      <p className="text-3xl font-bold font-display">
                        <GradientText>{result.total_emissions.toFixed(2)}</GradientText>
                      </p>
                      <p className="text-sm text-muted-foreground">tCO2e</p>
                    </GlassCard>
                  </motion.div>
                  
                  <motion.div variants={staggerItem}>
                    <GlassCard className="p-6 text-center" glow="green">
                      <CalculatorIcon className="w-8 h-8 mx-auto mb-2 text-swachh-green-500" />
                      <p className="text-sm text-muted-foreground mb-1">Credits Needed</p>
                      <p className="text-3xl font-bold font-display">
                        <GradientText>{result.credits_needed}</GradientText>
                      </p>
                      <p className="text-sm text-muted-foreground">carbon credits</p>
                    </GlassCard>
                  </motion.div>
                </motion.div>

                {/* Emission Breakdown */}
                <div className="mb-6">
                  <h3 className="font-semibold font-display mb-4">Emission Breakdown by Scope</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Scope 1 (Direct)', value: result.scope1_emissions, color: 'bg-swachh-green-500' },
                      { label: 'Scope 2 (Electricity)', value: result.scope2_emissions, color: 'bg-swachh-marigold-500' },
                      { label: 'Scope 3 (Other Indirect)', value: result.scope3_emissions, color: 'bg-swachh-saffron' },
                    ].map((scope, index) => (
                      <motion.div
                        key={scope.label}
                        className="flex items-center justify-between p-4 glass rounded-xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={cn("w-3 h-3 rounded-full", scope.color)} />
                          <span>{scope.label}</span>
                        </div>
                        <span className="font-semibold">{scope.value.toFixed(2)} tCO2e</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Cost Estimate */}
                <GlassCard className="p-4 mb-6 bg-swachh-marigold-500/10 border-swachh-marigold-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <IndianRupee className="w-5 h-5 text-swachh-marigold-500" />
                      <span className="font-medium">Estimated Cost</span>
                    </div>
                    <span className="text-xl font-bold">₹{result.cost_estimate.toLocaleString()}</span>
                  </div>
                </GlassCard>

                {/* Source Breakdown */}
                {result.breakdown && result.breakdown.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-semibold font-display mb-4">Breakdown by Source</h3>
                    <div className="space-y-2">
                      {result.breakdown.map((item, index) => (
                        <div key={index} className="flex justify-between p-3 glass rounded-lg">
                          <span className="text-muted-foreground">{item.source}</span>
                          <span className="font-semibold">{item.emissions.toFixed(2)} tCO2e</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => navigate('/matching', { 
                      state: { creditsNeeded: result.credits_needed, costEstimate: result.cost_estimate } 
                    })}
                    variant="gradient"
                    size="lg"
                    className="flex-1"
                  >
                    Find Matched Sellers
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    New Calculation
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </Layout>
  );
}
