import React from 'react';
import { BusinessProfile, Transaction } from '../types';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles, Landmark, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react';

interface DashboardProps {
  profile: BusinessProfile;
  transactions: Transaction[];
  setActiveTab: (tab: string) => void;
  calculateCreditScore: () => { score: number; level: 'Low' | 'Medium' | 'High'; color: string; label: string };
}

export default function Dashboard({ profile, transactions, setActiveTab, calculateCreditScore }: DashboardProps) {
  // Calculate stats from transactions
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.status === 'posted')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.status === 'posted')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Longevity math
  const getLongevityMonths = () => {
    const joined = new Date(profile.joinedDate);
    const mockCurrent = new Date('2026-05-30'); // Anchor to current 2026 time
    const diffTime = Math.abs(mockCurrent.getTime() - joined.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.4);
  };

  const monthsJoined = getLongevityMonths();
  const { score, level, color, label } = calculateCreditScore();

  // Simulated chart columns based on transactions
  const monthlyData = [
    { month: 'Jan', income: 32000, expense: 22000 },
    { month: 'Feb', income: 38000, expense: 25000 },
    { month: 'Mar', income: 35000, expense: 28000 },
    { month: 'Apr', income: 42000, expense: 29000 },
    { month: 'May', income: totalIncome || profile.monthlyRevenueEstimate, expense: totalExpense || profile.monthlyRevenueEstimate * 0.72 },
  ];

  const maxVal = Math.max(...monthlyData.flatMap(d => [d.income, d.expense]));

  return (
    <div className="space-y-6 sm:space-y-8 select-none">
      
      {/* Upper Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-850">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary-100 bg-primary/20 border border-primary/30 px-3 py-1 rounded-full">
            {profile.industryType} Industry Standard
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-2.5 truncate max-w-lg">
            Welcome back, {profile.businessName}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Continuous AI underwriting active for {monthsJoined === 0 ? 'under a month' : `${monthsJoined} month${monthsJoined > 1 ? 's' : ''}`}
          </p>
        </div>
        
        {/* Quick Profile stats */}
        <div className="flex items-center gap-3.5 shrink-0 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-slate-100 font-bold shadow-md">
            {profile.businessName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Account Active</span>
            <span className="text-xs font-extrabold text-slate-200 block">{profile.email}</span>
          </div>
        </div>
      </div>

      {/* KPI RESPONSIVE GRID (Stacks on mobile, snaps into 3 columns on desktop!) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* KPI 1: Revenue */}
        <div className="bg-slate-950 border border-slate-850 p-5 rounded-3xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors" />
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Audited Revenue</span>
          <span className="text-2xl font-black text-white mt-3 block">
            ${(totalIncome || profile.monthlyRevenueEstimate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-success font-bold flex items-center gap-1 mt-3">
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            +12.4% vs last quarter
          </span>
        </div>

        {/* KPI 2: Margin */}
        <div className="bg-slate-950 border border-slate-850 p-5 rounded-3xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full blur-xl group-hover:bg-success/10 transition-colors" />
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Profit Margin</span>
          <span className="text-2xl font-black text-white mt-3 block">
            {(profitMargin || 28.5).toFixed(1)}%
          </span>
          <span className="text-[10px] text-success font-bold flex items-center gap-1 mt-3">
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            +1.8% margin gain
          </span>
        </div>

        {/* KPI 3: Cash Flow */}
        <div className="bg-slate-950 border border-slate-850 p-5 rounded-3xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-xl group-hover:opacity-100 transition-opacity ${netCashFlow >= 0 ? 'bg-success/5' : 'bg-warning/5'}`} />
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Net Surplus</span>
          <span className={`text-2xl font-black mt-3 block ${netCashFlow >= 0 ? 'text-success' : 'text-warning'}`}>
            {netCashFlow >= 0 ? '+' : '-'}${Math.abs(netCashFlow || profile.monthlyRevenueEstimate * 0.28).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className={`text-[10px] font-bold flex items-center gap-1 mt-3 ${
            netCashFlow >= 0 ? 'text-success' : 'text-warning'
          }`}>
            {netCashFlow >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 shrink-0" /> : <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />}
            {netCashFlow >= 0 ? 'Cash positive inflow' : 'High capital deployment'}
          </span>
        </div>
      </div>

      {/* DYNAMIC REAL-TIME CREDIT GRADIENT BANNER CARD */}
      <button
        onClick={() => setActiveTab('credit')}
        className="w-full text-left bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 border border-slate-850 p-6 rounded-[36px] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl hover:border-slate-750 transition-all duration-200 relative overflow-hidden group min-h-[110px]"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/15 transition-colors" />
        
        <div className="space-y-2 relative z-10 flex-1">
          <span className="text-[9px] font-extrabold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
            <Sparkles className="w-4.5 h-4.5 text-goldaccent animate-pulse" />
            Underwriting & Underwriting Rating
          </span>
          <h3 className="text-base font-black text-white">Continuous Platform Trust Rating</h3>
          
          <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
            <span className={`text-xs px-3 py-1 rounded-lg font-bold border ${
              level === 'Low' ? 'bg-success/15 border-success/30 text-success' : level === 'Medium' ? 'bg-warning/15 border-warning/30 text-warning' : 'bg-danger/15 border-danger/30 text-danger'
            }`}>
              {level} Risk Profile
            </span>
            <span className="text-[11px] text-slate-400">Derived from {transactions.length} receipts & duration records</span>
          </div>
        </div>

        {/* Circular gauge summary on right */}
        <div className="relative flex items-center justify-center shrink-0 w-20 h-20 bg-slate-950 rounded-full border border-slate-850 shadow-inner self-center sm:self-auto">
          <svg className="w-18 h-18 transform -rotate-90">
            <circle
              cx="36"
              cy="36"
              r="30"
              className="stroke-slate-900"
              strokeWidth="5"
              fill="transparent"
            />
            <circle
              cx="36"
              cy="36"
              r="30"
              className="stroke-success transition-all duration-1000 ease-out"
              strokeWidth="5"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 30}
              strokeDashoffset={2 * Math.PI * 30 * (1 - score / 100)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-md font-black text-white">{Math.round(score * 9)}</span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Index</span>
          </div>
        </div>
      </button>

      {/* FINANCIAL TREND BAR CHART (Fluid layout extending beautifully to screen parents) */}
      <div className="bg-slate-950 border border-slate-850 p-6 rounded-[36px] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-primary" />
              Dynamic Cash Flow Trend
            </h3>
            <p className="text-xs text-slate-400">Visual index of monthly inflows and outflows</p>
          </div>
          <div className="flex gap-3 text-[10px] font-bold self-start sm:self-auto bg-slate-900 p-1.5 rounded-lg border border-slate-850">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-success" />
              Inflow (+)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-slate-700" />
              Outflow (-)
            </span>
          </div>
        </div>

        {/* Real-time stretching parent graph */}
        <div className="h-44 flex items-end justify-between gap-4 pt-6 px-1">
          {monthlyData.map((d, idx) => {
            const incPct = (d.income / maxVal) * 100;
            const expPct = (d.expense / maxVal) * 100;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="flex gap-1.5 items-end w-full justify-center h-full">
                  {/* Income bar */}
                  <div
                    style={{ height: `${incPct}%` }}
                    className="w-full max-w-[20px] sm:max-w-[24px] bg-success hover:opacity-90 rounded-t-sm transition-all duration-500 shadow-md shadow-success/10 relative group cursor-pointer"
                  >
                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[10px] font-extrabold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none text-success shadow-xl">
                      ${Math.round(d.income).toLocaleString()}
                    </div>
                  </div>
                  {/* Expense bar */}
                  <div
                    style={{ height: `${expPct}%` }}
                    className="w-full max-w-[20px] sm:max-w-[24px] bg-slate-700 hover:opacity-90 rounded-t-sm transition-all duration-500 relative group cursor-pointer"
                  >
                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[10px] font-extrabold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none text-slate-200 shadow-xl">
                      ${Math.round(d.expense).toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* RE-STYLING ADVISER CARDS TO MATCH THE DESIGN SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Advisor */}
        <div className="bg-slate-950 border border-slate-850 p-5 rounded-[36px] flex gap-4 items-start shadow-sm">
          <div className="p-3 rounded-2xl bg-primary/20 border border-primary/30 shrink-0 text-primary-100 shadow-inner">
            <Sparkles className="w-5.5 h-5.5" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xs font-black text-white">AI Capital Advisor Insights</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {level === 'Low' && "Excellent operations! Your Low Risk rating entitles you to our Premium lending pools. Head to the Passport portal to share your verification hash with certified credit partners."}
              {level === 'Medium' && "Cash levels indicate mild operational volatility in March. Upload 2-3 additional receipt files to stabilize your ledger buffer and upgrade into prime credit rating."}
              {level === 'High' && "New profiles require baseline mature logs. Add recurring Stripe payout records and verify business registrations to safely transition out of sub-prime ranges."}
            </p>
          </div>
        </div>

        {/* Passport redirection banner */}
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-850 p-5 rounded-[36px] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-goldaccent/10 border border-goldaccent/20 shrink-0 text-goldaccent">
              <Landmark className="w-5.5 h-5.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Generate Audit Passport</h4>
              <p className="text-[10px] text-slate-400">Lender-ready briefcase with active credentials</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('passport')}
            className="text-xs bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-150 min-h-[40px] flex items-center gap-1"
          >
            <span>View Brief</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
