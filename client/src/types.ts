export interface Transaction {
  id: string;
  vendor: string;
  date: string; // YYYY-MM-DD
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

// FI Dashboard Merged Types
export type InstitutionType = 'Commercial Bank' | 'MFI' | 'SACCO' | 'Investor';
export type FundingRequestStatus = 'New Request' | 'Under Review' | 'Approved' | 'Funded' | 'Closed';
export type InvestmentStatus = 'Active' | 'Paid' | 'Defaulted';
export type FITransactionType = 'Income' | 'Expense';
export type ScannedStatus = 'Pending' | 'Completed';

export interface Institution {
  id: string;
  name: string;
  licenseNumber: string;
  type: InstitutionType;
  riskAppetite: RiskLevel;
}

export interface MonthOverMonthScore {
  month: string;
  score: number;
}

export interface SME {
  id: string;
  businessName: string;
  sector: string;
  ownerName: string;
  email: string;
  phone: string;
  joinedDate: string; // ISO string or format
  trustScore: number;
  riskLevel: RiskLevel;
  monthlyRevenue: number; // in ETB
  monthlyExpenses: number; // in ETB
  profit: number; // in ETB
  monthsActive: number;
  transactionCount: number;
  location: string;
  historyScores: MonthOverMonthScore[];
}

export interface FundingRequest {
  id: string;
  smeId: string;
  smeBusinessName: string;
  amount: number; // in ETB
  purpose: string;
  institutionType: InstitutionType; // Target institution type
  status: FundingRequestStatus;
  submittedDate: string;
  selectedInstitutionId?: string;
}

export interface FundingProduct {
  id: string;
  institutionId: string;
  institutionName: string;
  productName: string;
  minAmount: number; // in ETB
  maxAmount: number; // in ETB
  interestRate: number; // percentage
  tenureMonths: number;
}

export interface Investment {
  id: string;
  smeId: string;
  institutionId: string;
  smeBusinessName: string;
  institutionName: string;
  amount: number; // in ETB
  interestRate: number;
  status: InvestmentStatus;
  startDate: string;
  dueDate: string;
}

export interface FITransaction {
  id: string;
  smeId: string;
  date: string;
  type: FITransactionType;
  category: string;
  amount: number; // in ETB
  description: string;
  scannedStatus: ScannedStatus;
}
