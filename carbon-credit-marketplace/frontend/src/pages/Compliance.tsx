import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardCheck, 
  Plus, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Calendar,
  Target,
  TrendingDown,
  RefreshCw,
  Leaf,
  Info
} from 'lucide-react';
import Layout from '../components/Layout';
import { complianceAPI } from '../api/client';
import { ComplianceRecord } from '../types';
import { useAuthStore } from '../store/store';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { staggerContainer, staggerItem } from '../utils/animations';

interface ComplianceSummary {
  total_periods: number;
  compliant_periods: number;
  non_compliant_periods: number;
  at_risk_periods: number;
  total_credits_required: number;
  total_credits_surrendered: number;
  total_shortfall: number;
  total_penalties: number;
}

interface SectorTarget {
  baseline_intensity: number;
  target_intensity: number;
  target_reduction_percent: number;
  unit: string;
}

const statusConfig = {
  compliant: { label: 'Compliant', icon: CheckCircle, color: 'bg-green-500' },
  non_compliant: { label: 'Non-Compliant', icon: XCircle, color: 'bg-red-500' },
  at_risk: { label: 'At Risk', icon: AlertTriangle, color: 'bg-yellow-500' },
  pending: { label: 'Pending', icon: Calendar, color: 'bg-gray-500' },
};

export default function Compliance() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [sectorTargets, setSectorTargets] = useState<Record<string, SectorTarget>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ComplianceRecord | null>(null);
  const [processing, setProcessing] = useState(false);
  const { user } = useAuthStore();
  const { showToast } = useToast();

  // Form states
  const [createForm, setCreateForm] = useState({
    compliance_period: '',
    sector: '',
  });
  const [submitForm, setSubmitForm] = useState({
    actual_emissions: '',
    actual_production: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recordsRes, summaryRes, sectorsRes] = await Promise.all([
        complianceAPI.getRecords(),
        complianceAPI.getSummary(),
        complianceAPI.getSectorTargets()
      ]);
      
      setRecords(recordsRes.data || []);
      setSummary(summaryRes.data);
      setSectorTargets(sectorsRes.data);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async () => {
    if (!createForm.compliance_period || !createForm.sector) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      setProcessing(true);
      await complianceAPI.createRecord({
        compliance_period: createForm.compliance_period,
        sector: createForm.sector
      });
      showToast('Compliance record created successfully!', 'success');
      setShowCreateDialog(false);
      setCreateForm({ compliance_period: '', sector: '' });
      await loadData();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to create record', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitData = async () => {
    if (!selectedRecord || !submitForm.actual_emissions || !submitForm.actual_production) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      setProcessing(true);
      await complianceAPI.submitData(selectedRecord.id, {
        actual_emissions: parseFloat(submitForm.actual_emissions),
        actual_production: parseFloat(submitForm.actual_production)
      });
      showToast('Compliance data submitted successfully!', 'success');
      setShowSubmitDialog(false);
      setSelectedRecord(null);
      setSubmitForm({ actual_emissions: '', actual_production: '' });
      await loadData();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to submit data', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleSurrenderCredits = async (record: ComplianceRecord) => {
    const amount = prompt(`Enter credits to surrender (max: ${record.credits_shortfall}):`);
    if (!amount) return;

    try {
      await complianceAPI.surrenderCredits(record.id, parseInt(amount));
      showToast('Credits surrendered successfully!', 'success');
      await loadData();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to surrender credits', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-IN', { maximumFractionDigits: decimals });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-swachh-green-500 to-swachh-saffron flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">
                <GradientText>Compliance Tracking</GradientText>
              </h1>
              <p className="text-muted-foreground">Monitor emission targets and compliance status</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateDialog(true)} variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              New Period
            </Button>
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        {summary && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6" glow="green">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Compliant Periods</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-500">{summary.compliant_periods}</p>
                <p className="text-xs text-muted-foreground">of {summary.total_periods} total</p>
              </GlassCard>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Non-Compliant</span>
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-red-500">{summary.non_compliant_periods}</p>
                <p className="text-xs text-muted-foreground">{summary.at_risk_periods} at risk</p>
              </GlassCard>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6" glow="orange">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Credits Required</span>
                  <Target className="w-5 h-5 text-swachh-marigold-500" />
                </div>
                <p className="text-3xl font-bold">{formatNumber(summary.total_credits_required, 0)}</p>
                <p className="text-xs text-muted-foreground">{formatNumber(summary.total_credits_surrendered, 0)} surrendered</p>
              </GlassCard>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Outstanding Shortfall</span>
                  <TrendingDown className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-yellow-500">{formatNumber(summary.total_shortfall, 0)}</p>
                <p className="text-xs text-muted-foreground">credits needed</p>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}

        {/* Records List */}
        <GlassCard className="p-6" hover={false}>
          <h3 className="text-lg font-semibold mb-4">Compliance Records</h3>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : records.length > 0 ? (
            <motion.div 
              className="space-y-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {records.map((record) => (
                <motion.div
                  key={record.id}
                  variants={staggerItem}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-lg">{record.compliance_period}</span>
                        {getStatusBadge(record.status)}
                        <Badge variant="outline">{record.sector}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {record.target_emission_intensity && (
                          <div>
                            <p className="text-muted-foreground">Target Intensity</p>
                            <p className="font-medium">{formatNumber(record.target_emission_intensity)} tCO2e/unit</p>
                          </div>
                        )}
                        {record.actual_emission_intensity && (
                          <div>
                            <p className="text-muted-foreground">Actual Intensity</p>
                            <p className={`font-medium ${
                              record.actual_emission_intensity > (record.target_emission_intensity || 0)
                                ? 'text-red-500'
                                : 'text-green-500'
                            }`}>
                              {formatNumber(record.actual_emission_intensity)} tCO2e/unit
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Credits Required</p>
                          <p className="font-medium">{record.credits_required.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Shortfall</p>
                          <p className={`font-medium ${record.credits_shortfall > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {record.credits_shortfall.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {record.status === 'pending' && (
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowSubmitDialog(true);
                          }}
                        >
                          Submit Data
                        </Button>
                      )}
                      {record.credits_shortfall > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSurrenderCredits(record)}
                        >
                          <Leaf className="w-4 h-4 mr-1" />
                          Surrender Credits
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No compliance records yet</p>
              <Button 
                variant="gradient" 
                className="mt-4"
                onClick={() => setShowCreateDialog(true)}
              >
                Create First Record
              </Button>
            </div>
          )}
        </GlassCard>

        {/* Sector Targets Info */}
        {Object.keys(sectorTargets).length > 0 && (
          <GlassCard className="p-6 mt-6" hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-swachh-green-500" />
              <h3 className="text-lg font-semibold">Sector Emission Targets (CCTS)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(sectorTargets).map(([sector, target]) => (
                <div key={sector} className="p-3 rounded-lg bg-muted/30">
                  <p className="font-medium capitalize">{sector.replace('_', ' ')}</p>
                  <p className="text-sm text-muted-foreground">
                    Target: {formatNumber(target.target_intensity)} tCO2e/{target.unit}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({target.target_reduction_percent}% reduction from baseline)
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Create Record Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Compliance Record</DialogTitle>
              <DialogDescription>
                Set up tracking for a new compliance period
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Compliance Period *</Label>
                <Input
                  value={createForm.compliance_period}
                  onChange={(e) => setCreateForm({ ...createForm, compliance_period: e.target.value })}
                  placeholder="e.g., 2025-26"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Sector *</Label>
                <Select
                  value={createForm.sector}
                  onValueChange={(v) => setCreateForm({ ...createForm, sector: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(sectorTargets).map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="gradient" onClick={handleCreateRecord} disabled={processing} className="flex-1">
                  {processing ? 'Creating...' : 'Create Record'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Submit Data Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Compliance Data</DialogTitle>
              <DialogDescription>
                {selectedRecord?.compliance_period} - {selectedRecord?.sector}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Actual Emissions (tCO2e) *</Label>
                <Input
                  type="number"
                  value={submitForm.actual_emissions}
                  onChange={(e) => setSubmitForm({ ...submitForm, actual_emissions: e.target.value })}
                  placeholder="Total emissions for the period"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Actual Production (units) *</Label>
                <Input
                  type="number"
                  value={submitForm.actual_production}
                  onChange={(e) => setSubmitForm({ ...submitForm, actual_production: e.target.value })}
                  placeholder="Total production for the period"
                />
              </div>
              
              {submitForm.actual_emissions && submitForm.actual_production && selectedRecord?.target_emission_intensity && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Calculated Emission Intensity</p>
                  <p className="text-xl font-bold">
                    {formatNumber(parseFloat(submitForm.actual_emissions) / parseFloat(submitForm.actual_production))} tCO2e/unit
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {formatNumber(selectedRecord.target_emission_intensity)} tCO2e/unit
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="gradient" onClick={handleSubmitData} disabled={processing} className="flex-1">
                  {processing ? 'Submitting...' : 'Submit Data'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
