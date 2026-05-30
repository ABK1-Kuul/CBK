export interface Transaction {
  id: string;
  vendor: string;
  date: string;
  amount: number;
  tax?: number;
  type: 'income' | 'expense';
  category: string;
  status: 'pending' | 'posted';
  receiptUrl?: string;
}

export interface BusinessProfile {
  businessName: string;
  industryType: string;
  monthlyRevenueEstimate: number;
  joinedDate: string; // YYYY-MM-DD
  email: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ExtractedData {
  vendor: string;
  date: string;
  amount: number;
  tax: number;
  category: string;
  type: 'income' | 'expense';
}
