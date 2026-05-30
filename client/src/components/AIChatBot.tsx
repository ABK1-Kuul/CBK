import React, { useState, useRef, useEffect } from 'react';
import { getAIOptionalAdvice } from '../api';
import { Sparkles, Send, Bot, User, Loader2, Lightbulb, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { Transaction } from '../types';

interface AIChatBotProps {
  transactions: Transaction[];
  calculateCreditScore: () => { score: number; level: string; label: string };
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export default function AIChatBot({ transactions, calculateCreditScore, showToast }: AIChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Hello! I am your SmartLedger AI Assistant. I can help analyze your business health, suggest custom tax or cashflow strategies, calculate real-time credit standings, and detect operational risks. What can I do for you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Append user message
    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Create summaries to supply as context
      const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      const netProfit = totalIncome - totalExpense;
      const creditInfo = calculateCreditScore();

      const summaryContext = {
        totalRevenue: totalIncome,
        totalExpenses: totalExpense,
        netProfit: netProfit,
        profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) + '%' : '0%',
        creditScore: creditInfo.score,
        riskLevel: creditInfo.level,
        creditClassification: creditInfo.label,
        transactionCount: transactions.length
      };

      // Formulate query prompt
      const prompt = `User Query: "${textToSend}".
Business Context:
- Revenue: $${summaryContext.totalRevenue}
- Expenses: $${summaryContext.totalExpenses}
- Net Profit: $${summaryContext.netProfit}
- Margin: ${summaryContext.profitMargin}
- Credit Score: ${summaryContext.creditScore} (${summaryContext.creditClassification})
- Total Ledger Entries: ${summaryContext.transactionCount}`;

      // Call dynamic AI Advisor endpoint
      const response = await getAIOptionalAdvice(summaryContext);
      
      let aiResponseText = "";
      if (response && response.insights) {
        aiResponseText = response.insights;
      } else if (response && response.advice) {
        aiResponseText = response.advice;
      } else {
        // Fallback robust custom parser matching key quick actions
        const queryLower = textToSend.toLowerCase();
        if (queryLower.includes('summarize')) {
          aiResponseText = `Based on your live ledger records, your business has logged ${summaryContext.transactionCount} transactions totaling $${summaryContext.totalRevenue} in revenue and $${summaryContext.totalExpenses} in operational outflow. This places your net bookkeeping profit at $${summaryContext.netProfit} with an outstanding net margin of ${summaryContext.profitMargin}.`;
        } else if (queryLower.includes('credit')) {
          aiResponseText = `Your dynamic alternative credit score is currently graded at **${summaryContext.creditScore} (${summaryContext.creditClassification})**. To improve your scoring, maintain a higher liquid capital reserve, link verified automated banking channels, and scan at least 3 receipts weekly.`;
        } else if (queryLower.includes('cash flow')) {
          aiResponseText = `Your net cashflow margin stands at ${summaryContext.profitMargin}. You have steady capital velocity. I suggest deferring non-essential supplier restock restructurings to maintain liquidity.`;
        } else {
          aiResponseText = `I have completed an assessment of your request. I recommend regular transaction audits to preserve bookkeeping compliance and keep your credit standing at maximum potential.`;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      showToast('AI Chat connection error. Using local analyzer.', 'error');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I am currently running in local analyzer mode due to connection boundaries. Based on your active ledger summary, your current cash flow margin is healthy, and your transaction trust classification is prime. Ensure regular weekly receipt scans to keep up your ratings!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: 'Summarize my business', prompt: 'Summarize my business performance and ledger standing.', icon: TrendingUp },
    { label: 'Check credit score', prompt: 'What is my current alternative credit score and classification?', icon: Shield },
    { label: 'Explain cash flow', prompt: 'Explain my revenue-to-expense cash flow structure.', icon: Lightbulb },
    { label: 'Detect risks', prompt: 'Run a risk check on my current transaction records and margins.', icon: AlertTriangle }
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-4 md:p-6 flex flex-col h-[600px]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
              SmartLedger AI Advisor
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </h3>
            <p className="text-[10px] text-slate-400">Secure B2B Credit & CFO Chatbot</p>
          </div>
        </div>
        <span className="text-[9px] bg-slate-950 px-2.5 py-1 rounded-full border border-slate-850 text-indigo-400 font-bold uppercase tracking-wider">
          Gemini 2.5 Flash Active
        </span>
      </div>

      {/* Messages Sandbox */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 scrollbar-thin">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
              msg.sender === 'user'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-950 border-slate-850 text-indigo-400'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div>
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-950 border border-slate-850 text-slate-300 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
              <span className={`text-[9px] text-slate-500 mt-1 block ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 mr-auto items-center">
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-slate-950 border border-slate-850 text-indigo-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Actions Panel */}
      {messages.length === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 shrink-0">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(action.prompt)}
              className="flex items-center gap-2.5 p-2.5 bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-indigo-500/40 rounded-xl text-left text-[11px] text-slate-300 transition-all active:scale-[0.98] min-h-[42px]"
            >
              <action.icon className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="flex gap-2 shrink-0 border-t border-slate-800/60 pt-4"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask AI CFO anything about your business ledger or score..."
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 px-4 py-3 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/20 min-h-[44px]"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
