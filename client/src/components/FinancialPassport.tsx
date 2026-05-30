import React, { useState } from 'react';
import { BusinessProfile, Transaction } from '../types';
import { 
  Download, Share2, Landmark, ShieldCheck, FileCheck, 
  Send, ExternalLink, Mail, Check, AlertCircle, Sparkles, X, ChevronRight
} from 'lucide-react';

interface FinancialPassportProps {
  profile: BusinessProfile;
  transactions: Transaction[];
  calculateCreditScore: () => { 
    score: number; 
    level: 'Low' | 'Medium' | 'High'; 
    color: string; 
    label: string;
  };
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function FinancialPassport({ profile, transactions, calculateCreditScore, showToast }: FinancialPassportProps) {
  const { score, level, color, label } = calculateCreditScore();
  const [showShareSheet, setShowShareSheet] = useState(false);

  // Stats
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.status === 'posted')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.status === 'posted')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashFlow = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  
  // Dynamic loan size estimation based on revenue & credit score
  const finalScore = Math.min(900, Math.round(score * 9));
  const estimatedCreditLine = finalScore >= 720
    ? (profile.monthlyRevenueEstimate * 2.5)
    : finalScore >= 600
    ? (profile.monthlyRevenueEstimate * 1.2)
    : 0;

  const handleDownloadPDF = () => {
    showToast('Compiling financial ledger and AI risk profiles...', 'info');
    setTimeout(() => {
      showToast('Financial Passport PDF successfully compiled & downloaded!', 'success');
    }, 1500);
  };

  const handleShareReport = (method: string) => {
    setShowShareSheet(false);
    showToast(`Generating secure shared link for ${method}...`, 'info');
    setTimeout(() => {
      showToast(`Encrypted Financial Passport link sent via ${method}!`, 'success');
    }, 1200);
  };

  return (
    <div className="p-4 space-y-5 select-none pb-28 relative">
      
      {/* HEADER */}
      <div className="text-center">
        <h2 className="text-lg font-extrabold text-white">Financial Passport</h2>
        <p className="text-xs text-slate-400">Export lender-verified business health summaries</p>
      </div>

      {/* ACTION TOP PANEL */}
      <div className="flex gap-3">
        <button
          onClick={handleDownloadPDF}
          className="flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 min-h-[48px] transition-colors"
        >
          <Download className="w-4 h-4 text-fin-success" />
          Download PDF
        </button>
        <button
          onClick={() => setShowShareSheet(true)}
          className="flex-1 bg-fin-success hover:bg-fin-success text-slate-950 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 min-h-[48px] shadow-lg shadow-fin-success/10 transition-colors"
        >
          <Share2 className="w-4 h-4 text-slate-950" />
          Share Passport
        </button>
      </div>

      {/* PASSPORT EMBOSSED CONTAINER (Feels like an official credit report document) */}
      <div className="bg-white text-slate-900 rounded-3xl p-5 shadow-2xl relative border-4 border-slate-200 overflow-hidden">
        {/* Watermark Diagonal Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none rotate-[25deg]">
          <span className="text-[60px] font-black tracking-widest uppercase">VERIFIED</span>
        </div>

        {/* Top official banner */}
        <div className="border-b-2 border-slate-200 pb-4 flex items-center justify-between">
          <div>
            <span className="text-[8px] font-extrabold text-fin-text-secondary tracking-wider uppercase block">AI Credit Passport</span>
            <h3 className="text-sm font-black text-fin-text-primary uppercase tracking-tight">SME EXECUTIVE BRIEF</h3>
          </div>
          <div className="text-right flex items-center gap-2">
            {/* Visual Mini Shield Badge (Premium Accent Badge) */}
            <div className="w-8 h-8 rounded-lg bg-fin-premium text-slate-950 flex items-center justify-center font-bold text-xs shadow-sm">
              <FileCheck className="w-5.5 h-5.5" />
            </div>
          </div>
        </div>

        {/* QR Code and Official Sign-off placeholder row */}
        <div className="flex justify-between items-start pt-4 gap-4">
          <div className="space-y-3.5 flex-1">
            <div>
              <span className="text-[8px] font-extrabold text-fin-text-secondary uppercase tracking-wide block">Assessed Entity</span>
              <span className="text-xs font-extrabold text-fin-text-primary block">{profile.businessName}</span>
              <span className="text-[9px] text-fin-text-secondary font-medium block">Industry: {profile.industryType}</span>
            </div>

            <div>
              <span className="text-[8px] font-extrabold text-fin-text-secondary uppercase tracking-wide block">Verification Timestamp</span>
              <span className="text-xs font-bold text-fin-text-primary block">May 30, 2026 (11:34 UTC)</span>
              <span className="text-[9px] text-fin-text-secondary font-medium block">ID: CPF-884-2026</span>
            </div>
          </div>

          {/* Styled QR Code Box mockup */}
          <div className="w-18 h-18 border-2 border-slate-300 p-1 bg-white flex flex-col items-center justify-center rounded-xl shrink-0 select-none">
            <div className="grid grid-cols-4 gap-0.5 w-full h-full bg-slate-900 p-1.5 rounded-lg opacity-90">
              <div className="bg-white col-span-2 row-span-2 rounded-[1px]" />
              <div className="bg-transparent" />
              <div className="bg-white rounded-[1px]" />
              <div className="bg-transparent" />
              <div className="bg-white rounded-[1px]" />
              <div className="bg-white rounded-[1px]" />
              <div className="bg-transparent" />
              <div className="bg-white rounded-[1px]" />
              <div className="bg-transparent" />
              <div className="bg-white col-span-2 row-span-2 rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* SECTION 1: CREDIT TIER BRIEF */}
        <div className="mt-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[8px] font-extrabold text-fin-text-secondary uppercase tracking-wide block">Calculated Rating</span>
              <span className="text-md font-black text-fin-text-primary tracking-tight">{finalScore} / 900</span>
              <span className="text-[9px] text-fin-text-secondary block font-semibold">Continuous Trust Index</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-extrabold text-fin-text-secondary uppercase tracking-wide block">Risk Classification</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-md font-extrabold inline-block mt-0.5 ${
                level === 'Low' ? 'bg-fin-success/15 text-fin-success' : level === 'Medium' ? 'bg-fin-warning/15 text-fin-warning' : 'bg-fin-danger/15 text-fin-danger'
              }`}>
                {level} Risk
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 2: AUDITED KEY FINANCIALS */}
        <div className="mt-4 space-y-2.5">
          <h4 className="text-[9px] font-extrabold text-fin-text-muted uppercase tracking-widest border-b border-slate-100 pb-1">Verified Audit Metrics</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-150">
              <span className="text-[8px] font-extrabold text-fin-text-secondary uppercase tracking-wide block">Audited Net Income</span>
              <span className="text-xs font-black text-fin-text-primary">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-150">
              <span className="text-[8px] font-extrabold text-fin-text-secondary uppercase tracking-wide block">Audited Total Expenses</span>
              <span className="text-xs font-black text-fin-text-primary">${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-150">
              <span className="text-[8px] font-extrabold text-fin-text-secondary uppercase tracking-wide block">Current Cash Flow</span>
              <span className="text-xs font-black text-fin-text-primary">
                {netCashFlow >= 0 ? '+' : '-'}${Math.abs(netCashFlow).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="bg-slate-50/60 p-2.5 rounded-xl border border-slate-150">
              <span className="text-[8px] font-extrabold text-fin-text-secondary uppercase tracking-wide block">Calculated Profit Margin</span>
              <span className="text-xs font-black text-fin-text-primary">{margin.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: UNDERWRITING ANALYSIS (Premium Accent Integration) */}
        <div className="mt-5 border-t border-slate-150 pt-4 space-y-2">
          <h4 className="text-[9px] font-extrabold text-fin-text-muted uppercase tracking-widest">Lending Engine Recommendation</h4>
          <div className="p-3 bg-fin-premium/10 border border-fin-premium rounded-xl flex gap-2.5">
            <Landmark className="w-5.5 h-5.5 text-fin-premium shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-fin-text-primary block">
                {estimatedCreditLine > 0 
                  ? `Recommended for Capital Line up to $${estimatedCreditLine.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : 'Pre-Approved Capital: Action Required'}
              </span>
              <p className="text-[10px] text-fin-text-secondary leading-normal">
                {estimatedCreditLine > 0
                  ? `Qualified for preferred underwriter rates starting at 4.5% APR based on account longevity of ${new Date('2026-05-30').getMonth() - new Date(profile.joinedDate).getMonth()} months.`
                  : 'Establish a 30-day baseline platform records and link bank feeds to initialize credit limit bounds.'}
              </p>
            </div>
          </div>
        </div>

        {/* Official seals */}
        <div className="mt-5 flex justify-between items-center text-[8px] text-fin-text-muted font-bold border-t border-slate-100 pt-3">
          <span>SECURE SYSTEM HASH: 18E279</span>
          <span className="flex items-center gap-1 text-fin-success">
            <ShieldCheck className="w-3.5 h-3.5" />
            LENDER SIGNED SECURE
          </span>
        </div>
      </div>

      {/* 5. SHARE ACTION SHEET MODAL */}
      {showShareSheet && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col justify-end p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 max-w-md mx-auto w-full shadow-2xl">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-850">
              <h4 className="font-extrabold text-sm text-white">Share Secure Financial Passport</h4>
              <button 
                onClick={() => setShowShareSheet(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Generate a unique, single-use, end-to-end encrypted link for accredited financial institutions. Recipient gains audited reading access for 7 days.
            </p>

            <div className="space-y-2 pt-1.5">
              <button
                onClick={() => handleShareReport('Direct Banking API (Plaid)')}
                className="w-full bg-slate-950 border border-slate-850 hover:bg-slate-900/60 p-3 rounded-xl text-left hover:border-slate-700 transition-colors flex items-center justify-between min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <Landmark className="w-4 h-4 text-fin-success" />
                  <span className="text-xs font-bold text-slate-200">Share with Banking Partners (Instantly)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => handleShareReport('Secure Email Link')}
                className="w-full bg-slate-950 border border-slate-850 hover:bg-slate-900/60 p-3 rounded-xl text-left hover:border-slate-700 transition-colors flex items-center justify-between min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-fin-success" />
                  <span className="text-xs font-bold text-slate-200">Email Access Token Link</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => handleShareReport('External Underwriters Portal')}
                className="w-full bg-slate-950 border border-slate-850 hover:bg-slate-900/60 p-3 rounded-xl text-left hover:border-slate-700 transition-colors flex items-center justify-between min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-fin-success" />
                  <span className="text-xs font-bold text-slate-200">Generate Underwriter Web URL</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <button
              onClick={() => setShowShareSheet(false)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold py-2.5 rounded-xl text-xs min-h-[44px] mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
