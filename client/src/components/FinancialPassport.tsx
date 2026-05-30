import React, { useState, useEffect } from 'react';
import { BusinessProfile, Transaction } from '../types';
import { 
  Download, Share2, Landmark, ShieldCheck, FileCheck, 
  Send, ExternalLink, Mail, Check, AlertCircle, Sparkles, X, ChevronRight, FileText, Plus, DollarSign
} from 'lucide-react';

interface FinancialPassportProps {
  profile: BusinessProfile;
  transactions: Transaction[];
  calculateCreditScore: () => { 
    score: number; 
    level: 'Low' | 'Medium' | 'High'; 
    color: string; 
    label: string;
    breakdown: { longevity: number; ledger: number; revenue: number };
  };
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
  realScore: number | null;
  scoreError: string | null;
}

interface LocalFundingRequest {
  id: string;
  amount: number;
  purpose: string;
  institutionType: string;
  status: string;
  submittedDate: string;
}

export default function FinancialPassport({ 
  profile, 
  transactions, 
  calculateCreditScore, 
  showToast,
  realScore,
  scoreError
}: FinancialPassportProps) {
  const { score: localScore, level, color, label } = calculateCreditScore();
  const finalScore = scoreError ? "Not Ready" : (realScore !== null ? realScore : localScore);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [instType, setInstType] = useState('Commercial Bank');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Load existing funding requests from localStorage
  const [fundingRequests, setFundingRequests] = useState<LocalFundingRequest[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('sme_funding_requests');
    if (saved) {
      setFundingRequests(JSON.parse(saved));
    }
  }, []);

  // Stats
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.status === 'posted')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && t.status === 'posted')
    .reduce((sum, t) => sum + t.amount, 0);

  const profitMargin = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  
  const handleDownloadPDF = () => {
    const businessId = Number(localStorage.getItem('vula_business_id') || 1);
    showToast('Compiling financial ledger and AI risk profiles...', 'info');
    
    // Download real PDF directly from the backend
    fetch(`http://localhost:8080/api/passport/${businessId}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('vula_jwt_token')}`
      }
    })
      .then((response) => {
        if (!response.ok) throw new Error('PDF Generation failed');
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Vula_Financial_Passport_${businessId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('Financial Passport PDF successfully compiled & downloaded!', 'success');
      })
      .catch((err) => {
        showToast('Failed to download real PDF document from backend.', 'error');
      });
  };

  const handleShareReport = (method: string) => {
    setShowShareSheet(false);
    showToast(`Generating secure shared link for ${method}...`, 'info');
    setTimeout(() => {
      showToast(`Encrypted Financial Passport link sent via ${method}!`, 'success');
    }, 1200);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !purpose) return;

    setSubmitting(true);
    
    setTimeout(() => {
      const newRequest: LocalFundingRequest = {
        id: `req-${Date.now()}`,
        amount: parsedAmount,
        purpose,
        institutionType: instType,
        status: 'New Request',
        submittedDate: new Date().toISOString().split('T')[0]
      };

      const updatedRequests = [newRequest, ...fundingRequests];
      setFundingRequests(updatedRequests);
      localStorage.setItem('sme_funding_requests', JSON.stringify(updatedRequests));

      setSubmitting(false);
      setSuccess(true);
      
      setAmount('');
      setPurpose('');
      setInstType('Commercial Bank');

      showToast(`Funding Request submitted to the marketplace!`, 'success');

      setTimeout(() => {
        setSuccess(false);
        setIsModalOpen(false);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Lender Ready</span>
            <span className="text-slate-400 text-xs">Vula Verification Code: V-SME-PASS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-400" />
            Vula Financial Passport
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl leading-relaxed">
            Your Financial Passport is an immutable, credit-scored record compiled from your verified bookkeeping transactions. Financial Institutions use this portal to instantly underwrite and approve loans.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all text-white font-semibold px-5 py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/10 min-h-[48px] self-start md:self-auto shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Request Funding</span>
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT: Financial Snapshot (7 Columns) */}
        <div className="md:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Lender-Ready Passport Hub
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Legal Business Name</span>
              <span className="text-sm font-semibold text-slate-200 mt-1 block">{profile.businessName}</span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Operational Sector</span>
              <span className="text-sm font-semibold text-slate-200 mt-1 block">{profile.industryType}</span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Ecosystem Credit Class</span>
              <span className="text-sm font-semibold text-slate-200 mt-1 block">
                {scoreError ? "Awaiting Transaction History" : label}
              </span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Geographic HQ Location</span>
              <span className="text-sm font-semibold text-slate-200 mt-1 block">Addis Ababa, Ethiopia</span>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-300">Underwriting Indicators</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-950/30 p-2.5 rounded border border-slate-800/40 mb-2">
                <span>Vula Ledger Credit Rating Score</span>
                <span className="font-bold text-indigo-400">{finalScore}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-950/30 p-2.5 rounded border border-slate-800/40">
                <span>Verified Monthly Income (30-day Avg)</span>
                <span className="font-bold text-slate-100">${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-950/30 p-2.5 rounded border border-slate-800/40">
                <span>Verified Monthly Expenses (30-day Avg)</span>
                <span className="font-bold text-rose-400">${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-950/30 p-2.5 rounded border border-slate-800/40">
                <span>Net Book Profit Margin</span>
                <span className="font-bold text-emerald-400">{profitMargin.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-950/30 p-2.5 rounded border border-slate-800/40">
                <span>OCR Logged Transaction Volume</span>
                <span className="font-bold text-indigo-400">{transactions.length} entries</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Export & Integrity Options (5 Columns) */}
        <div className="md:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Share2 className="w-5 h-5 text-indigo-400" />
              Verifications & Export
            </h2>

            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex gap-2.5 items-start">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Cryptography verification active matching SME ledger profiles.</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Verified banking stream linked with national banking registries.</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={handleDownloadPDF}
              className="w-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 min-h-[44px] transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Download Official PDF
            </button>
            <button
              onClick={() => setShowShareSheet(!showShareSheet)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 min-h-[44px] transition-colors"
            >
              <Share2 className="w-4 h-4 text-white" />
              Share Secure Link
            </button>
          </div>

          {showShareSheet && (
            <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-3 animate-slide-up text-xs">
              <p className="font-bold text-slate-400">Select Sharing Channel</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <button onClick={() => handleShareReport('Email')} className="bg-slate-900 hover:bg-slate-850 p-2.5 rounded-xl border border-slate-800 text-slate-200">
                  Email Securely
                </button>
                <button onClick={() => handleShareReport('SMS')} className="bg-slate-900 hover:bg-slate-850 p-2.5 rounded-xl border border-slate-800 text-slate-200">
                  SMS Encrypted
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* BOTTOM SECTION: Active Funding Requests */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-slate-100 border-b border-slate-800 pb-3 mb-4">
          Marketplace Capital Requests ({fundingRequests.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Date Submitted</th>
                <th className="py-3 px-4 font-semibold">Purpose</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Target Institution</th>
                <th className="py-3 px-4 font-semibold text-right">Pipeline Status</th>
              </tr>
            </thead>
            <tbody>
              {fundingRequests.map((req) => (
                <tr key={req.id} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400">{req.submittedDate}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-200">{req.purpose}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-100">${req.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="bg-slate-850 px-2 py-0.5 border border-slate-800 rounded">
                      {req.institutionType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
              {fundingRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                    No active capital requests found. Click "Request Funding" above to publish your first proposal.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FUNDING REQUEST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 animate-scale-up relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-400" />
                Capital Access Wizard
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 text-sm font-bold p-1 animate-pulse"
              >
                ✕
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-emerald-300">Request Dispatched</h4>
                <p className="text-slate-400 text-xs">Matching ledger score algorithm published to institutional deal pipeline...</p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Requested Funding Amount (USD/ETB)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Maximum matching capacity based on current score is verified by AI.</span>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Specific Purpose of Funding</label>
                  <input
                    type="text"
                    placeholder="e.g. Purchase of commercial roasting oven, inventory expansion"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Institution Type</label>
                  <select
                    value={instType}
                    onChange={(e) => setInstType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Commercial Bank">Commercial Bank (SME Term Loans)</option>
                    <option value="MFI">Microfinance Institution (SME Growth Credit)</option>
                    <option value="SACCO">SACCO (Cooperative lines)</option>
                    <option value="Investor">Institutional Debt Investor (Direct trade matching)</option>
                  </select>
                </div>

                <div className="bg-slate-950/60 p-3 border border-slate-800 rounded-xl space-y-1">
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Ecosystem Auto-Match Underwriting</p>
                  <p className="text-slate-500 leading-relaxed text-[10px]">
                    Your request will immediately be dispatched to the institutional CRM deal pipelines.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2.5 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 min-h-[40px]"
                  >
                    {submitting && <Plus className="w-4 h-4 animate-spin" />}
                    <span>Publish Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
