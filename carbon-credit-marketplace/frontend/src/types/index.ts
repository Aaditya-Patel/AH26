export interface User {
  id: string;
  email: string;
  user_type: 'buyer' | 'seller';
  company_name: string;
  sector?: string;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  seller_name: string;
  quantity: number;
  price_per_credit: number;
  vintage: number;
  project_type: string;
  verification_status: string;
  is_active: boolean;
  description?: string;
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
  price_per_credit: number;
  vintage: number;
  project_type: string;
  match_score: number;
  reasons: string[];
}

export interface WorkflowStep {
  step: number;
  title: string;
  description: string;
  documents: string[];
}
