import React, { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { Shield, Sparkles, Receipt, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle, TrendingUp, CheckCircle, HelpCircle } from 'lucide-react';

export const SMEDashboard: React.FC = () => {
  const {
    currentSME,
    transactions,
    addSMETransaction,
    isScanning,
    scanType
  } = useAppState();

  const [txType, setTxType] = useState<'Income' | 'Expense'>('Income');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [desc, setDesc] = useState<string>('');
  const [showScanForm, setShowScanForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!currentSME) {
    return <div className="text-center p-12 text-slate-400">Loading SME Profile...</div>;
  }

  // Calculate circular stroke values
  const score = currentSME.trustScore;
  const maxScore = 850;
  const minScore = 300;
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
    if (!amount || !category) return;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;

    await addSMETransaction(txType, category, numericAmount, desc || `${txType} transaction`);
    
    setSuccessMsg(`Ocr Scan Successful! Simulated Trust Score updated. Added ${numericAmount.toLocaleString()} ETB to ledger.`);
    setAmount('');
    setCategory('');
    setDesc('');
    setShowScanForm(false);

    setTimeout(() => {
      setSuccessMsg(null);
    }, 5000);
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
            Active Profile: <span className="text-slate-200 font-semibold">{currentSME.businessName}</span> • Owner: {currentSME.ownerName}
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs bg-slate-900 border border-slate-800 p-2 rounded-lg self-start md:self-auto">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Ledger Connected: Vula AI Node v2.4</span>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl flex items-start gap-3 text-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-200">Transaction Processed</p>
            <p className="mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Grid: Dual-Scan & Circular Credit Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Dual-Scan & Ledger Controls (7 Columns on large screens) */}
        <div className="lg:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-slate-100">Receipt OCR Scanner Hub</h2>
              </div>
              <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Mobile-Optimized</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Scan accounts receivable (Income) and vendor invoices (Expenses). The Vula AI Engine parses metadata to instantly adjust cash-flow ratios and rebuild your lender passport.
            </p>

            {/* Split Action Scanning Blocks */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => {
                  setTxType('Income');
                  setShowScanForm(true);
                }}
                disabled={isScanning}
                className="flex flex-col items-center justify-center p-5 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl transition-all text-center group min-h-[120px]"
              >
                {isScanning && scanType === 'Income' ? (
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                ) : (
                  <ArrowUpRight className="w-8 h-8 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform mb-2" />
                )}
                <span className="text-sm font-semibold text-emerald-300">Scan Issued Invoice</span>
                <span className="text-[10px] text-slate-500 mt-1">Simulate Income Receipt</span>
              </button>

              <button
                onClick={() => {
                  setTxType('Expense');
                  setShowScanForm(true);
                }}
                disabled={isScanning}
                className="flex flex-col items-center justify-center p-5 bg-rose-950/10 hover:bg-rose-950/20 border border-rose-500/10 hover:border-rose-500/30 rounded-xl transition-all text-center group min-h-[120px]"
              >
                {isScanning && scanType === 'Expense' ? (
                  <RefreshCw className="w-8 h-8 text-rose-400 animate-spin mb-2" />
                ) : (
                  <ArrowDownRight className="w-8 h-8 text-rose-400 group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-transform mb-2" />
                )}
                <span className="text-sm font-semibold text-rose-300">Scan Paid Receipt</span>
                <span className="text-[10px] text-slate-500 mt-1">Simulate Expense Receipt</span>
              </button>
            </div>
          </div>

          {/* Expanded Scanning Modal Form within dashboard */}
          {showScanForm && (
            <form onSubmit={handleScanSubmit} className="bg-slate-950 border border-slate-800 p-4 rounded-xl mt-4 space-y-3 animate-slide-up">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  OCR Simulation: {txType === 'Income' ? 'Accounts Receivable' : 'Accounts Payable'}
                </span>
                <button type="button" onClick={() => setShowScanForm(false)} className="text-slate-500 hover:text-slate-300 text-xs">
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Receipt Amount (ETB)</label>
                  <input
                    type="number"
                    placeholder="e.g. 75000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Category / Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. Bulk Coffee, Machinery, Fuel"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Additional receipt details..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm px-3 py-2 rounded focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isScanning}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded text-xs transition-colors flex items-center justify-center gap-1 min-h-[40px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Execute Receipt Parsing Scanner</span>
              </button>
            </form>
          )}

          {/* Quick Ledger Stats footer */}
          <div className="grid grid-cols-3 gap-2 border-t border-slate-800/60 pt-4 mt-6 text-center">
            <div>
              <p className="text-[10px] text-slate-500">Gross Monthly Rev</p>
              <p className="text-xs font-semibold text-emerald-400 mt-1">{(currentSME.monthlyRevenue).toLocaleString()} ETB</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Monthly Expenses</p>
              <p className="text-xs font-semibold text-rose-400 mt-1">{(currentSME.monthlyExpenses).toLocaleString()} ETB</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500">Stability Margin</p>
              <p className="text-xs font-semibold text-slate-300 mt-1">
                {((currentSME.profit / currentSME.monthlyRevenue) * 100).toFixed(0)}%
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT: Circular Credit Score & Risk Badge (5 Columns) */}
        <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-100">AI Credit Profile</h2>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getRiskBg(currentSME.riskLevel)}`}>
              Risk: {currentSME.riskLevel}
            </span>
          </div>

          {/* Custom SVG Circular Gauge */}
          <div className="flex flex-col items-center justify-center py-2 relative">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                {/* Animated Score Arc */}
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
              {/* Central Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">Trust Score</span>
                <span className="text-4xl font-extrabold tracking-tight text-slate-100 mt-0.5">{score}</span>
                <span className="text-[10px] text-slate-400 font-medium mt-1">/ 850 Max</span>
              </div>
            </div>

            {/* Account age label */}
            <div className="text-center mt-3 text-xs text-slate-400">
              Credit Age: <span className="text-slate-200 font-bold">{currentSME.monthsActive} Months</span> Active
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[10px] font-bold text-amber-400 tracking-wide uppercase">AI Improvement Strategy</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {getImprovementTips(score).map((tip, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <span className="text-amber-500 select-none font-bold text-sm shrink-0 leading-none">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* BOTTOM Section: Interactive Recent Scanned Transactions Log */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Verified Ledger Transactions</h2>
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
                <th className="py-3 px-4 font-semibold">Ref Category</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions
                .filter(t => t.smeId === currentSME.id)
                .map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-400">{tx.date}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${
                        tx.type === 'Income' 
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/10' 
                          : 'bg-rose-950/10 text-rose-400 border-rose-500/10'
                      }`}>
                        {tx.type === 'Income' ? '+' : '-'} {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 italic max-w-xs truncate">{tx.description}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-100">
                      {tx.amount.toLocaleString()} ETB
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 bg-emerald-950/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                        Committed
                      </span>
                    </td>
                  </tr>
                ))}
              {transactions.filter(t => t.smeId === currentSME.id).length === 0 && (
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
};
