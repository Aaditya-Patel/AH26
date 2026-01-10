export interface User {
  id: string;
  email: string;
  user_type: 'buyer' | 'seller';
  company_name: string;
  sector?: string;
  gci_registration_id?: string;
  is_kyc_verified?: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  seller_name: string;
  quantity: number;
  available_quantity: number;
  price_per_credit: number;
  vintage: number;
  project_type: string;
  verification_status: string;
  is_active: boolean;
  description?: string;
  methodology?: string;
  project_location?: string;
  serial_number_start?: string;
  serial_number_end?: string;
  co_benefits?: string[];
  additionality_score?: number;
  permanence_score?: number;
  created_at: string;
}

export interface CalculationResult {
  sector: string;
  total_emissions: number;
  scope1_emissions: number;
  scope2_emissions: number;
  scope3_emissions: number;
  credits_needed: number;
  cost_estimate: number;
  breakdown: Array<{ source: string; emissions: number }>;
}

export interface SellerMatch {
  seller_id: string;
  seller_name: string;
  listing_id: string;
  quantity: number;
  available_credits?: number;
  price_per_credit: number;
  vintage: number;
  project_type: string;
  match_score: number;
  reasons: string[];
  match_reasons?: string[];
  verification_status: string;
}

export interface WorkflowStep {
  step: number;
  title: string;
  description: string;
  documents: string[];
}

// Transaction types
export interface Order {
  id: string;
  user_id: string;
  listing_id?: string;
  order_type: 'buy' | 'sell';
  quantity: number;
  filled_quantity: number;
  price_per_credit: number;
  status: 'pending' | 'partially_filled' | 'filled' | 'cancelled' | 'expired';
  expires_at?: string;
  created_at: string;
  updated_at?: string;
  listing?: Listing;
  total_amount: number;
}

export interface Transaction {
  id: string;
  transaction_number: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  order_id?: string;
  quantity: number;
  price_per_credit: number;
  total_amount: number;
  platform_fee: number;
  gst_amount: number;
  status: TransactionStatus;
  transaction_date: string;
  payment_completed_at?: string;
  credits_transferred_at?: string;
  completed_at?: string;
  created_at: string;
  buyer_name?: string;
  seller_name?: string;
  listing?: Listing;
  payment?: Payment;
}

export type TransactionStatus = 
  | 'pending'
  | 'payment_pending'
  | 'payment_completed'
  | 'credits_transferred'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export interface TransactionSummary {
  total_transactions: number;
  total_volume: number;
  total_value: number;
  completed_transactions: number;
  pending_transactions: number;
}

export interface Payment {
  id: string;
  transaction_id: string;
  payment_gateway?: string;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  escrow_status: 'not_started' | 'in_escrow' | 'released' | 'refunded';
  escrow_released_at?: string;
  refund_amount?: number;
  refunded_at?: string;
  created_at: string;
}

// Credit Registry types
export interface CreditAccount {
  id: string;
  user_id: string;
  total_balance: number;
  available_balance: number;
  locked_balance: number;
  retired_balance: number;
  created_at: string;
  updated_at?: string;
}

export interface CreditTransaction {
  id: string;
  account_id: string;
  transaction_type: 'issuance' | 'purchase' | 'sale' | 'transfer' | 'retirement' | 'surrender';
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_type?: string;
  reference_id?: string;
  description?: string;
  created_at: string;
}

export interface CreditRetirement {
  id: string;
  user_id: string;
  retirement_number: string;
  amount: number;
  purpose: 'compliance' | 'voluntary' | 'surrender';
  compliance_period?: string;
  beneficiary?: string;
  certificate_url?: string;
  status: string;
  retired_at?: string;
  created_at: string;
}

export interface CreditIssuance {
  id: string;
  user_id: string;
  project_id?: string;
  issuance_number?: string;
  issuer: string;
  amount: number;
  vintage?: number;
  project_type?: string;
  methodology?: string;
  status: string;
  issuance_date?: string;
  expiry_date?: string;
  created_at: string;
}

// Market data types
export interface MarketOverview {
  current_avg_price: number;
  price_change_24h: number;
  price_change_percent: number;
  total_volume_24h: number;
  total_value_24h: number;
  num_transactions_24h: number;
  active_listings: number;
  total_credits_available: number;
  price_by_project_type: Record<string, number>;
  price_by_vintage: Record<number, number>;
}

export interface PriceHistory {
  id: string;
  date: string;
  project_type?: string;
  vintage?: number;
  open_price?: number;
  close_price?: number;
  high_price?: number;
  low_price?: number;
  average_price?: number;
  volume: number;
  num_transactions: number;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// Compliance types
export interface ComplianceRecord {
  id: string;
  user_id: string;
  compliance_period: string;
  sector: string;
  target_emission_intensity?: number;
  baseline_emission_intensity?: number;
  actual_emissions?: number;
  actual_production?: number;
  actual_emission_intensity?: number;
  credits_required: number;
  credits_earned: number;
  credits_surrendered: number;
  credits_shortfall: number;
  status: 'compliant' | 'non_compliant' | 'at_risk' | 'pending';
  deadline?: string;
  submitted_at?: string;
  verified_at?: string;
  penalty_amount: number;
  penalty_paid: boolean;
  created_at: string;
}
