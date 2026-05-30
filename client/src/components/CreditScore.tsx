import React, { useState, useEffect } from 'react';
import { BusinessProfile, Transaction } from '../types';
import { getCreditScore, recalculateCreditScore } from '../api';
import { 
  Sparkles, Shield, ChevronRight, Activity, Calendar, 
  CheckCircle, PlusCircle, AlertTriangle, Lightbulb, Zap, Loader2, RefreshCw 
} from 'lucide-react';

interface CreditScoreProps {
  profile: BusinessProfile;
  transactions: Transaction[];
  calculateCreditScore: () => { 
    score: number; 
    level: 'Low' | 'Medium' | 'High'; 
    color: string; 
    label: string;
    breakdown: {
      longevity: number;
      ledger: number;
      revenue: number;
    }
  };
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function CreditScore({ profile, transactions, calculateCreditScore, showToast }: CreditScoreProps) {
  const { score: localScore, level: localLevel, color: localColor, label: localLabel, breakdown: localBreakdown } = calculateCreditScore();
  
  const [realScore, setRealScore] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<string>('MEDIUM');
  const [breakdownData, setBreakdownData] = useState<any>(null);
  const [insightText, setInsightText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const triggerRecalculate = () => {
    setIsRecalculating(true);
    showToast('Triggering on-demand AI underwriting engine recalculation...', 'info');
    
    const businessId = Number(localStorage.getItem('vula_business_id') || 1);
    recalculateCreditScore(businessId)
      .then((data) => {
        setRealScore(data.score);
        setRiskLevel(data.riskLevel);
        setBreakdownData({
          revenue: data.revenueScore,
          stability: data.stabilityScore,
          transaction: data.transactionScore,
          tenure: data.tenureScore,
          proofStrength: data.proofStrengthScore || 150
        });
        setInsightText(data.insight || 'Stable operation verified through audited reference keys.');
        setErrorMsg(null);
        showToast('AI credit standing successfully recalculated and verified!', 'success');
      })
      .catch((err) => {
        showToast(err.message || 'Underwriting calculation error.', 'error');
      })
      .finally(() => {
        setIsRecalculating(false);
      });
  };

  useEffect(() => {
    const businessId = Number(localStorage.getItem('vula_business_id') || 1);
    getCreditScore(businessId)
      .then((data) => {
        setRealScore(data.score);
        setRiskLevel(data.riskLevel);
        setBreakdownData({
          revenue: data.revenueScore,
          stability: data.stabilityScore,
          transaction: data.transactionScore,
          tenure: data.tenureScore,
          proofStrength: data.proofStrengthScore || 150
        });
        setInsightText(data.insight || 'Stable operation verified through audited reference keys.');
        setErrorMsg(null);
      })
      .catch((err) => {
        console.error('Failed to load real credit score from backend:', err);
        setErrorMsg(err.message || 'Alternative Credit Scoring is not ready yet.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const isPendingHistory = errorMsg || (realScore !== null && realScore <= 120) || transactions.length < 5;

  if (isPendingHistory) {
    return (
      <div className="p-4 space-y-5 select-none pb-24 max-w-xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-extrabold text-white">AI Credit Score Engine</h2>
          <p className="text-xs text-slate-400">Continuous risk monitoring and creditworthiness grading</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[36px] text-center space-y-6 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-sm">
            <h3 className="text-sm font-extrabold text-slate-200">Credit Score Not Ready Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {errorMsg || "Alternative Credit Scoring requires a transaction history of at least 5 entries to compile dynamic credit standing."}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">
              Keep scanning customer invoice screenshots or record manual transactions in your Bookkeeping Scan Hub to automatically compile your verified credit rating.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Standing
            </button>
            <button
              onClick={triggerRecalculate}
              disabled={isRecalculating}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 disabled:active:scale-100 min-h-[44px]"
            >
              {isRecalculating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span>Recalculate AI Score</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interactive simulator toggles to demonstrate score sensitivity
  const [hasBusinessBankLinked, setHasBusinessBankLinked] = useState(false);
  const [hasTaxHistoryVerified, setHasTaxHistoryVerified] = useState(false);

  // Derive dynamic score additions from toggles
  const linkBonus = hasBusinessBankLinked ? 45 : 0;
  const taxBonus = hasTaxHistoryVerified ? 65 : 0;
  const finalScore = realScore !== null ? realScore : Math.min(900, Math.round(localScore * 9) + linkBonus + taxBonus); // Map percentage to standard credit scale (300 - 900)

  // Dynamic Risk Tier assessment for FICO scale
  const getDynamicTier = (currentScore: number) => {
    if (currentScore >= 700) return { tier: 'Low', text: 'Low Credit Risk (Prime)', color: 'text-fin-success border-fin-success/50 bg-fin-success/10' };
    if (currentScore >= 400) return { tier: 'Medium', text: 'Medium Credit Risk (Near-Prime)', color: 'text-fin-warning border-fin-warning/50 bg-fin-warning/10' };
    return { tier: 'High', text: 'High Credit Risk (Sub-Prime)', color: 'text-fin-danger border-fin-danger/50 bg-fin-danger/10' };
  };

  const currentTier = getDynamicTier(finalScore);

  // Dynamic Contextual Advice List
  const improvementTips = {
    Low: [
      { id: 1, text: 'Maintain low credit usage', desc: 'Keep recurring vendor expenses spread evenly month-to-month.' },
      { id: 2, text: 'Unlock priority lender rates', desc: 'Your High Trust Score qualifies your business for instant pre-approved loans.' },
      { id: 3, text: 'Enable recurring automated tax audits', desc: 'Verify your quarterly tax declarations to lower capital cost by another 0.5%.' }
    ],
    Medium: [
      { id: 1, text: 'Upload 3 more vendor invoices', desc: 'Our AI needs a slight historical transaction buffer to stabilize your cash volatility score.' },
      { id: 2, text: 'Keep ledger updated weekly', desc: 'Assessing consistency of platform bookkeeping builds rapid operational credibility.' },
      { id: 3, text: 'Maintain a 15% liquid buffer', desc: 'Your average monthly cash inflow-to-outflow ratio is near-prime. Small buffers push you to Prime.' }
    ],
    High: [
      { id: 1, text: 'Establish platform longevity', desc: 'Credit assessment models heavily weight duration on system. Let your records mature.' },
      { id: 2, text: 'Log primary recurring revenues', desc: 'Manually add or upload Stripe payouts to prove baseline monthly sales volume.' },
      { id: 3, text: 'Verify core business registry records', desc: 'Complete profile setup and link verified bank feeds to instantly lift score bounds.' }
    ]
  };

  const handleToggleBank = () => {
    setHasBusinessBankLinked(!hasBusinessBankLinked);
    showToast(!hasBusinessBankLinked ? 'Business Bank Account connected (+45 pts!)' : 'Bank Account disconnected', 'info');
  };

  const handleToggleTax = () => {
    setHasTaxHistoryVerified(!hasTaxHistoryVerified);
    showToast(!hasTaxHistoryVerified ? 'IRS tax transcripts verified (+65 pts!)' : 'Tax records disconnected', 'info');
  };

  return (
    <div className="p-4 space-y-5 select-none pb-24">
      
      {/* HEADER SECTION */}
      <div className="text-center">
        <h2 className="text-lg font-extrabold text-white">AI Credit Score Engine</h2>
        <p className="text-xs text-slate-400">Continuous risk monitoring and creditworthiness grading</p>
      </div>

      {/* DYNAMIC CIRCULAR GAUGE PROGRESS RING */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-[36px] shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glow behind circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-fin-success/5 rounded-full blur-3xl" />
        
        {/* Sizable Progress Ring Gauge */}
        <div className="relative flex items-center justify-center w-48 h-48">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-[10px] text-slate-400">Loading AI score...</span>
            </div>
          ) : (
            <>
              <svg className="w-44 h-44 transform -rotate-[220deg]">
                {/* Background Track */}
                <circle
                  cx="88"
                  cy="88"
                  r="74"
                  className="stroke-slate-900"
                  strokeWidth="11"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 74}
                  strokeDashoffset={2 * Math.PI * 74 * 0.25} // Semi-circle feel
                  strokeLinecap="round"
                />
                {/* Colored Active Gauge */}
                <circle
                  cx="88"
                  cy="88"
                  r="74"
                  className={`${
                    finalScore >= 700 ? 'stroke-fin-success' : finalScore >= 400 ? 'stroke-fin-warning' : 'stroke-fin-danger'
                  } transition-all duration-1000 ease-out`}
                  strokeWidth="11"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 74}
                  strokeDashoffset={2 * Math.PI * 74 * (0.25 + (1 - finalScore / 900) * 0.75)}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Internal Gauge Readings */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-black text-white tracking-tighter transition-all">
                  {finalScore}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  AI Trust Rating
                </span>
                <span className={`text-[11px] font-extrabold mt-1 ${
                  finalScore >= 700 ? 'text-fin-success' : finalScore >= 400 ? 'text-fin-warning' : 'text-fin-danger'
                }`}>
                  {finalScore >= 700 ? 'Excellent' : finalScore >= 400 ? 'Good' : 'Fair'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* RISK BADGE AND STATUS */}
        <div className={`mt-2 border px-4 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold ${currentTier.color}`}>
          <Shield className="w-4 h-4" />
          <span>{currentTier.text}</span>
        </div>

        {/* DYNAMIC SCORING FACTORS BREAKDOWN */}
        <div className="w-full mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-850 pt-4 text-center">
          <div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Account Longevity</span>
            <span className="text-xs font-bold text-white mt-1 block">
              {breakdownData ? breakdownData.tenure : 150} <span className="text-[10px] text-slate-500 font-medium">/ 150</span>
            </span>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-slate-850 pt-2 sm:pt-0">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Ledger Activity</span>
            <span className="text-xs font-bold text-white mt-1 block">
              {breakdownData ? breakdownData.transaction : 150} <span className="text-[10px] text-slate-500 font-medium">/ 150</span>
            </span>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-slate-850 pt-2 sm:pt-0">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Revenue Volume</span>
            <span className="text-xs font-bold text-white mt-1 block">
              {breakdownData ? breakdownData.revenue : 250} <span className="text-[10px] text-slate-500 font-medium">/ 250</span>
            </span>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-slate-850 pt-2 sm:pt-0">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Cash Flow Health</span>
            <span className="text-xs font-bold text-white mt-1 block">
              {breakdownData ? breakdownData.stability : 200} <span className="text-[10px] text-slate-500 font-medium">/ 200</span>
            </span>
          </div>
        </div>

        {/* RECALCULATE TRIGGER & 24HR CYCLE EXPLANATION */}
        <div className="w-full mt-4 pt-4 border-t border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-center sm:text-left space-y-0.5">
            <p className="text-slate-400 font-semibold">24-Hour Scoring Cycle Active</p>
            <p className="text-[10px] text-slate-500">Continuous risk rating compiled automatically once per 24 hours.</p>
          </div>
          <button
            onClick={triggerRecalculate}
            disabled={isRecalculating}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 disabled:active:scale-100 shrink-0 min-h-[38px] text-[11px]"
          >
            {isRecalculating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Recalculate AI Score</span>
          </button>
        </div>

        {/* REAL AI UNDERWRITING STRATEGY CARD */}
        <div className="w-full bg-indigo-950/20 border border-indigo-500/20 p-4 rounded-2xl space-y-2 mt-4 text-xs text-left">
          <span className="text-[10px] font-bold text-indigo-400 tracking-wide uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            Real AI Underwriting Strategy & Tips
          </span>
          <p className="text-slate-300 leading-relaxed italic">
            "{insightText || 'Stable operation verified. Your platform longevity and transaction volume are solid indicators of business creditworthiness.'}"
          </p>
        </div>

      </div>

      {/* CREDIT BOOSTER WORKBENCH */}
      <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-3xl space-y-3.5">
        <div>
          <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-fin-success" />
            Credit Booster Workbench
          </h3>
          <p className="text-[10px] text-slate-400">Link alternative banking registries or tax transcripts to build stronger credit profile validation.</p>
        </div>

        <div className="space-y-2.5">
          {/* Simulator Option 1 */}
          {/* <button
            onClick={handleToggleBank}
            className={`w-full text-left p-3 rounded-2xl border flex items-center justify-between transition-all duration-150 min-h-[54px] ${
              hasBusinessBankLinked
                ? 'bg-fin-success/20 border-fin-success/50'
                : 'bg-slate-950 border-slate-850 hover:bg-slate-900/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity className={`w-5 h-5 ${hasBusinessBankLinked ? 'text-fin-success' : 'text-slate-500'}`} />
              <div>
                <span className="text-xs font-bold text-white block">Link Bank Transaction Feeds</span>
                <span className="text-[10px] text-slate-400">Assesses real cash flow consistency</span>
              </div>
            </div>
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
              hasBusinessBankLinked ? 'bg-fin-success/20 text-fin-success' : 'bg-slate-900 text-slate-500'
            }`}>
              {hasBusinessBankLinked ? '+45 Pts' : 'Add 45 Pts'}
            </span>
          </button> */}

          {/* Simulator Option 2 */}
          <button
            onClick={handleToggleTax}
            className={`w-full text-left p-3 rounded-2xl border flex items-center justify-between transition-all duration-150 min-h-[54px] ${
              hasTaxHistoryVerified
                ? 'bg-fin-success/20 border-fin-success/50'
                : 'bg-slate-950 border-slate-850 hover:bg-slate-900/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Calendar className={`w-5 h-5 ${hasTaxHistoryVerified ? 'text-fin-success' : 'text-slate-500'}`} />
              <div>
                <span className="text-xs font-bold text-white block">Verify IRS Tax Filings</span>
                <span className="text-[10px] text-slate-400">Verifies year-to-year net business profit</span>
              </div>
            </div>
            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
              hasTaxHistoryVerified ? 'bg-fin-success/20 text-fin-success' : 'bg-slate-900 text-slate-500'
            }`}>
              {hasTaxHistoryVerified ? '+65 Pts' : 'Add 65 Pts'}
            </span>
          </button>
        </div>
      </div>

      {/* CONTEXTUAL IMPROVEMENT TIPS CARD */}
      <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-3xl space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-850">
          <div className="p-1.5 rounded-lg bg-fin-success/10 text-fin-success border border-fin-success/40">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-extrabold text-white">SME Owner Improvement Playbook</h4>
        </div>

        <div className="space-y-3">
          {improvementTips[currentTier.tier as 'Low' | 'Medium' | 'High'].map((tip: { id: number; text: string; desc: string }) => (
            <div key={tip.id} className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center shrink-0 mt-0.5 text-fin-success text-[10px] font-bold">
                {tip.id}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">{tip.text}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 leading-relaxed block">{tip.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
