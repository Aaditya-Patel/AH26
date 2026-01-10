import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  IndianRupee,
  Leaf,
  Eye,
  CreditCard,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import Layout from '../components/Layout';
import { transactionsAPI, paymentsAPI } from '../api/client';
import { Transaction, TransactionSummary } from '../types';
import { useAuthStore } from '../store/store';
import { useToast } from '../context/ToastContext';
import { GlassCard } from '@/components/GlassCard';
import { GradientText } from '@/components/GradientText';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  payment_pending: { label: 'Payment Pending', color: 'bg-orange-500', icon: CreditCard },
  payment_completed: { label: 'Payment Completed', color: 'bg-blue-500', icon: CheckCircle },
  credits_transferred: { label: 'Credits Transferred', color: 'bg-purple-500', icon: ArrowLeftRight },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-500', icon: XCircle },
  refunded: { label: 'Refunded', color: 'bg-gray-500', icon: RefreshCw },
  cancelled: { label: 'Cancelled', color: 'bg-gray-400', icon: XCircle },
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { user } = useAuthStore();
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, [filter, roleFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== 'all') params.status = filter;
      if (roleFilter !== 'all') params.role = roleFilter;
      
      const [transactionsRes, summaryRes] = await Promise.all([
        transactionsAPI.getTransactions(params),
        transactionsAPI.getTransactionSummary()
      ]);
      
      setTransactions(transactionsRes.data || []);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      showToast('Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayment = async (transactionId: string) => {
    try {
      setProcessingPayment(true);
      await paymentsAPI.simulateComplete(transactionId);
      showToast('Payment completed successfully! Credits have been transferred.', 'success');
      setSelectedTransaction(null);
      await loadData();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to complete payment', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelTransaction = async (transactionId: string) => {
    try {
      await transactionsAPI.cancelTransaction(transactionId);
      showToast('Transaction cancelled successfully', 'success');
      setSelectedTransaction(null);
      await loadData();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to cancel transaction', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const isUserBuyer = (txn: Transaction) => {
    return txn.buyer_id === user?.id;
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-swachh-green-500 to-swachh-marigold-500 flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">
                <GradientText>Transactions</GradientText>
              </h1>
              <p className="text-muted-foreground">Track your carbon credit trades</p>
            </div>
          </div>
          
          <Button onClick={loadData} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
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
                  <span className="text-muted-foreground text-sm">Total Transactions</span>
                  <ArrowLeftRight className="w-5 h-5 text-swachh-green-500" />
                </div>
                <p className="text-3xl font-bold">{summary.total_transactions}</p>
              </GlassCard>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6" glow="orange">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Total Volume</span>
                  <Leaf className="w-5 h-5 text-swachh-marigold-500" />
                </div>
                <p className="text-3xl font-bold">{summary.total_volume.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">credits</p>
              </GlassCard>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6" glow="saffron">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Total Value</span>
                  <IndianRupee className="w-5 h-5 text-swachh-saffron" />
                </div>
                <p className="text-3xl font-bold">{formatCurrency(summary.total_value)}</p>
              </GlassCard>
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Completed</span>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-500">{summary.completed_transactions}</p>
                <p className="text-xs text-muted-foreground">{summary.pending_transactions} pending</p>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}

        {/* Filters */}
        <GlassCard className="p-4 mb-6" hover={false}>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="payment_pending">Payment Pending</SelectItem>
                  <SelectItem value="payment_completed">Payment Completed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="buyer">As Buyer</SelectItem>
                  <SelectItem value="seller">As Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <GlassCard key={i} className="p-6" hover={false}>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-48" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Transactions List */}
        {!loading && (
          <AnimatePresence mode="wait">
            {transactions.length > 0 ? (
              <motion.div 
                className="space-y-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {transactions.map((txn) => (
                  <motion.div key={txn.id} variants={staggerItem}>
                    <GlassCard className="p-6" hover>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-mono text-muted-foreground">
                              {txn.transaction_number}
                            </span>
                            {getStatusBadge(txn.status)}
                            <Badge variant={isUserBuyer(txn) ? 'default' : 'secondary'}>
                              {isUserBuyer(txn) ? (
                                <><TrendingDown className="w-3 h-3 mr-1" /> Bought</>
                              ) : (
                                <><TrendingUp className="w-3 h-3 mr-1" /> Sold</>
                              )}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Quantity: </span>
                              <span className="font-medium">{txn.quantity} credits</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Price: </span>
                              <span className="font-medium">{formatCurrency(txn.price_per_credit)}/credit</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total: </span>
                              <span className="font-bold text-swachh-green-500">{formatCurrency(txn.total_amount)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                {isUserBuyer(txn) ? 'Seller: ' : 'Buyer: '}
                              </span>
                              <span className="font-medium">
                                {isUserBuyer(txn) ? txn.seller_name : txn.buyer_name}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(txn.transaction_date)}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTransaction(txn)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                          
                          {txn.status === 'payment_pending' && isUserBuyer(txn) && (
                            <Button
                              variant="gradient"
                              size="sm"
                              onClick={() => setSelectedTransaction(txn)}
                            >
                              <CreditCard className="w-4 h-4 mr-1" />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <ArrowLeftRight className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Transactions Found</h3>
                <p className="text-muted-foreground">
                  {filter !== 'all' || roleFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Your transactions will appear here'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Transaction Detail Dialog */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                {selectedTransaction?.transaction_number}
              </DialogDescription>
            </DialogHeader>
            
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">{selectedTransaction.quantity} credits</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price/Credit</p>
                    <p className="font-medium">{formatCurrency(selectedTransaction.price_per_credit)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="font-medium">{formatCurrency(selectedTransaction.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Platform Fee</p>
                    <p className="font-medium">{formatCurrency(selectedTransaction.platform_fee)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">GST (18%)</p>
                    <p className="font-medium">{formatCurrency(selectedTransaction.gst_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grand Total</p>
                    <p className="font-bold text-swachh-green-500">
                      {formatCurrency(selectedTransaction.total_amount + selectedTransaction.platform_fee + selectedTransaction.gst_amount)}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Buyer</span>
                    <span>{selectedTransaction.buyer_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seller</span>
                    <span>{selectedTransaction.seller_name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span>{formatDate(selectedTransaction.transaction_date)}</span>
                  </div>
                  {selectedTransaction.completed_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Completed</span>
                      <span>{formatDate(selectedTransaction.completed_at)}</span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  {selectedTransaction.status === 'payment_pending' && isUserBuyer(selectedTransaction) && (
                    <>
                      <Button
                        variant="gradient"
                        className="flex-1"
                        onClick={() => handleCompletePayment(selectedTransaction.id)}
                        disabled={processingPayment}
                      >
                        {processingPayment ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4 mr-2" />
                        )}
                        {processingPayment ? 'Processing...' : 'Complete Payment'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleCancelTransaction(selectedTransaction.id)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  
                  {selectedTransaction.status === 'completed' && (
                    <div className="flex items-center gap-2 text-green-500 w-full justify-center">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Transaction Completed</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
