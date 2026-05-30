import React from 'react';
import { useAppState } from '../../context/AppContext';
import { Users, ShieldAlert, FileSearch, Coins, BarChart3, TrendingUp, Landmark, ShieldCheck, Sparkles } from 'lucide-react';

export const FIDashboard: React.FC = () => {
  const { smes, fundingRequests, investments, currentInstitution } = useAppState();

  // Metrics calculation
  const totalSmes = smes.length;
  const lowRiskSmes = smes.filter(s => s.riskLevel === 'Low').length;
  const pendingRequests = fundingRequests.filter(f => f.status === 'New Request' || f.status === 'Under Review').length;
  const activeLoans = investments.filter(i => i.status === 'Active').length;
  const totalFundedCapital = investments
    .filter(i => i.status === 'Active')
    .reduce((sum, current) => sum + current.amount, 0);

  const avgCreditScore = Math.round(
    smes.reduce((sum, sme) => sum + sme.trustScore, 0) / (smes.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Landmark className="w-8 h-8 text-indigo-400" />
            Executive Dashboard Summary
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Active Workspace: <span className="text-indigo-400 font-semibold">{currentInstitution?.name || 'Commercial Bank of Ethiopia'}</span> • Classification: {currentInstitution?.type || 'Commercial Bank'}
          </p>
        </div>
        <div className="bg-indigo-950/20 border border-indigo-500/20 text-indigo-300 text-xs py-2 px-4 rounded-xl flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Underwriting Parameter: **{currentInstitution?.riskAppetite || 'Medium'} Risk Tolerance**</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total SMEs</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-extrabold text-slate-100">{totalSmes}</p>
            <p className="text-[10px] text-slate-500 mt-1">Active Ledger Accounts</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Low Risk Class</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-extrabold text-slate-100">{lowRiskSmes}</p>
            <p className="text-[10px] text-emerald-500 mt-1">{((lowRiskSmes/totalSmes)*100).toFixed(0)}% of Directory</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pending Deals</span>
            <FileSearch className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-extrabold text-slate-100">{pendingRequests}</p>
            <p className="text-[10px] text-amber-500 mt-1">Requiring Review</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Deals</span>
            <Coins className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-extrabold text-slate-100">{activeLoans}</p>
            <p className="text-[10px] text-sky-400 mt-1">{(totalFundedCapital).toLocaleString()} ETB Out</p>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between min-h-[110px] col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Trust Score</span>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-extrabold text-slate-100">{avgCreditScore}</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>MoM +1.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Underwriting Quick Guide banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Vula B2B Automated Credit Matchmaking
        </h2>
        <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl">
          SME Bookkeeping operations feed transaction metrics in real-time. Use the **SME Marketplace** to filter matching applicants, and the **Deal Pipeline CRM** to review credit proposals, perform AI analysis, and instantly fund loans.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
          <div className="bg-slate-950/50 p-4 border border-slate-800 rounded-xl">
            <p className="font-semibold text-indigo-400">1. Pre-Approved Ratios</p>
            <p className="text-slate-400 mt-1 text-[11px]">SMEs undergo background scans automatically matching stability metrics with national registries.</p>
          </div>
          <div className="bg-slate-950/50 p-4 border border-slate-800 rounded-xl">
            <p className="font-semibold text-indigo-400">2. Ledger Integrity</p>
            <p className="text-slate-400 mt-1 text-[11px]">Receipt OCR verification mitigates transaction forging risk. All values are triple-logged on the distributed database.</p>
          </div>
          <div className="bg-slate-950/50 p-4 border border-slate-800 rounded-xl">
            <p className="font-semibold text-indigo-400">3. instant CRM Funding</p>
            <p className="text-slate-400 mt-1 text-[11px]">Advance loans instantly from Under Review to Approved and Funded, dispatching digital capital to the SME.</p>
          </div>
        </div>
      </div>

    </div>
  );
};
