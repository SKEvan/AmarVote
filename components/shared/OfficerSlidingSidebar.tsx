"use client";

import { useState } from 'react';
import { Menu, X, Home, AlertTriangle, Vote, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OfficerSlidingSidebarProps {
  onReportIncident: () => void;
  onSubmitVotes: () => void;
  voteSubmissionEnabled: boolean;
  votesAlreadySubmitted: boolean;
  submittedIncidentsCount?: number;
}

export default function OfficerSlidingSidebar({
  onReportIncident,
  onSubmitVotes,
  voteSubmissionEnabled,
  votesAlreadySubmitted,
  submittedIncidentsCount = 0
}: OfficerSlidingSidebarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div>
      {/* Hamburger Menu Button */}
      <button 
        onClick={() => setOpen(true)} 
        className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
      >
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998]" 
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sliding Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out z-[9999]`}
      >
        <div className="w-72 bg-white h-full shadow-2xl flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-white" />
              <h4 className="font-semibold text-white">Presiding Officer</h4>
            </div>
            <button 
              onClick={() => setOpen(false)} 
              className="p-1 rounded hover:bg-blue-500 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-3">
            {/* Report Incident Button */}
            <button 
              onClick={() => { 
                setOpen(false); 
                onReportIncident(); 
              }} 
              className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 flex items-center gap-3 shadow-sm transition-all"
            >
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Report Incident</div>
                <div className="text-xs text-red-100">Always available</div>
              </div>
              {submittedIncidentsCount > 0 && (
                <span className="ml-auto bg-white text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {submittedIncidentsCount}
                </span>
              )}
            </button>

            {/* Vote Submission Button */}
            <button 
              onClick={() => { 
                setOpen(false); 
                if (voteSubmissionEnabled && !votesAlreadySubmitted) {
                  onSubmitVotes(); 
                }
              }} 
              disabled={!voteSubmissionEnabled || votesAlreadySubmitted}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
                votesAlreadySubmitted 
                  ? 'bg-blue-50 border-2 border-blue-300 cursor-default'
                  : voteSubmissionEnabled 
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-sm' 
                    : 'bg-gray-100 border border-gray-300 cursor-not-allowed'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                votesAlreadySubmitted 
                  ? 'bg-blue-200'
                  : voteSubmissionEnabled 
                    ? 'bg-white/20' 
                    : 'bg-gray-200'
              }`}>
                <Vote className={`w-5 h-5 ${
                  votesAlreadySubmitted 
                    ? 'text-blue-600'
                    : voteSubmissionEnabled 
                      ? 'text-white' 
                      : 'text-gray-400'
                }`} />
              </div>
              <div>
                <div className={`text-sm font-semibold ${
                  votesAlreadySubmitted 
                    ? 'text-blue-700'
                    : voteSubmissionEnabled 
                      ? 'text-white' 
                      : 'text-gray-500'
                }`}>
                  {votesAlreadySubmitted 
                    ? 'Votes Submitted ✓' 
                    : 'Submit Vote Counts'}
                </div>
                <div className={`text-xs ${
                  votesAlreadySubmitted 
                    ? 'text-blue-600'
                    : voteSubmissionEnabled 
                      ? 'text-indigo-100' 
                      : 'text-gray-400'
                }`}>
                  {votesAlreadySubmitted 
                    ? 'Successfully recorded'
                    : voteSubmissionEnabled 
                      ? 'Voting period ended' 
                      : 'Locked during voting'}
                </div>
              </div>
            </button>

          </nav>

          {/* Footer Info */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className={`w-2 h-2 rounded-full ${voteSubmissionEnabled ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
              <span>
                {voteSubmissionEnabled 
                  ? 'Voting period ended - Submit now' 
                  : 'Voting in progress'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
