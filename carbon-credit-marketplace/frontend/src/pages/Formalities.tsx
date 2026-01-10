import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  Circle, 
  ChevronRight, 
  Building2, 
  Factory, 
  ClipboardCheck,
  FileSearch,
  AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import { formalitiesAPI } from '../api/client';
import { WorkflowStep } from '../types';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '../context/ToastContext';
import { staggerContainer, staggerItem } from '../utils/animations';

const workflows = [
  { 
    value: 'buyer_registration', 
    label: 'Buyer Registration',
    icon: Building2,
    description: 'Steps to register as a carbon credit buyer',
    color: 'text-swachh-green-500',
    gradient: 'from-swachh-green-500/20 to-swachh-green-600/20'
  },
  { 
    value: 'seller_registration', 
    label: 'Seller Registration',
    icon: Factory,
    description: 'Steps to register as a carbon credit seller',
    color: 'text-swachh-marigold-500',
    gradient: 'from-swachh-marigold-500/20 to-swachh-marigold-600/20'
  },
  { 
    value: 'mrv_compliance', 
    label: 'MRV Compliance',
    icon: ClipboardCheck,
    description: 'Monitoring, Reporting, and Verification process',
    color: 'text-swachh-saffron',
    gradient: 'from-swachh-saffron/20 to-swachh-marigold-500/20'
  },
];

export default function Formalities() {
  const [workflowType, setWorkflowType] = useState<string>('buyer_registration');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadWorkflow();
  }, [workflowType]);

  const loadWorkflow = async () => {
    setLoading(true);
    setExpandedStep(null);
    try {
      const response = await formalitiesAPI.getSteps(workflowType);
      setSteps(response.data.steps || []);
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to load workflow. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedWorkflow = workflows.find(w => w.value === workflowType);

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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-swachh-green-600 to-swachh-green-700 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">
                Formalities <GradientText>Advisor</GradientText>
              </h1>
              <p className="text-muted-foreground">Navigate government procedures and compliance</p>
            </div>
          </div>
        </motion.div>

        {/* Workflow Selector */}
        <GlassCard className="p-6 mb-8" hover={false}>
          <h2 className="text-lg font-semibold font-display mb-4">Select Workflow Type</h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {workflows.map((wf) => (
              <motion.button
                key={wf.value}
                onClick={() => setWorkflowType(wf.value)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all text-left",
                  workflowType === wf.value
                    ? "border-swachh-green-500 bg-swachh-green-500/10"
                    : "border-border hover:border-swachh-green-500/50 hover:bg-muted/50"
                )}
                variants={staggerItem}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3",
                  wf.gradient
                )}>
                  <wf.icon className={cn("w-5 h-5", wf.color)} />
                </div>
                <div className="font-semibold mb-1">{wf.label}</div>
                <div className="text-xs text-muted-foreground">{wf.description}</div>
                {workflowType === wf.value && (
                  <motion.div
                    layoutId="workflow-indicator"
                    className="absolute top-2 right-2 w-2 h-2 rounded-full bg-swachh-green-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        </GlassCard>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <GlassCard key={i} className="p-6" hover={false}>
                <div className="flex items-start space-x-4">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Steps */}
        {!loading && (
          <motion.div 
            className="space-y-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence>
              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  variants={staggerItem}
                  layout
                >
                  <GlassCard 
                    className="overflow-hidden" 
                    hover={false}
                    glow={index === 0 ? 'green' : 'none'}
                  >
                    <button
                      onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                      className="w-full p-6 text-left"
                    >
                      <div className="flex items-start">
                        {/* Step Number */}
                        <div className="flex-shrink-0 mr-4">
                          <motion.div 
                            className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                              index === 0 
                                ? "bg-gradient-to-br from-swachh-green-500 to-swachh-green-600"
                                : "bg-gradient-to-br from-swachh-marigold-500 to-swachh-saffron"
                            )}
                            whileHover={{ scale: 1.1 }}
                          >
                            {step.step}
                          </motion.div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold font-display pr-4">{step.title}</h3>
                            <motion.div
                              animate={{ rotate: expandedStep === step.step ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </motion.div>
                          </div>
                          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                            {step.description}
                          </p>
                          
                          {/* Document Count Badge */}
                          {step.documents.length > 0 && (
                            <Badge variant="outline" className="mt-2">
                              <FileSearch className="w-3 h-3 mr-1" />
                              {step.documents.length} document{step.documents.length > 1 ? 's' : ''} required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedStep === step.step && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-2 border-t border-border/50 ml-14">
                            {/* Full Description */}
                            <p className="text-muted-foreground mb-4">{step.description}</p>
                            
                            {/* Required Documents */}
                            {step.documents.length > 0 && (
                              <div className="glass rounded-lg p-4">
                                <h4 className="font-semibold text-sm mb-3 flex items-center">
                                  <FileText className="w-4 h-4 mr-2 text-swachh-green-500" />
                                  Required Documents
                                </h4>
                                <ul className="space-y-2">
                                  {step.documents.map((doc, docIndex) => (
                                    <motion.li
                                      key={docIndex}
                                      className="flex items-start space-x-2 text-sm"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: docIndex * 0.05 }}
                                    >
                                      <Circle className="w-2 h-2 mt-1.5 text-swachh-marigold-500 flex-shrink-0" />
                                      <span className="text-muted-foreground">{doc}</span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Progress Indicator */}
                            <div className="mt-4 flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Step {step.step} of {steps.length}
                              </span>
                              <div className="flex items-center space-x-1">
                                {[...Array(steps.length)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "w-2 h-2 rounded-full transition-colors",
                                      i < step.step
                                        ? "bg-swachh-green-500"
                                        : i === step.step - 1
                                        ? "bg-swachh-marigold-500"
                                        : "bg-muted"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && steps.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Steps Available</h3>
            <p className="text-muted-foreground">
              Could not load workflow steps. Please try again.
            </p>
          </motion.div>
        )}

        {/* Swachh Bharat Footer */}
        <motion.div 
          className="flex items-center justify-center mt-12 space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-sm text-muted-foreground">Compliant with</span>
          <div className="flex space-x-1">
            <div className="w-4 h-4 rounded-full bg-swachh-saffron" />
            <div className="w-4 h-4 rounded-full bg-white border border-border" />
            <div className="w-4 h-4 rounded-full bg-swachh-green-500" />
          </div>
          <span className="text-sm text-muted-foreground">Indian Regulations</span>
        </motion.div>
      </div>
    </Layout>
  );
}
