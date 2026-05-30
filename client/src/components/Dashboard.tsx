import React, { useState, useRef } from 'react';
import { BusinessProfile, Transaction } from '../types';
import { uploadReceiptOcr, getCreditScore, getFinancialSummary } from '../api';
import { Shield, Sparkles, Receipt, ArrowUpRight, ArrowDownRight, RefreshCw, CheckCircle, MapPin, Sparkle, UploadCloud, Loader2 } from 'lucide-react';

interface DashboardProps {
  profile: BusinessProfile;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  setActiveTab: (tab: string) => void;
  calculateCreditScore: () => {
    score: number;
    level: 'Low' | 'Medium' | 'High';
    color: string;
    label: string;
    breakdown: { longevity: number; ledger: number; revenue: number };
  };
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function Dashboard({
  profile,
  transactions,
  setTransactions,
  setActiveTab,
  calculateCreditScore,
  showToast
}: DashboardProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<'income' | 'expense' | null>(null);
  const [showScanForm, setShowScanForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [vendor, setFormVendor] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [realScore, setRealScore] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<string>('MEDIUM');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);

  React.useEffect(() => {
    const businessId = Number(localStorage.getItem('vula_business_id') || 1);
    getCreditScore(businessId)
      .then((data) => {
        setRealScore(data.score);
        setRiskLevel(data.riskLevel);
        setScoreError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard score:', err);
        setScoreError(err.message || 'Alternative Credit Scoring requires transaction history.');
      });

    getFinancialSummary(businessId)
      .then((data) => {
        setSummaryData(data);
      })
      .catch((err) => console.error('Failed to fetch dashboard summary:', err));
  }, [transactions]);

  const handleRealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const businessId = Number(localStorage.getItem('vula_business_id') || 1);
      
      setIsScanning(true);
      showToast(`Uploading receipt ${file.name} to Gemini AI OCR...`, 'info');

      try {
        const data = await uploadReceiptOcr(businessId, file, scanType || undefined);
        
        const newTx: Transaction = {
          id: data.id.toString(),
          vendor: data.vendor,
          date: data.transactionDate,
          amount: data.amount,
          type: data.type.toLowerCase() as 'income' | 'expense',
          category: data.category,
          status: 'posted'
        };

        setTransactions((prev) => [newTx, ...prev]);
        showToast(`Gemini successfully verified and posted transaction of ${data.amount.toLocaleString()} ETB!`, 'success');
        setShowScanForm(false);
      } catch (err: any) {
        showToast(err.message || 'AI receipt extraction failed. Please try again.', 'error');
      } finally {
        setIsScanning(false);
      }
    }
  };

  // Calculate circular stroke values
  const { score: localScore, level: localLevel, color: localColor, label: localLabel } = calculateCreditScore();
  const score = realScore !== null ? realScore : localScore;
  const level = realScore !== null ? (riskLevel === 'LOW' ? 'Low' : riskLevel === 'MEDIUM' ? 'Medium' : 'High') : localLevel;
  const label = realScore !== null ? `${level} Credit Risk (Audited)` : localLabel;

  const hasEnoughTransactions = transactions.length >= 5;
  const transactionCount = transactions.length;

  const maxScore = 900;
  const minScore = 100;
  // credit score percentage mapping
  const percentage = ((score - minScore) / (maxScore - minScore)) * 100;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 700) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 550) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const getRiskBg = (risk: string) => {
    if (risk === 'Low') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (risk === 'Medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  const getImprovementTips = (score: number) => {
    if (score >= 700) {
      return [
        'Maintain current transaction volume to secure premium 10.5% interest products.',
        'Consider consolidating short-term supplier debt through structural ledger-backed inventory financing.'
      ];
    }
    if (score >= 550) {
      return [
        'Scan at least 3 customer receipts/invoices weekly to demonstrate steady monthly cash inflow.',
        'Reduce cash expenses by channeling vendor payments digitally through the Vula Ledger ledger tool.'
      ];
    }
    return [
      'Crucial: Link your active commercial bank statement to verify transactions.',
      'Scan all outstanding receipts. The credit model requires 12 months consecutive active cashflow history.'
    ];
  };

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !vendor) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    setIsScanning(true);
    showToast(`Initializing Vula AI OCR Receipt Scanner...`, 'info');

    // Simulate OCR scanning spinner
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      vendor,
      date: new Date().toISOString().substring(0, 10),
      amount: numericAmount,
      type: scanType || 'income',
      category,
      status: 'posted'
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsScanning(false);
    setShowScanForm(false);
    setAmount('');
    setCategory('');
    setFormVendor('');
    showToast(`Ocr Scan Successful! Ledger updated. Added ${numericAmount.toLocaleString()} USD/ETB to transactions.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Title Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100">
            Bookkeeping Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Active Profile: <span className="text-slate-200 font-semibold">{profile.businessName}</span> • Representative: {profile.email}
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs bg-slate-900 border border-slate-800 p-2 rounded-lg self-start md:self-auto">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Ledger Connected: Vula AI Node v2.4</span>
        </div>
      </div>

      {/* KPI Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Revenue (Audited)</span>
          <p className="text-xl font-extrabold text-white">
            ${summaryData ? summaryData.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[9px] text-emerald-400 font-medium block">CBE/Telebirr Inflows verified</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Expenses (Booked)</span>
          <p className="text-xl font-extrabold text-slate-200">
            ${summaryData ? summaryData.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[9px] text-rose-400 font-medium block">Audited invoice outlays</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Net Profit</span>
          <p className={`text-xl font-extrabold ${summaryData && summaryData.netProfit < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            ${summaryData ? summaryData.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
          </p>
          <span className="text-[9px] text-slate-400 font-medium block">Cumulative ledger profit</span>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Cash Flow Standing</span>
          <p className={`text-xl font-extrabold uppercase ${summaryData && summaryData.cashFlowStatus === 'NEGATIVE' ? 'text-rose-400' : 'text-emerald-400'}`}>
            {summaryData ? summaryData.cashFlowStatus : 'POSITIVE'}
          </p>
          <span className="text-[9px] text-indigo-400 font-medium block">24-hour liquidity assessment</span>
        </div>
      </div>

      {/* Grid: Dual-Scan & Circular Credit Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Dual-Scan & Ledger Controls (7 Columns on large screens) */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm sm:text-base font-bold text-slate-100">Receipt OCR Scanner Hub</h2>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Mobile-Optimized</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Scan accounts receivable (Income) and vendor invoices (Expenses). The Vula AI Engine parses metadata to instantly adjust cash-flow ratios and rebuild your lender passport.
            </p>

            {/* Split Action Scanning Blocks */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => {
                  setScanType('income');
                  setShowScanForm(true);
                }}
                disabled={isScanning}
                className="flex flex-col items-center justify-center p-5 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl transition-all text-center group min-h-[120px]"
              >
                {isScanning && scanType === 'income' ? (
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                ) : (
                  <ArrowUpRight className="w-8 h-8 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform mb-2" />
                )}
                <span className="text-sm font-semibold text-emerald-300">Scan Issued Invoice</span>
                <span className="text-[10px] text-slate-500 mt-1">Upload Income Receipt</span>
              </button>

              <button
                onClick={() => {
                  setScanType('expense');
                  setShowScanForm(true);
                }}
                disabled={isScanning}
                className="flex flex-col items-center justify-center p-5 bg-rose-950/10 hover:bg-rose-950/20 border border-rose-500/10 hover:border-rose-500/30 rounded-xl transition-all text-center group min-h-[120px]"
              >
                {isScanning && scanType === 'expense' ? (
                  <RefreshCw className="w-8 h-8 text-rose-400 animate-spin mb-2" />
                ) : (
                  <ArrowDownRight className="w-8 h-8 text-rose-400 group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-transform mb-2" />
                )}
                <span className="text-sm font-semibold text-rose-300">Scan Paid Receipt</span>
                <span className="text-[10px] text-slate-500 mt-1">Upload Expense Receipt</span>
              </button>
            </div>
          </div>

          {/* Expanded Scanning Modal Form within dashboard */}
          {showScanForm && (
            <div className="space-y-4 mt-4 animate-slide-up">
              
              {/* CARD 1: EXCLUSIVELY FOR AI OCR SCREENSHOT EXTRACTIONS */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    AI OCR Image Scanner (CBE & Telebirr)
                  </span>
                  <button type="button" onClick={() => setShowScanForm(false)} className="text-slate-500 hover:text-slate-300 text-xs">
                    Cancel
                  </button>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleRealFileUpload} 
                  accept="image/*,.pdf" 
                  className="hidden" 
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                  className="w-full h-28 border-2 border-dashed border-slate-800 hover:border-emerald-500 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all duration-150 group"
                >
                  {isScanning ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 animate-pulse">
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Analyzing Receipt via Gemini AI OCR...
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-7 h-7 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                      <span className="text-xs font-bold text-slate-200">Upload CBE/Telebirr Receipt Screenshot</span>
                      <span className="text-[10px] text-slate-500">Extracts sender, receiver, amounts, and transaction reference keys</span>
                    </>
                  )}
                </button>
              </div>

              {/* CARD 2: EXCLUSIVELY FOR MANUAL BOOKKEEPING ENTRIES */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Manual Ledger Record: {scanType === 'income' ? 'Income / CBE Credits' : 'Expense / CBE Debits'}
                  </span>
                </div>

                <form onSubmit={handleScanSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Receipt Amount</label>
                      <input
                        type="number"
                        placeholder="e.g. 1500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-1">Vendor / Client</label>
                      <input
                        type="text"
                        placeholder="e.g. Starbucks, Amazon, Stripe"
                        value={vendor}
                        onChange={(e) => setFormVendor(e.target.value)}
                        required
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Category / Reference</label>
                    {!isCustomCategory ? (
                      <select
                        value={category}
                        onChange={(e) => {
                          if (e.target.value === 'CUSTOM') {
                            setIsCustomCategory(true);
                            setCategory('');
                          } else {
                            setCategory(e.target.value);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">-- Choose Category --</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Sales">Sales</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Rent">Rent</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Hosting & SaaS">Hosting & SaaS</option>
                        <option value="CUSTOM">+ Add Custom Category...</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type custom category..."
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required
                          className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 text-sm px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomCategory(false);
                            setCategory('');
                          }}
                          className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700"
                        >
                          List
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isScanning}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-medium py-2 rounded text-xs transition-colors flex items-center justify-center gap-1 min-h-[40px]"
                  >
                    <span>Execute Manual Bookkeeping Log</span>
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* Quick Ledger Stats footer */}
          <div className="grid grid-cols-3 gap-2 border-t border-slate-800/60 pt-4 mt-6 text-center text-xs">
            <div>
              <p className="text-[10px] text-slate-500">Industry Sector</p>
              <p className="font-semibold text-slate-300 mt-1">{profile.industryType}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Total Scans</p>
              <p className="font-semibold text-slate-300 mt-1">{transactions.length} records</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Stability Rating</p>
              <p className="font-semibold text-amber-500 mt-1">
                {scoreError || transactions.length < 5 ? "Pending" : `${level} Risk`}
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT: AI Credit Profile */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm sm:text-base font-bold text-slate-100">
                AI Credit Profile
              </h2>
            </div>

            {hasEnoughTransactions && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getRiskBg(level)}`}
              >
                Risk: {level}
              </span>
            )}
          </div>

          {/* NO CREDIT SCORE YET */}
          {!hasEnoughTransactions ? (
            <>
              <div className="flex flex-col items-center justify-center py-2 relative">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="#1e293b"
                      strokeWidth="8"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                      Credit Score
                    </span>

                    <span className="text-4xl font-extrabold tracking-tight text-slate-500">
                      --
                    </span>

                    <span className="text-[10px] text-amber-400 mt-1">
                      Waiting for history
                    </span>
                  </div>
                </div>

                <div className="text-center mt-3 text-xs text-slate-400">
                  Credit Classification:
                  <span className="text-amber-400 font-bold ml-1">
                    Not Available
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[10px] font-bold text-amber-400 tracking-wide uppercase">
                    Credit Score Requirements
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    Minimum 5 verified transactions required.
                  </li>

                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    Upload Telebirr, CBE, Dashen, Awash or other payment proofs.
                  </li>

                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    Add income and expense records consistently.
                  </li>

                  <li className="flex gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    Current Transactions:
                    <span className="font-bold text-slate-100">
                      {transactionCount}/5
                    </span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* CREDIT SCORE AVAILABLE */}
              <div className="flex flex-col items-center justify-center py-2 relative">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="#1e293b"
                      strokeWidth="8"
                    />

                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                      Trust Score
                    </span>

                    <span className="text-4xl font-extrabold tracking-tight text-slate-100 mt-0.5">
                      {score}
                    </span>

                    <span className="text-[10px] text-slate-400 font-medium mt-1">
                      / 900 Max
                    </span>
                  </div>
                </div>

                <div className="text-center mt-3 text-xs text-slate-400">
                  Credit Classification:
                  <span className="text-slate-200 font-bold ml-1">
                    {label}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[10px] font-bold text-amber-400 tracking-wide uppercase">
                    AI Improvement Strategy
                  </span>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  {getImprovementTips(score).map((tip, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="text-amber-500 select-none font-bold text-sm shrink-0 leading-none">
                        •
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

      </div>

      {/* BOTTOM Section: Interactive Recent Scanned Transactions Log */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-100">Verified Ledger Transactions</h2>
            <p className="text-slate-400 text-xs mt-0.5">Scans approved by Vula OCR and committed to the decentralized registry.</p>
          </div>
          <div className="text-xs text-slate-500">
            Total Scanned: <span className="text-slate-200 font-bold">{transactions.length}</span> records
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Vendor / Client</th>
                <th className="py-3 px-4 font-semibold">Ref Category</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-slate-400">{tx.date}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-200">{tx.vendor}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-300">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${
                      tx.type === 'income' 
                        ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/10' 
                        : 'bg-rose-950/10 text-rose-400 border-rose-500/10'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'} {tx.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-100">
                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 bg-emerald-950/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      Committed
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                    No scanned invoices detected. Utilize the dual OCR scan buttons above to start compiling credit history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
