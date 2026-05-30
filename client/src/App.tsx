import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import CreditScore from './components/CreditScore';
import FinancialPassport from './components/FinancialPassport';
import { Transaction, BusinessProfile } from './types';
import { Sparkles, X, LayoutDashboard, FileSpreadsheet, ShieldAlert, FileSignature, LogOut, Landmark, Menu, User, FileText } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pre-load standard mock financial transaction ledger
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx-1',
      vendor: 'Stripe Merchant Payout',
      date: '2026-05-28',
      amount: 14500.00,
      type: 'income',
      category: 'Sales Revenue',
      status: 'posted'
    },
    {
      id: 'tx-2',
      vendor: 'Meta Platforms (Ads)',
      date: '2026-05-25',
      amount: 1200.00,
      type: 'expense',
      category: 'Marketing',
      status: 'posted'
    },
    {
      id: 'tx-3',
      vendor: 'WeWork Office Space',
      date: '2026-05-01',
      amount: 3200.00,
      type: 'expense',
      category: 'Rent & Utilities',
      status: 'posted'
    },
    {
      id: 'tx-4',
      vendor: 'Acme Advisory Group',
      date: '2026-04-20',
      amount: 1500.00,
      type: 'expense',
      category: 'Professional Services',
      status: 'posted'
    },
    {
      id: 'tx-5',
      vendor: 'Stripe Merchant Payout',
      date: '2026-04-15',
      amount: 11200.00,
      type: 'income',
      category: 'Sales Revenue',
      status: 'posted'
    }
  ]);

  // Load from localStorage if present for mock persistence
  useEffect(() => {
    const savedProfile = localStorage.getItem('sme_profile');
    const savedTransactions = localStorage.getItem('sme_transactions');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setIsLoggedIn(true);
    }
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Sync to localStorage
  const handleOnboardingComplete = (newProfile: BusinessProfile) => {
    setProfile(newProfile);
    setIsLoggedIn(true);
    localStorage.setItem('sme_profile', JSON.stringify(newProfile));
  };

  const handleSetTransactions = (action: React.SetStateAction<Transaction[]>) => {
    setTransactions((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      localStorage.setItem('sme_transactions', JSON.stringify(next));
      return next;
    });
  };

  // Toast trigger interface
  const showToast = (message: string, type: 'success' | 'info' | 'error') => {
    const newToast: Toast = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Centralized AI Credit Grading Logic
  const calculateCreditScore = () => {
    if (!profile) {
      return { score: 50, level: 'Medium' as const, color: 'text-amber-500', label: 'Average Risk', breakdown: { longevity: 150, ledger: 150, revenue: 150 } };
    }

    // 1. Longevity points (max 300 pts)
    const joined = new Date(profile.joinedDate);
    const mockCurrent = new Date('2026-05-30');
    const diffMonths = Math.max(0, (mockCurrent.getFullYear() - joined.getFullYear()) * 12 + (mockCurrent.getMonth() - joined.getMonth()));
    
    let longevityPts = 100;
    if (diffMonths >= 24) longevityPts = 300;
    else if (diffMonths >= 12) longevityPts = 260;
    else if (diffMonths >= 3) longevityPts = 180;

    // 2. Ledger consistency points (max 300 pts)
    const numTransactions = transactions.length;
    let ledgerPts = 120;
    if (numTransactions >= 10) ledgerPts = 300;
    else if (numTransactions >= 5) ledgerPts = 240;
    else if (numTransactions >= 3) ledgerPts = 180;

    // 3. Profit Margin Points (max 300 pts)
    const totalIncome = transactions
      .filter((t) => t.type === 'income' && t.status === 'posted')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense' && t.status === 'posted')
      .reduce((sum, t) => sum + t.amount, 0);

    const profitMargin = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    
    let surplusPts = 150;
    if (profitMargin >= 30) surplusPts = 300;
    else if (profitMargin >= 15) surplusPts = 250;
    else if (profitMargin > 0) surplusPts = 200;
    else if (profitMargin < 0) surplusPts = 80;

    // Total points (300 to 900)
    const totalPts = longevityPts + ledgerPts + surplusPts;
    const scorePercentage = totalPts / 900; // 0 to 1 scaling

    let level: 'Low' | 'Medium' | 'High' = 'Medium';
    let color = 'text-amber-500';
    let label = 'Medium Credit Risk';

    if (totalPts >= 720) {
      level = 'Low';
      color = 'text-emerald-400';
      label = 'Low Credit Risk (Prime)';
    } else if (totalPts < 600) {
      level = 'High';
      color = 'text-red-500';
      label = 'High Credit Risk (Sub-Prime)';
    }

    return {
      score: Math.round(scorePercentage * 550 + 300), // Scale to 300 - 850 range
      level,
      color,
      label,
      breakdown: {
        longevity: longevityPts,
        ledger: ledgerPts,
        revenue: surplusPts
      }
    };
  };

  const handleSignOut = () => {
    localStorage.removeItem('sme_profile');
    localStorage.removeItem('sme_transactions');
    setProfile(null);
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    showToast('Signed out. Mock database reset.', 'info');
  };

  const navLinks = [
    { id: 'dashboard', label: 'Bookkeeping Scan Hub', icon: LayoutDashboard },
    { id: 'credit', label: 'AI Credit Score', icon: ShieldAlert },
    { id: 'passport', label: 'Lender Passport', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* TOAST SYSTEM */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none flex flex-col gap-2 text-xs font-semibold">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl flex items-start justify-between gap-3 border bg-slate-900/95 backdrop-blur-md animate-fade-in transition-all duration-300 ${
              toast.type === 'success'
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5'
                : toast.type === 'error'
                ? 'text-rose-400 border-rose-500/30 bg-rose-500/5'
                : 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* CORE LOGIN FLOW VS MAIN WORKSPACE */}
      {!isLoggedIn || !profile ? (
        <div className="flex-1 flex flex-col justify-center">
          <Onboarding onComplete={handleOnboardingComplete} showToast={showToast} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          
          {/* MASTER TOP NAVBAR */}
          <header className="bg-slate-900 border-b border-slate-800/80 sticky top-0 z-40">
            <div className="w-full max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              
              {/* Logo Brand */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-100 tracking-tight block text-sm sm:text-base">VULA LEDGER AI</span>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block -mt-0.5">Credit Infrastructure Layer</span>
                </div>
              </div>

              <div className="hidden sm:block text-xs text-slate-400 font-bold px-3 py-1.5 bg-slate-950 border border-slate-800/80 rounded-lg">
                <span>SME Workstation Portal</span>
              </div>

              {/* MOBILE NAV BUTTON */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-800/60 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>
          </header>

          {/* PORTAL NAV STRIPS FOR MOBILE */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-3 animate-slide-down text-xs">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2">Navigation</p>
              
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      setActiveTab(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl font-bold flex items-center gap-2 ${
                      activeTab === link.id ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-400 hover:bg-slate-950'
                    }`}
                  >
                    <link.icon className="w-4 h-4 text-indigo-400" />
                    <span>{link.label}</span>
                  </button>
                ))}
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left p-3 rounded-xl font-bold flex items-center gap-2 text-rose-400 hover:bg-rose-950/20"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* MASTER CONTAINER BODY */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* DESKTOP SIDEBAR - Hidden on mobile */}
              <aside className="hidden lg:block lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sticky top-24 space-y-4">
                
                {/* Context Widget info */}
                <div className="bg-slate-950 p-4 border border-slate-800/80 rounded-xl space-y-2 text-xs">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Active Identity</p>
                  <div>
                    <p className="text-xs font-bold text-slate-200">{profile.businessName}</p>
                    <p className="text-[10px] text-indigo-400 font-medium">SME Bookkeeper</p>
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-4 space-y-1 text-xs">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider px-2.5 mb-2">Controls Navigation</p>
                  
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => setActiveTab(link.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                        activeTab === link.id
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <link.icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </button>
                  ))}

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>

              </aside>

              {/* ACTIVE PORTAL SCREEN SECTION */}
              <div className="col-span-1 lg:col-span-9 animate-fade-in">
                {activeTab === 'dashboard' && (
                  <Dashboard
                    profile={profile}
                    transactions={transactions}
                    setTransactions={handleSetTransactions}
                    setActiveTab={setActiveTab}
                    calculateCreditScore={calculateCreditScore}
                    showToast={showToast}
                  />
                )}
                {activeTab === 'credit' && (
                  <CreditScore
                    profile={profile}
                    transactions={transactions}
                    calculateCreditScore={calculateCreditScore}
                    showToast={showToast}
                  />
                )}
                {activeTab === 'passport' && (
                  <FinancialPassport
                    profile={profile}
                    transactions={transactions}
                    calculateCreditScore={calculateCreditScore}
                    showToast={showToast}
                  />
                )}
              </div>

            </div>
          </main>

          {/* MASTER FOOTER */}
          <footer className="bg-slate-950 border-t border-slate-900 text-slate-600 text-xs py-6 mt-12">
            <div className="w-full max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
              <div>
                <p className="font-semibold text-slate-400">Vula Ledger AI • B2B Credit Infrastructure Platform</p>
                <p className="text-[10px] text-slate-500 mt-1">Empowering East African Micro-Enterprises with verified bookkeeping and capital marketplace linkages.</p>
              </div>
              <div className="text-[10px] text-slate-500">
                © {new Date().getFullYear()} Vula AI Technologies. All rights reserved.
              </div>
            </div>
          </footer>

        </div>
      )}
    </div>
  );
}
