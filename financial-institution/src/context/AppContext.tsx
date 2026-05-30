import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SME,
  FundingRequest,
  Institution,
  FundingProduct,
  Investment,
  Transaction,
  FundingRequestStatus,
  InstitutionType,
  RiskLevel
} from '../types';

interface AppContextProps {
  smes: SME[];
  fundingRequests: FundingRequest[];
  institutions: Institution[];
  fundingProducts: FundingProduct[];
  investments: Investment[];
  transactions: Transaction[];
  currentSME: SME | null;
  currentInstitution: Institution | null;
  viewMode: 'sme' | 'fi';
  setViewMode: (mode: 'sme' | 'fi') => void;
  registerInstitution: (inst: Omit<Institution, 'id'>) => void;
  addFundingRequest: (amount: number, purpose: string, targetType: InstitutionType) => void;
  updateFundingRequestStatus: (requestId: string, status: FundingRequestStatus) => void;
  addSMETransaction: (type: 'Income' | 'Expense', category: string, amount: number, desc: string) => Promise<void>;
  setCurrentSME: (sme: SME) => void;
  isScanning: boolean;
  scanType: 'Income' | 'Expense' | null;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// MoM Score tracking helper
const generateMoMHistory = (baseScore: number) => {
  return [
    { month: 'Dec 25', score: Math.max(300, Math.min(850, baseScore - 40)) },
    { month: 'Jan 26', score: Math.max(300, Math.min(850, baseScore - 25)) },
    { month: 'Feb 26', score: Math.max(300, Math.min(850, baseScore - 10)) },
    { month: 'Mar 26', score: Math.max(300, Math.min(850, baseScore - 5)) },
    { month: 'Apr 26', score: Math.max(300, Math.min(850, baseScore)) },
    { month: 'May 26', score: Math.max(300, Math.min(850, baseScore + 10)) },
  ];
};

const initialSMEs: SME[] = [
  {
    id: 'sme-1',
    businessName: 'Abebe Coffee Trading',
    sector: 'Agricultural Export',
    ownerName: 'Abebe Kebede',
    email: 'abebe.trading@gmail.com',
    phone: '+251 911 234 567',
    joinedDate: '2024-11-15',
    trustScore: 785,
    riskLevel: 'Low',
    monthlyRevenue: 850000,
    monthlyExpenses: 620000,
    profit: 230000,
    monthsActive: 18,
    transactionCount: 450,
    location: 'Addis Ababa',
    historyScores: generateMoMHistory(785)
  },
  {
    id: 'sme-2',
    businessName: 'Hana Textile Retail',
    sector: 'Apparel & Fashion',
    ownerName: 'Hana Tesfaye',
    email: 'hana.textiles@outlook.com',
    phone: '+251 922 456 789',
    joinedDate: '2025-05-10',
    trustScore: 610,
    riskLevel: 'Medium',
    monthlyRevenue: 340000,
    monthlyExpenses: 285000,
    profit: 55000,
    monthsActive: 12,
    transactionCount: 210,
    location: 'Hawassa',
    historyScores: generateMoMHistory(610)
  },
  {
    id: 'sme-3',
    businessName: 'Kassa Agro Inputs',
    sector: 'Agribusiness',
    ownerName: 'Kassa Belay',
    email: 'kassa.agro@gmail.com',
    phone: '+251 933 789 012',
    joinedDate: '2025-11-20',
    trustScore: 455,
    riskLevel: 'High',
    monthlyRevenue: 180000,
    monthlyExpenses: 172000,
    profit: 8000,
    monthsActive: 6,
    transactionCount: 95,
    location: 'Bahir Dar',
    historyScores: generateMoMHistory(455)
  },
  {
    id: 'sme-4',
    businessName: 'Chala Tech Repairs',
    sector: 'Electronics & Repair',
    ownerName: 'Chala Gemechu',
    email: 'chala.repairs@gmail.com',
    phone: '+251 944 890 123',
    joinedDate: '2025-03-01',
    trustScore: 715,
    riskLevel: 'Low',
    monthlyRevenue: 520000,
    monthlyExpenses: 410000,
    profit: 110000,
    monthsActive: 14,
    transactionCount: 320,
    location: 'Adama',
    historyScores: generateMoMHistory(715)
  },
  {
    id: 'sme-5',
    businessName: 'Selam Organic Bakery',
    sector: 'Food & Beverage',
    ownerName: 'Selamawit Alene',
    email: 'selam.bakery@gmail.com',
    phone: '+251 911 990 887',
    joinedDate: '2025-04-18',
    trustScore: 675,
    riskLevel: 'Medium',
    monthlyRevenue: 290000,
    monthlyExpenses: 215000,
    profit: 75000,
    monthsActive: 13,
    transactionCount: 280,
    location: 'Addis Ababa',
    historyScores: generateMoMHistory(675)
  }
];

const initialFundingRequests: FundingRequest[] = [
  {
    id: 'req-1',
    smeId: 'sme-1',
    smeBusinessName: 'Abebe Coffee Trading',
    amount: 1500000,
    purpose: 'Inventory Financing (Pre-export purchasing)',
    institutionType: 'Commercial Bank',
    status: 'Approved',
    submittedDate: '2026-05-10'
  },
  {
    id: 'req-2',
    smeId: 'sme-2',
    smeBusinessName: 'Hana Textile Retail',
    amount: 350000,
    purpose: 'Working Capital (Importing seasonal materials)',
    institutionType: 'MFI',
    status: 'Under Review',
    submittedDate: '2026-05-20'
  },
  {
    id: 'req-3',
    smeId: 'sme-4',
    smeBusinessName: 'Chala Tech Repairs',
    amount: 500000,
    purpose: 'Equipment Financing (High-end micro-soldering stations)',
    institutionType: 'Investor',
    status: 'New Request',
    submittedDate: '2026-05-28'
  }
];

const initialProducts: FundingProduct[] = [
  {
    id: 'prod-1',
    institutionId: 'inst-cbe',
    institutionName: 'Commercial Bank of Ethiopia',
    productName: 'SME Agro-Export Credit Line',
    minAmount: 1000000,
    maxAmount: 10000000,
    interestRate: 11.5,
    tenureMonths: 24
  },
  {
    id: 'prod-2',
    institutionId: 'inst-cbe',
    institutionName: 'Commercial Bank of Ethiopia',
    productName: 'SME Machinery Term Loan',
    minAmount: 500000,
    maxAmount: 5000000,
    interestRate: 12.0,
    tenureMonths: 36
  },
  {
    id: 'prod-3',
    institutionId: 'inst-mfi',
    institutionName: 'Nisir Microfinance',
    productName: 'Retail Working Capital Booster',
    minAmount: 100000,
    maxAmount: 800000,
    interestRate: 14.5,
    tenureMonths: 12
  }
];

const initialInvestments: Investment[] = [
  {
    id: 'inv-1',
    smeId: 'sme-1',
    institutionId: 'inst-cbe',
    smeBusinessName: 'Abebe Coffee Trading',
    institutionName: 'Commercial Bank of Ethiopia',
    amount: 2500000,
    interestRate: 11.5,
    status: 'Active',
    startDate: '2025-10-10',
    dueDate: '2027-10-10'
  },
  {
    id: 'inv-2',
    smeId: 'sme-5',
    institutionId: 'inst-mfi',
    smeBusinessName: 'Selam Organic Bakery',
    institutionName: 'Nisir Microfinance',
    amount: 150000,
    interestRate: 14.0,
    status: 'Active',
    startDate: '2026-02-15',
    dueDate: '2027-02-15'
  }
];

const initialTransactions: Transaction[] = [
  {
    id: 't-1',
    smeId: 'sme-1',
    date: '2026-05-25',
    type: 'Income',
    category: 'Coffee Beans Sale',
    amount: 120000,
    description: 'Bulk shipment export to German buyer',
    scannedStatus: 'Completed'
  },
  {
    id: 't-2',
    smeId: 'sme-1',
    date: '2026-05-26',
    type: 'Expense',
    category: 'Logistics',
    amount: 32000,
    description: 'Truck transport Addis Ababa to Djibouti port',
    scannedStatus: 'Completed'
  }
];

export const MockStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [smes, setSmes] = useState<SME[]>(initialSMEs);
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>(initialFundingRequests);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [fundingProducts] = useState<FundingProduct[]>(initialProducts);
  const [investments, setInvestments] = useState<Investment[]>(initialInvestments);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const [currentSME, setCurrentSMEState] = useState<SME | null>(initialSMEs[0]);
  const [currentInstitution, setCurrentInstitution] = useState<Institution | null>(null);
  const [viewMode, setViewMode] = useState<'sme' | 'fi'>('sme');

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanType, setScanType] = useState<'Income' | 'Expense' | null>(null);

  // Set default current institution on first load just in case to help view pages even before wizard completes
  useEffect(() => {
    // We let them register but pre-load a default one if they go FI view so they aren't forced to onboard immediately, or they can reset it.
    const defaultInst: Institution = {
      id: 'inst-cbe',
      name: 'Commercial Bank of Ethiopia',
      licenseNumber: 'CBE-LIC-40291',
      type: 'Commercial Bank',
      riskAppetite: 'Low'
    };
    setInstitutions([defaultInst]);
    setCurrentInstitution(defaultInst);
  }, []);

  const registerInstitution = (inst: Omit<Institution, 'id'>) => {
    const newInst: Institution = {
      ...inst,
      id: `inst-${Date.now()}`
    };
    setInstitutions(prev => [newInst, ...prev]);
    setCurrentInstitution(newInst);
  };

  const addFundingRequest = (amount: number, purpose: string, targetType: InstitutionType) => {
    if (!currentSME) return;
    const newRequest: FundingRequest = {
      id: `req-${Date.now()}`,
      smeId: currentSME.id,
      smeBusinessName: currentSME.businessName,
      amount,
      purpose,
      institutionType: targetType,
      status: 'New Request',
      submittedDate: new Date().toISOString().split('T')[0]
    };
    setFundingRequests(prev => [newRequest, ...prev]);
  };

  const updateFundingRequestStatus = (requestId: string, status: FundingRequestStatus) => {
    setFundingRequests(prev =>
      prev.map(req => {
        if (req.id === requestId) {
          const updated = { ...req, status };
          // If status changes to Funded, automatically create an Active Investment record!
          if (status === 'Funded' && req.status !== 'Funded') {
            const newInvestment: Investment = {
              id: `inv-${Date.now()}`,
              smeId: req.smeId,
              institutionId: currentInstitution?.id || 'inst-cbe',
              smeBusinessName: req.smeBusinessName,
              institutionName: currentInstitution?.name || 'Commercial Bank of Ethiopia',
              amount: req.amount,
              interestRate: currentInstitution?.type === 'MFI' ? 14.5 : 11.5,
              status: 'Active',
              startDate: new Date().toISOString().split('T')[0],
              dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0] // 1 year tenure
            };
            setInvestments(current => [newInvestment, ...current]);

            // Also increase SME active months/activity metrics slightly to show success
            setSmes(smeList =>
              smeList.map(s => {
                if (s.id === req.smeId) {
                  const newScore = Math.min(850, s.trustScore + 25);
                  return {
                    ...s,
                    trustScore: newScore,
                    historyScores: generateMoMHistory(newScore)
                  };
                }
                return s;
              })
            );
          }
          return updated;
        }
        return req;
      })
    );
  };

  const addSMETransaction = async (type: 'Income' | 'Expense', category: string, amount: number, desc: string) => {
    if (!currentSME) return;
    setIsScanning(true);
    setScanType(type);

    // Simulate OCR dual scanning algorithm spinner
    await new Promise(resolve => setTimeout(resolve, 1800));

    const newTx: Transaction = {
      id: `t-${Date.now()}`,
      smeId: currentSME.id,
      date: new Date().toISOString().split('T')[0],
      type,
      category,
      amount,
      description: desc,
      scannedStatus: 'Completed'
    };

    setTransactions(prev => [newTx, ...prev]);
    setIsScanning(false);
    setScanType(null);

    // Update the SME financial profile dynamically!
    setSmes(prevSmes =>
      prevSmes.map(sme => {
        if (sme.id === currentSME.id) {
          const revDiff = type === 'Income' ? amount : 0;
          const expDiff = type === 'Expense' ? amount : 0;
          const newRevenue = sme.monthlyRevenue + revDiff;
          const newExpenses = sme.monthlyExpenses + expDiff;
          const newProfit = newRevenue - newExpenses;
          
          // AI Score algorithm: more transactions and higher profit margin increases score!
          let scoreBoost = 3;
          if (type === 'Income' && amount > 10000) {
            scoreBoost += Math.min(15, Math.floor(amount / 20000));
          } else if (type === 'Expense' && amount > 50000) {
            scoreBoost -= 2; // high cash outflow slightly reduces short-term score
          }

          const newScore = Math.min(850, Math.max(300, sme.trustScore + scoreBoost));
          const updatedSme = {
            ...sme,
            monthlyRevenue: newRevenue,
            monthlyExpenses: newExpenses,
            profit: newProfit,
            transactionCount: sme.transactionCount + 1,
            trustScore: newScore,
            riskLevel: (newScore > 700 ? 'Low' : newScore > 550 ? 'Medium' : 'High') as RiskLevel,
            historyScores: generateMoMHistory(newScore)
          };

          // Also keep currentSME state in sync!
          setCurrentSMEState(updatedSme);
          return updatedSme;
        }
        return sme;
      })
    );
  };

  const setCurrentSME = (sme: SME) => {
    setCurrentSMEState(sme);
  };

  return (
    <AppContext.Provider
      value={{
        smes,
        fundingRequests,
        institutions,
        fundingProducts,
        investments,
        transactions,
        currentSME,
        currentInstitution,
        viewMode,
        setViewMode,
        registerInstitution,
        addFundingRequest,
        updateFundingRequestStatus,
        addSMETransaction,
        setCurrentSME,
        isScanning,
        scanType
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within a MockStateProvider');
  }
  return context;
};
