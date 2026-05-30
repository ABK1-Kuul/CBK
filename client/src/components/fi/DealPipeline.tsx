import React from 'react';
import { useAppState } from '../../context/AppContext';
import { FundingRequest, FundingRequestStatus } from '../../types';
import { ArrowRight, ChevronRight, Coins, ShieldAlert, FileText, CheckCircle2, UserCheck } from 'lucide-react';

export const DealPipeline: React.FC = () => {
  const { fundingRequests, updateFundingRequestStatus } = useAppState();

  const stages: FundingRequestStatus[] = ['New Request', 'Under Review', 'Approved', 'Funded', 'Closed'];

  const getStageRequests = (stage: FundingRequestStatus) => {
    return fundingRequests.filter(req => req.status === stage);
  };

  const getNextStage = (current: FundingRequestStatus): FundingRequestStatus | null => {
    const idx = stages.indexOf(current);
    if (idx !== -1 && idx < stages.length - 1) {
      return stages[idx + 1];
    }
    return null;
  };

  const getStageHeaderBg = (stage: FundingRequestStatus) => {
    switch (stage) {
      case 'New Request': return 'border-blue-500/30 text-blue-400 bg-blue-950/10';
      case 'Under Review': return 'border-amber-500/30 text-amber-400 bg-amber-950/10';
      case 'Approved': return 'border-purple-500/30 text-purple-400 bg-purple-950/10';
      case 'Funded': return 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10';
      default: return 'border-slate-800 text-slate-400 bg-slate-900/10';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Coins className="w-6 h-6 text-indigo-400" />
          Deal Pipeline CRM
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage capital request processes in real-time. Advancing a borrower to **Funded** updates decentralized ledger records and triggers capital payout.
        </p>
      </div>

      {/* Kanban Board Layout */}
      {/* Horizontally scrolling row on desktop, vertically stacking list on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageRequests = getStageRequests(stage);
          const nextStage = getNextStage(stage);

          return (
            <div
              key={stage}
              className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 flex flex-col space-y-4 min-w-[240px] lg:min-h-[500px]"
            >
              {/* Stage Title Header */}
              <div className={`border p-2.5 rounded-xl flex justify-between items-center text-xs font-bold ${getStageHeaderBg(stage)}`}>
                <span>{stage}</span>
                <span className="bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-slate-300 font-extrabold">
                  {stageRequests.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[420px] lg:max-h-[600px] pr-1">
                {stageRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700/60 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h4 className="font-extrabold text-slate-200 text-xs leading-snug">{req.smeBusinessName}</h4>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed italic">
                        "{req.purpose}"
                      </p>
                    </div>

                    <div className="border-t border-slate-800/60 pt-2.5 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Amount</p>
                        <p className="text-xs font-black text-slate-200 mt-0.5">{(req.amount).toLocaleString()} ETB</p>
                      </div>
                      
                      {/* Active advance button */}
                      {nextStage && (
                        <button
                          onClick={() => updateFundingRequestStatus(req.id, nextStage)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg p-1.5 transition-all text-xs font-bold flex items-center justify-center min-h-[30px] min-w-[30px]"
                          title={`Advance to ${nextStage}`}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}

                      {!nextStage && (
                        <span className="text-[9px] bg-slate-950 border border-slate-800/80 text-slate-500 font-bold px-2 py-1 rounded">
                          Closed
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {stageRequests.length === 0 && (
                  <div className="text-center py-8 text-slate-600 italic text-[11px] border border-dashed border-slate-900 rounded-xl">
                    No deals in this stage
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
