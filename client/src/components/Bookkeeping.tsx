import React, { useState, useRef } from 'react';
import { Transaction, ExtractedData } from '../types';
import { uploadReceiptOcr, createTransactionManual } from '../api';
import { 
  FileText, UploadCloud, Search, Trash2, Edit2, Plus, X, 
  Check, Loader2, Filter, AlertCircle, TrendingUp, TrendingDown, RefreshCw 
} from 'lucide-react';

interface BookkeepingProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

export default function Bookkeeping({ transactions, setTransactions, showToast }: BookkeepingProps) {
  // OCR simulator state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Manual & Edit Transaction state
  const [showManualModal, setShowManualModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Form Fields
  const [formVendor, setFormVendor] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Marketing');
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [formReference, setFormReference] = useState('');
  const [formProofSource, setFormProofSource] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const businessId = Number(localStorage.getItem('vula_business_id') || 1);
      
      setIsUploading(true);
      setUploadProgress(20);
      showToast(`Uploading receipt ${file.name} to Gemini AI OCR...`, 'info');

      try {
        setUploadProgress(60);
        const data = await uploadReceiptOcr(businessId, file);
        setUploadProgress(100);
        
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
        showToast('Gemini successfully parsed and verified the receipt!', 'success');
      } catch (err: any) {
        showToast(err.message || 'AI receipt extraction failed. Please try again.', 'error');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  // Save the OCR or Manual/Edit transaction
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVendor.trim()) {
      showToast('Vendor/Client name is required', 'error');
      return;
    }
    if (!formAmount || isNaN(Number(formAmount)) || Number(formAmount) <= 0) {
      showToast('Please enter a valid amount greater than zero', 'error');
      return;
    }

    if (isEditing && editingId) {
      // Edit mode
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingId
            ? {
                ...t,
                vendor: formVendor,
                amount: parseFloat(formAmount),
                category: formCategory,
                type: formType,
                date: formDate,
              }
            : t
        )
      );
      showToast('Transaction updated successfully!', 'success');
    } else {
      // Manual Add with Backend integration
      const businessId = Number(localStorage.getItem('vula_business_id') || 1);
      createTransactionManual({
        businessId,
        type: formType.toUpperCase(),
        amount: parseFloat(formAmount),
        category: formCategory,
        vendor: formVendor,
        description: 'Manual Entry: ' + formVendor,
        transactionDate: formDate,
        transactionReference: formReference || undefined,
        proofSource: formProofSource || undefined
      }).then((data) => {
        const newTx: Transaction = {
          id: data.id.toString(),
          vendor: data.vendor,
          amount: data.amount,
          category: data.category,
          type: data.type.toLowerCase() as 'income' | 'expense',
          date: data.transactionDate,
          status: 'posted'
        };
        setTransactions((prev) => [newTx, ...prev]);
        showToast('New transaction posted to backend ledger!', 'success');
      }).catch((err: any) => {
        showToast(err.message || 'Failed to save transaction to backend', 'error');
      });
    }

    // Reset Form
    resetForm();
  };

  const resetForm = () => {
    setFormVendor('');
    setFormAmount('');
    setFormCategory('Marketing');
    setFormType('expense');
    setFormDate(new Date().toISOString().substring(0, 10));
    setFormReference('');
    setFormProofSource('');
    setShowManualModal(false);
    setIsEditing(false);
    setEditingId(null);
  };

  // Edit action
  const startEdit = (t: Transaction) => {
    setFormVendor(t.vendor);
    setFormAmount(t.amount.toString());
    setFormCategory(t.category);
    setFormType(t.type);
    setFormDate(t.date);
    setEditingId(t.id);
    setIsEditing(true);
    setShowManualModal(true);
  };

  // Delete action
  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaction removed from ledger', 'info');
  };

  // Confirm OCR Post
  const handleConfirmOCR = () => {
    if (extractedData) {
      const newTx: Transaction = {
        id: Math.random().toString(36).substring(2, 9),
        vendor: extractedData.vendor,
        amount: extractedData.amount,
        category: extractedData.category,
        type: extractedData.type,
        date: extractedData.date,
        status: 'posted',
      };
      setTransactions((prev) => [newTx, ...prev]);
      setShowPreviewModal(false);
      setExtractedData(null);
      showToast('OCR transaction validated & posted!', 'success');
    }
  };

  // Filtering + Searching logic
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && t.type === filterType;
  });

  return (
    <div className="p-4 space-y-5 select-none pb-24 relative">
      
      {/* 1. RECEIPTS / OCR CARD PANEL */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-fin-success" />
            AI Document Reader (OCR)
          </h3>
          <p className="text-[11px] text-slate-400">Instantly convert receipt photos or invoices into financial records</p>
        </div>

        {/* Upload tap target / Drag and drop container */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*,.pdf" 
          className="hidden" 
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full h-32 border-2 border-dashed border-slate-800 hover:border-fin-success/50 bg-slate-950/50 hover:bg-slate-900/50 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all duration-200 group min-h-[128px]"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-7 h-7 text-fin-success animate-spin" />
              <div className="w-48 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850">
                <div 
                  className="bg-fin-success h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-fin-success animate-pulse">AI Extracting Invoice Data ({uploadProgress}%)</span>
            </div>
          ) : (
            <>
              <div className="w-11 h-11 bg-slate-900/80 group-hover:bg-fin-success/20 rounded-full flex items-center justify-center border border-slate-850 group-hover:border-fin-success/20 transition-colors">
                <UploadCloud className="w-5.5 h-5.5 text-slate-400 group-hover:text-fin-success" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold text-slate-200 block">Tap to upload receipt or invoice</span>
                <span className="text-[10px] text-slate-400">Supports PNG, JPG, PDF up to 10MB</span>
              </div>
            </>
          )}
        </button>

      </div>

      {/* 2. TRANSACTION LEDGER SECTION */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white">Financial Transaction Ledger</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-850">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* SEARCH AND FILTERING PANEL */}
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vendor, tag..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-850 focus:border-fin-success rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-white min-h-[44px]"
            />
          </div>

          <div className="flex bg-slate-900 border border-slate-850 p-1 rounded-xl">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg transition-all duration-150 ${
                  filterType === type
                    ? 'bg-slate-800 text-fin-success font-extrabold border border-slate-750'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* TRANSACTIONS LIST */}
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/30 border border-slate-900 rounded-3xl">
              <AlertCircle className="w-7 h-7 text-slate-600 mx-auto mb-2" />
              <span className="text-xs font-bold text-slate-400 block">No transactions found</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Adjust filters or upload a document to begin</p>
            </div>
          ) : (
            filteredTransactions.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-850/60 p-3.5 rounded-2xl flex items-center justify-between gap-4 transition-all duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                    t.type === 'income'
                      ? 'bg-fin-success/20 border-fin-success/50 text-fin-success'
                      : 'bg-slate-950 border-slate-850 text-slate-400'
                  }`}>
                    {t.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-white block truncate">{t.vendor}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded-md uppercase">
                        {t.category}
                      </span>
                      <span className="text-[9px] text-slate-500 font-semibold">{t.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-extrabold ${
                    t.type === 'income' ? 'text-fin-success' : 'text-slate-200'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>

                  {/* Actions (Interactive quick-access edit/delete icons) */}
                  <div className="flex items-center gap-1 border-l border-slate-850 pl-2">
                    <button
                      onClick={() => startEdit(t)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 hover:bg-fin-danger/10 text-slate-400 hover:text-fin-danger rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. INLINE FLOATING ACTION BUTTON (FAB) TO ADD MANUAL TRANSACTION */}
      <button
        onClick={() => {
          setIsEditing(false);
          setEditingId(null);
          setShowManualModal(true);
        }}
        className="fixed bottom-24 right-6 sm:absolute sm:bottom-4 sm:right-4 w-12 h-12 bg-fin-success hover:bg-fin-success rounded-full flex items-center justify-center text-slate-950 shadow-lg shadow-fin-success/20 active:scale-95 transition-all z-40 cursor-pointer border border-fin-success/20 min-h-[48px] min-w-[48px]"
        title="Add Transaction Manually"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* 4. MODAL A: AUTOMATIC TRANSACTION EXTRACTION PREVIEW */}
      {showPreviewModal && extractedData && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col justify-end p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 max-w-md mx-auto w-full shadow-2xl">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-850">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-fin-success/10 flex items-center justify-center text-fin-success border border-fin-success/40">
                  <Check className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Review AI Extraction</h4>
              </div>
              <button 
                onClick={() => {
                  setShowPreviewModal(false);
                  setExtractedData(null);
                }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Check the fields scanned by our OCR model. Modify fields directly if they need corrections.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Vendor / Source</label>
                <input
                  type="text"
                  value={extractedData.vendor}
                  onChange={(e) => setExtractedData({ ...extractedData, vendor: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    value={extractedData.amount}
                    onChange={(e) => setExtractedData({ ...extractedData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Type</label>
                  <select
                    value={extractedData.type}
                    onChange={(e) => setExtractedData({ ...extractedData, type: e.target.value as 'income' | 'expense' })}
                    className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none min-h-[44px]"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Category</label>
                <input
                  type="text"
                  value={extractedData.category}
                  onChange={(e) => setExtractedData({ ...extractedData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setExtractedData(null);
                  showToast('AI transaction draft discarded', 'info');
                }}
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold py-2.5 rounded-xl text-xs min-h-[44px]"
              >
                Discard
              </button>
              <button
                onClick={handleConfirmOCR}
                className="flex-1 bg-fin-success hover:bg-fin-success text-slate-950 font-bold py-2.5 rounded-xl text-xs min-h-[44px] shadow-lg shadow-fin-success/15"
              >
                Confirm & Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL B: MANUAL ADD / EDIT TRANSACTION */}
      {showManualModal && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm z-50 flex flex-col justify-end p-4">
          <form onSubmit={handleSaveTransaction} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 max-w-md mx-auto w-full shadow-2xl">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-850">
              <h4 className="font-extrabold text-sm text-white">
                {isEditing ? 'Edit Transaction Ledger' : 'Manually Log Income/Expense'}
              </h4>
              <button 
                type="button"
                onClick={resetForm}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Type Switcher */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-855">
                  <button
                    type="button"
                    onClick={() => setFormType('income')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      formType === 'income'
                        ? 'bg-fin-success text-slate-950'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Income (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('expense')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      formType === 'expense'
                        ? 'bg-slate-800 text-slate-100 border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Expense (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Vendor / Client</label>
              <input
                type="text"
                required
                value={formVendor}
                onChange={(e) => setFormVendor(e.target.value)}
                placeholder="e.g. Meta Platforms (Ads)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-850 focus:border-fin-success rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-fin-success/20 text-white min-h-[44px]"
              />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="250.00"
                    className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-fin-success min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-fin-success min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Categorical Tag</label>
                {!isCustomCategory ? (
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomCategory(true);
                        setFormCategory('');
                      } else {
                        setFormCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-fin-success min-h-[44px]"
                  >
                    <option value="Sales Revenue">Sales Revenue</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Hosting & SaaS">Hosting & SaaS</option>
                    <option value="Rent & Utilities">Rent & Utilities</option>
                    <option value="Meals & Entertainment">Meals & Entertainment</option>
                    <option value="Supplies & Equipment">Supplies & Equipment</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Sales">Sales</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Rent">Rent</option>
                    <option value="CUSTOM">+ Add Custom Category...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type custom category..."
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      required
                      className="flex-1 bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-fin-success min-h-[44px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(false);
                        setFormCategory('Marketing');
                      }}
                      className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700"
                    >
                      List
                    </button>
                  </div>
                )}
              </div>

              {/* Optional verification references block */}
              {!isEditing && (
                <div className="grid grid-cols-2 gap-3 border-t border-slate-850 pt-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Transaction Ref ID (Optional)</label>
                    <input
                      type="text"
                      value={formReference}
                      onChange={(e) => setFormReference(e.target.value)}
                      placeholder="e.g. FT261203NBTN"
                      className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-fin-success min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Institution Source (Optional)</label>
                    <input
                      type="text"
                      value={formProofSource}
                      onChange={(e) => setFormProofSource(e.target.value)}
                      placeholder="e.g. CBE or Telebirr"
                      className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-fin-success min-h-[44px]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 font-bold py-2.5 rounded-xl text-xs min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-fin-success hover:bg-fin-success text-slate-950 font-bold py-2.5 rounded-xl text-xs min-h-[44px] shadow-lg shadow-fin-success/15"
              >
                {isEditing ? 'Save Changes' : 'Confirm & Post'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
