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

const initialSMEs: SME[] = [];

const initialFundingRequests: FundingRequest[] = [];

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

const initialTransactions: Transaction[] = [];

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

  // Fetch real portfolio from Vula Ledger backend on mount
  useEffect(() => {
    const token = localStorage.getItem('vula_jwt_token') || '';
    fetch('http://localhost:8080/api/bank/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.businesses) {
          const liveSMEs = data.businesses.map((biz: any, index: number) => {
            const riskLevelStr = biz.risk === 'LOW' ? 'Low' : biz.risk === 'MEDIUM' ? 'Medium' : 'High';
            return {
              id: `live-sme-${index}`,
              businessName: biz.name,
              sector: 'General SME Trade',
              ownerName: 'Gutu Daniel Geleta',
              email: 'gutu@vula.com',
              phone: '+251 911 223 344',
              joinedDate: '2024-01-15',
              trustScore: typeof biz.score === 'number' ? biz.score : 300,
              riskLevel: riskLevelStr,
              monthlyRevenue: 45000,
              monthlyExpenses: 21000,
              profit: 24000,
              monthsActive: 12,
              transactionCount: 6,
              location: 'Addis Ababa',
              historyScores: generateMoMHistory(typeof biz.score === 'number' ? biz.score : 300)
            };
          });

          setSmes(prev => {
            const filtered = prev.filter(s => !s.id.startsWith('live-sme-'));
            return [...liveSMEs, ...filtered];
          });
        }
      })
      .catch(err => {
        console.error("Failed to load live bank portfolio dashboard from backend:", err);
      });
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

    const newTx: any = {
      id: `t-${Date.now()}`,
      smeId: currentSME.id,
      date: new Date().toISOString().split('T')[0],
      type: type.toLowerCase() as 'income' | 'expense',
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
