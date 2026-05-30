import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import CreditScore from './components/CreditScore';
import FinancialPassport from './components/FinancialPassport';
import { Transaction, BusinessProfile } from './types';
import { Sparkles, X, LayoutDashboard, FileSpreadsheet, ShieldAlert, FileSignature, LogOut, Landmark } from 'lucide-react';

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
    
    let longevityPts = 100; // Base points for new sign-ups
    if (diffMonths >= 24) longevityPts = 300;
    else if (diffMonths >= 12) longevityPts = 260;
    else if (diffMonths >= 3) longevityPts = 180;

    // 2. Ledger consistency points (max 300 pts)
    const numTransactions = transactions.length;
    let ledgerPts = 120; // Base points
    if (numTransactions >= 10) ledgerPts = 300;
    else if (numTransactions >= 5) ledgerPts = 240;
    else if (numTransactions >= 3) ledgerPts = 180;

    // 3. Profit Margin/Surplus Points (max 300 pts)
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
    else if (profitMargin < 0) surplusPts = 80; // Penalize heavy deficits

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
      score: scorePercentage * 100, // percentage for circular rings
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'credit', label: 'Credit Score', icon: ShieldAlert },
    { id: 'passport', label: 'Passport', icon: FileSignature },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-primary/30 selection:text-white">
      {/* TOAST SYSTEM (Absolute Overlay top-center) */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3 text-xs font-semibold border bg-slate-900/95 backdrop-blur-md animate-fadeIn transition-all duration-300 ${
              toast.type === 'success'
                ? 'text-success border-success/35 bg-success/5'
                : toast.type === 'error'
                ? 'text-danger border-danger/35 bg-danger/5'
                : 'text-sky-400 border-sky-500/30 bg-sky-500/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
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
        <div className="flex-1 flex flex-col md:flex-row relative">
          
          {/* DESKTOP SIDEBAR NAVIGATION */}
          <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-850 shrink-0 z-40 p-5 justify-between">
            <div className="space-y-6">
              {/* Logo block */}
              <div className="flex items-center gap-3 py-1">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-slate-100 font-extrabold shadow-lg shadow-primary/20">
                  <Landmark className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="font-extrabold text-sm tracking-tight text-white block">CreditBook™</span>
                  <span className="text-[10px] text-slate-400 font-medium">SME Capital Intelligence</span>
                </div>
              </div>

              {/* Navigation links */}
              <nav className="space-y-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.id}
                      onClick={() => setActiveTab(link.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-150 ${
                        activeTab === link.id
                          ? 'bg-primary text-white shadow-lg shadow-primary/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{link.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Profile logout block */}
            <div className="border-t border-slate-850 pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 text-xs font-bold">
                  {profile.businessName.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-200 block truncate">{profile.businessName}</span>
                  <span className="text-[10px] text-slate-500 block truncate">{profile.email}</span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-danger hover:bg-danger/10 transition-all duration-150"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>

          {/* MOBILE NAV BOTTOM STICKY TAB BAR */}
          <nav className="md:hidden fixed bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-md border-t border-slate-850 flex justify-around py-2.5 z-40 px-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex flex-col items-center justify-center gap-1 transition-all duration-150 min-h-[48px] min-w-[48px] px-1 rounded-xl ${
                    activeTab === link.id ? 'text-primary font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px] font-medium tracking-wide">{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* CORE CONTENT SHELF CONTAINER */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-900 overflow-y-auto">
            {/* Standard Global Mobile Top bar header */}
            <header className="md:hidden bg-slate-950 border-b border-slate-850 px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-slate-100 font-extrabold text-xs">
                  C
                </div>
                <span className="font-extrabold text-xs tracking-tight text-white">CreditBook™</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-[9px] font-bold text-slate-400 bg-slate-900 border border-slate-850 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors min-h-[32px]"
              >
                Sign Out
              </button>
            </header>

            {/* Screen View Router */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 md:pb-8">
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
            </main>
          </div>

        </div>
      )}
    </div>
  );
}
