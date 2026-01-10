import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Leaf, 
  ArrowUpRight, 
  ArrowDownRight, 
  Lock,
  Trash2,
  Send,
  RefreshCw,
  Plus,
  History,
  Award
} from 'lucide-react';
import Layout from '../components/Layout';
import { registryAPI } from '../api/client';
import { CreditAccount, CreditTransaction, CreditRetirement } from '../types';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { staggerContainer, staggerItem } from '../utils/animations';

const transactionTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
  issuance: { label: 'Issuance', icon: Plus, color: 'text-green-500' },
  purchase: { label: 'Purchase', icon: ArrowDownRight, color: 'text-blue-500' },
  sale: { label: 'Sale', icon: ArrowUpRight, color: 'text-orange-500' },
  transfer: { label: 'Transfer', icon: Send, color: 'text-purple-500' },
  retirement: { label: 'Retirement', icon: Trash2, color: 'text-red-500' },
  surrender: { label: 'Surrender', icon: Award, color: 'text-yellow-500' },
};

export default function Portfolio() {
  const [account, setAccount] = useState<CreditAccount | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [retirements, setRetirements] = useState<CreditRetirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showRetireDialog, setShowRetireDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { user } = useAuthStore();
  const { showToast } = useToast();

  // Form states
  const [transferForm, setTransferForm] = useState({
    recipient_email: '',
    amount: '',
    description: ''
  });
  const [retireForm, setRetireForm] = useState({
    amount: '',
    purpose: 'voluntary' as 'compliance' | 'voluntary' | 'surrender',
    compliance_period: '',
    beneficiary: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accountRes, transactionsRes, retirementsRes] = await Promise.all([
        registryAPI.getAccount(),
        registryAPI.getCreditTransactions({ limit: 50 }),
        registryAPI.getRetirements()
      ]);
      
      setAccount(accountRes.data);
      setTransactions(transactionsRes.data || []);
      setRetirements(retirementsRes.data || []);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferForm.recipient_email || !transferForm.amount) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    
    try {
      setProcessing(true);
      await registryAPI.transferCredits({
        recipient_email: transferForm.recipient_email,
        amount: parseFloat(transferForm.amount),
        description: transferForm.description || undefined
      });
      showToast('Credits transferred successfully!', 'success');
      setShowTransferDialog(false);
      setTransferForm({ recipient_email: '', amount: '', description: '' });
      await loadData();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to transfer credits', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleRetire = async () => {
    if (!retireForm.amount) {
      showToast('Please enter amount to retire', 'error');
      return;
    }
    
    try {
      setProcessing(true);
      await registryAPI.retireCredits({
        amount: parseFloat(retireForm.amount),
        purpose: retireForm.purpose,
        compliance_period: retireForm.compliance_period || undefined,
        beneficiary: retireForm.beneficiary || undefined
      });
      showToast('Credits retired successfully!', 'success');
      setShowRetireDialog(false);
      setRetireForm({ amount: '', purpose: 'voluntary', compliance_period: '', beneficiary: '' });
      await loadData();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to retire credits', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleIssueDemo = async () => {
    if (user?.user_type !== 'seller') {
      showToast('Only sellers can receive credit issuances', 'error');
      return;
    }
    
    try {
      setProcessing(true);
      await registryAPI.issueCredits(100, 'Renewable Energy', 2024);
      showToast('100 demo credits issued to your account!', 'success');
      await loadData();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to issue credits', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-swachh-green-500 to-swachh-green-600 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">
                Credit <GradientText>Portfolio</GradientText>
              </h1>
              <p className="text-muted-foreground">Manage your carbon credit holdings</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {user?.user_type === 'seller' && (
              <Button onClick={handleIssueDemo} variant="outline" disabled={processing}>
                <Plus className="w-4 h-4 mr-2" />
                Demo Issue
              </Button>
            )}
            <Button onClick={loadData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Balance Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <GlassCard key={i} className="p-6" hover={false}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </GlassCard>
            ))}
          </div>
        ) : account && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6" glow="green">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Total Balance</span>
                  <Wallet className="w-5 h-5 text-swachh-green-500" />
                </div>
                <p className="text-3xl font-bold text-swachh-green-500">{account.total_balance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">credits</p>
              </GlassCard>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6" glow="orange">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Available</span>
                  <Leaf className="w-5 h-5 text-swachh-marigold-500" />
                </div>
                <p className="text-3xl font-bold text-swachh-marigold-500">{account.available_balance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">for trading</p>
              </GlassCard>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Locked</span>
                  <Lock className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-3xl font-bold">{account.locked_balance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">in transactions</p>
              </GlassCard>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Retired</span>
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-red-500">{account.retired_balance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">permanently</p>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}

        {/* Action Buttons */}
        {account && account.available_balance > 0 && (
          <div className="flex gap-4 mb-8">
            <Button onClick={() => setShowTransferDialog(true)} variant="outline">
              <Send className="w-4 h-4 mr-2" />
              Transfer Credits
            </Button>
            <Button onClick={() => setShowRetireDialog(true)} variant="outline">
              <Trash2 className="w-4 h-4 mr-2" />
              Retire Credits
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Transaction History
            </TabsTrigger>
            <TabsTrigger value="retirements" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Retirements
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions">
            <GlassCard className="p-6" hover={false}>
              <h3 className="text-lg font-semibold mb-4">Credit Transactions</h3>
              
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-1">
                  {transactions.map((txn) => {
                    const config = transactionTypeConfig[txn.transaction_type] || transactionTypeConfig.transfer;
                    const Icon = config.icon;
                    const isPositive = txn.amount > 0;
                    
                    return (
                      <motion.div
                        key={txn.id}
                        className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${config.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{config.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {txn.description || formatDate(txn.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                            {isPositive ? '+' : ''}{txn.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Balance: {txn.balance_after.toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              )}
            </GlassCard>
          </TabsContent>
          
          <TabsContent value="retirements">
            <GlassCard className="p-6" hover={false}>
              <h3 className="text-lg font-semibold mb-4">Credit Retirements</h3>
              
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : retirements.length > 0 ? (
                <div className="space-y-4">
                  {retirements.map((ret) => (
                    <motion.div
                      key={ret.id}
                      className="p-4 rounded-lg bg-muted/50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{ret.retirement_number}</Badge>
                        <Badge className={ret.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {ret.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-bold">{ret.amount.toLocaleString()} credits</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Purpose</p>
                          <p className="font-medium capitalize">{ret.purpose}</p>
                        </div>
                        {ret.compliance_period && (
                          <div>
                            <p className="text-muted-foreground">Period</p>
                            <p className="font-medium">{ret.compliance_period}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{formatDate(ret.created_at)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No retirements yet</p>
                </div>
              )}
            </GlassCard>
          </TabsContent>
        </Tabs>

        {/* Transfer Dialog */}
        <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transfer Credits</DialogTitle>
              <DialogDescription>
                Send credits to another user's account
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Email *</Label>
                <Input
                  id="recipient"
                  type="email"
                  value={transferForm.recipient_email}
                  onChange={(e) => setTransferForm({ ...transferForm, recipient_email: e.target.value })}
                  placeholder="recipient@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={transferForm.amount}
                  onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  max={account?.available_balance}
                />
                <p className="text-xs text-muted-foreground">
                  Available: {account?.available_balance.toLocaleString()} credits
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={transferForm.description}
                  onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                  placeholder="Add a note"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowTransferDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="gradient" onClick={handleTransfer} disabled={processing} className="flex-1">
                  {processing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  {processing ? 'Processing...' : 'Transfer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Retire Dialog */}
        <Dialog open={showRetireDialog} onOpenChange={setShowRetireDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Retire Credits</DialogTitle>
              <DialogDescription>
                Permanently retire credits from circulation
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="retire-amount">Amount *</Label>
                <Input
                  id="retire-amount"
                  type="number"
                  value={retireForm.amount}
                  onChange={(e) => setRetireForm({ ...retireForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  max={account?.available_balance}
                />
                <p className="text-xs text-muted-foreground">
                  Available: {account?.available_balance.toLocaleString()} credits
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Purpose *</Label>
                <Select
                  value={retireForm.purpose}
                  onValueChange={(v) => setRetireForm({ ...retireForm, purpose: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="voluntary">Voluntary Offset</SelectItem>
                    <SelectItem value="compliance">Compliance</SelectItem>
                    <SelectItem value="surrender">Surrender</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {retireForm.purpose === 'compliance' && (
                <div className="space-y-2">
                  <Label htmlFor="period">Compliance Period</Label>
                  <Input
                    id="period"
                    value={retireForm.compliance_period}
                    onChange={(e) => setRetireForm({ ...retireForm, compliance_period: e.target.value })}
                    placeholder="e.g., 2025-26"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="beneficiary">Beneficiary (optional)</Label>
                <Input
                  id="beneficiary"
                  value={retireForm.beneficiary}
                  onChange={(e) => setRetireForm({ ...retireForm, beneficiary: e.target.value })}
                  placeholder="On behalf of..."
                />
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  ⚠️ Warning: Retired credits cannot be recovered. This action is permanent.
                </p>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowRetireDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleRetire} 
                  disabled={processing}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  {processing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  {processing ? 'Processing...' : 'Retire Credits'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
