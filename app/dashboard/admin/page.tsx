'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ShieldIcon from '@/components/shared/ShieldIcon';
import UserProfileControls from '@/components/shared/UserProfileControls';
import SlidingSidebar from '@/components/shared/SlidingSidebar';
import NotificationBell from '@/components/shared/NotificationBell';
import ChartTooltip from '@/components/shared/ChartTooltip';
import { addAuditLog, AuditActions } from '@/lib/auditLog';
import { 
  LogOut, 
  FileText, 
  AlertTriangle, 
  MapPin, 
  TrendingUp,
  Map,
  BarChart3,
  Users,
  FileCheck,
  Network,
  Menu,
  X,
  Lock,
  Unlock,
  Vote
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [voteSubmissionEnabled, setVoteSubmissionEnabled] = useState(false);

  // Load vote submission status from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('voteSubmissionEnabled');
    if (stored !== null) {
      setVoteSubmissionEnabled(stored === 'true');
    }

    // Log dashboard access
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    addAuditLog(
      AuditActions.DASHBOARD_ACCESSED,
      'Admin accessed the main dashboard',
      userInfo.name || 'Admin'
    );
  }, []);

  // Toggle vote submission and save to localStorage
  const toggleVoteSubmission = () => {
    const newValue = !voteSubmissionEnabled;
    setVoteSubmissionEnabled(newValue);
    localStorage.setItem('voteSubmissionEnabled', String(newValue));
    
    // Log setting change
    const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
    addAuditLog(
      AuditActions.SETTINGS_CHANGED,
      `Vote submission ${newValue ? 'ENABLED' : 'DISABLED'} system-wide`,
      userInfo.name || 'Admin'
    );
    
    alert(newValue 
      ? 'Vote submission has been ENABLED. Presiding officers can now submit vote counts.' 
      : 'Vote submission has been DISABLED. Presiding officers cannot submit vote counts.'
    );
  };

  // State for reported incidents from officers
  const [officerIncidents, setOfficerIncidents] = useState<any[]>([]);

  // State for correction requests
  const [correctionRequest, setCorrectionRequest] = useState(false);
  const [correctionRequestMeta, setCorrectionRequestMeta] = useState<{
    officerName?: string;
    pollingCenterId?: string;
    pollingCenterName?: string;
    requestedAt?: string;
  } | null>(null);

  // Load incidents from localStorage
  useEffect(() => {
    const loadIncidents = () => {
      const stored = localStorage.getItem('reportedIncidents');
      if (stored) {
        setOfficerIncidents(JSON.parse(stored));
      }
    };
    loadIncidents();
    // Check for new incidents every 3 seconds
    const interval = setInterval(loadIncidents, 3000);
    return () => clearInterval(interval);
  }, []);

  // Check for correction requests
  useEffect(() => {
    const checkCorrectionRequest = () => {
      const requested = localStorage.getItem('correctionRequested');
      setCorrectionRequest(requested === 'true');

      const metaRaw = localStorage.getItem('correctionRequestMeta');
      if (metaRaw) {
        try {
          setCorrectionRequestMeta(JSON.parse(metaRaw));
        } catch (e) {
          console.error('Error parsing correction request meta', e);
          setCorrectionRequestMeta(null);
        }
      } else {
        setCorrectionRequestMeta(null);
      }
    };
    checkCorrectionRequest();
    const interval = setInterval(checkCorrectionRequest, 2000);
    return () => clearInterval(interval);
  }, []);

  // Approve correction request
  const approveCorrectionRequest = () => {
    if (confirm('Are you sure you want to approve this correction request? The officer will be able to resubmit their vote counts.')) {
      localStorage.setItem('voteSubmissionReset', 'true');

      // Also scope reset to the requesting polling center if provided
      if (correctionRequestMeta?.pollingCenterId) {
        const centerKey = correctionRequestMeta.pollingCenterId;
        localStorage.setItem(`voteSubmissionReset_${centerKey}`, 'true');
        localStorage.setItem(`correctionUsed_${centerKey}`, 'true');
        localStorage.setItem(`voteResubmissionWindow_${centerKey}`, 'true');
        localStorage.removeItem(`correctionRequested_${centerKey}`);
      }

      localStorage.removeItem('correctionRequested');
      localStorage.removeItem('correctionRequestMeta');
      setCorrectionRequest(false);
      setCorrectionRequestMeta(null);
      alert('Correction approved! The presiding officer can now resubmit vote counts.');
    }
  };

  // Reject correction request
  const rejectCorrectionRequest = () => {
    if (confirm('Are you sure you want to reject this correction request?')) {
      if (correctionRequestMeta?.pollingCenterId) {
        localStorage.removeItem(`correctionRequested_${correctionRequestMeta.pollingCenterId}`);
      }
      localStorage.removeItem('correctionRequested');
      localStorage.removeItem('correctionRequestMeta');
      setCorrectionRequest(false);
      setCorrectionRequestMeta(null);
      alert('Correction request rejected.');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      router.push('/');
    }
  };

  const PARTIES = [
    { id: 'PA', name: 'Party A', color: '#10b981' },
    { id: 'PB', name: 'Party B', color: '#3b82f6' },
    { id: 'PC', name: 'Party C', color: '#f59e0b' },
    { id: 'PD', name: 'Party D', color: '#a855f7' },
    { id: 'PE', name: 'Party E', color: '#ec4899' },
    { id: 'PF', name: 'Party F', color: '#ef4444' },
    { id: 'IND', name: 'Independent', color: '#6b7280' },
  ];

  const [voteSubmissions, setVoteSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const loadVotes = () => {
      try {
        const raw = localStorage.getItem('votesSubmissions');
        setVoteSubmissions(raw ? JSON.parse(raw) : []);
      } catch (e) {
        console.error('Error loading vote submissions', e);
        setVoteSubmissions([]);
      }
    };

    loadVotes();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'votesSubmissions') loadVotes();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', loadVotes);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', loadVotes);
    };
  }, []);

  const partyVotes = useMemo(() => {
    const totals = PARTIES.map((p) => ({ ...p, votes: 0 }));
    voteSubmissions.forEach((sub) => {
      const votes = sub.partyVotes || {};
      totals.forEach((t) => {
        t.votes += Number(votes[t.id] || 0);
      });
    });
    return totals;
  }, [PARTIES, voteSubmissions]);

  const topPollingCenters = useMemo(() => {
    const centers = voteSubmissions.map((sub) => ({
      name: sub.pollingCenterName || sub.pollingCenter || 'Polling Center',
      location: sub.pollingCenter || 'Unknown',
      votes: Number(sub.totalVotes) || 0,
      turnout: sub.totalVotes ? `${sub.totalVotes} votes` : 'No votes yet',
    }));
    return centers.sort((a, b) => b.votes - a.votes).slice(0, 5);
  }, [voteSubmissions]);

  // Only show officer-reported incidents (real data only)
  const recentIncidents = officerIncidents.map(inc => ({
    id: inc.id,
    severity: inc.severity.toUpperCase(),
    title: inc.description,
    location: inc.location,
    status: inc.status || 'pending',
    isNew: inc.status !== 'acknowledged',
    timestamp: inc.timestamp,
  }));

  // Count only active (non-acknowledged) incidents
  const activeIncidentsCount = officerIncidents.filter(inc => inc.status !== 'acknowledged').length;

  // Calculate max vote for chart scaling
  const maxVotes = Math.max(1, ...partyVotes.map(p => p.votes));
  const chartHeight = 250;
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SlidingSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} hideTrigger />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-green-600 text-white px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-green-700 rounded transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <Image src="/images/logo-AmarVote.png" alt="AmarVote" width={36} height={36} className="rounded-lg shadow-sm" />
                <h1 className="text-xl font-bold">Admin Dashboard - AmarVote</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBell />
              <UserProfileControls role="admin" onLogout={handleLogout} showEditProfile={true} />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Vote Submission Control - NEW */}
            <div className={`rounded-lg border-2 p-6 transition-all ${
              voteSubmissionEnabled 
                ? 'bg-green-50 border-green-300' 
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  voteSubmissionEnabled ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {voteSubmissionEnabled 
                    ? <Unlock className="w-6 h-6 text-green-600" />
                    : <Lock className="w-6 h-6 text-red-600" />
                  }
                </div>
                <button
                  onClick={toggleVoteSubmission}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    voteSubmissionEnabled
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {voteSubmissionEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
              <h3 className="text-sm font-medium text-gray-700">Vote Submission</h3>
              <p className={`text-xs font-semibold ${
                voteSubmissionEnabled ? 'text-green-600' : 'text-red-600'
              }`}>
                {voteSubmissionEnabled ? '✓ Enabled for Officers' : '✗ Locked'}
              </p>
            </div>

            {/* Correction Request Card - Shows only when there's a request */}
            {correctionRequest && (
              <div className="bg-orange-50 rounded-lg border-2 border-orange-400 p-6 animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Vote className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">NEW</span>
                </div>
                <h3 className="text-sm font-semibold text-orange-800 mb-1">Correction Request</h3>
                <p className="text-xs text-orange-600 mb-3">Officer requests to resubmit votes</p>

                {correctionRequestMeta && (
                  <div className="mb-4 bg-white/80 border border-orange-200 rounded-lg p-3 text-xs text-gray-800">
                    <p className="font-semibold text-orange-900">{correctionRequestMeta.officerName || 'Presiding Officer'}</p>
                    <p className="text-gray-700">Polling Center: {correctionRequestMeta.pollingCenterName || correctionRequestMeta.pollingCenterId || 'Unknown center'}</p>
                    {correctionRequestMeta.requestedAt && (
                      <p className="text-gray-500">Requested at: {new Date(correctionRequestMeta.requestedAt).toLocaleString()}</p>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={approveCorrectionRequest}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1.5 rounded transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={rejectCorrectionRequest}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1.5 rounded transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}

            {/* Total Incidents */}
            <div className={`bg-white rounded-lg border p-6 ${activeIncidentsCount > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${activeIncidentsCount > 0 ? 'bg-red-100' : 'bg-blue-100'}`}>
                  <FileText className={`w-6 h-6 ${activeIncidentsCount > 0 ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <span className={`text-3xl font-bold ${activeIncidentsCount > 0 ? 'text-red-600' : 'text-blue-600'}`}>{activeIncidentsCount}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">Active Incidents</h3>
              <p className="text-xs text-gray-500">
                {activeIncidentsCount > 0 ? `🚨 ${activeIncidentsCount} pending response` : 'No active incidents'}
              </p>
            </div>

            {/* Red Zone Areas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-3xl font-bold text-red-600">3</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">Red Zone Areas</h3>
              <p className="text-xs text-gray-500">High/Critical severity</p>
            </div>

            {/* Polling Centers */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-3xl font-bold text-green-600">7</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">Polling Centers</h3>
              <p className="text-xs text-gray-500">Currently active</p>
            </div>

            {/* Votes Cast */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-3xl font-bold text-purple-600">17,970</span>
              </div>
              <h3 className="text-sm font-medium text-gray-700">Total Voters Cast</h3>
              <p className="text-xs text-gray-500">Across all centers</p>
            </div>
          </div>

          {/* Vote Count by Party Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Vote Count by Party</h2>
            <p className="text-sm text-gray-500 mb-6">Party-wise vote tracking</p>
            
            <div className="flex items-end justify-around h-64 gap-4 pb-8 pt-6">
              {partyVotes.map((party) => {
                const barHeight = maxVotes === 0 ? 0 : (party.votes / maxVotes) * chartHeight;
                return (
                  <div key={party.id} className="flex flex-col items-center flex-1">
                    <div className="w-full bg-gray-200 rounded-t-lg relative" style={{ height: `${chartHeight}px` }}>
                      <div
                        className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                        style={{
                          height: `${barHeight}px`,
                          backgroundColor: party.color,
                          position: 'absolute',
                          bottom: 0,
                        }}
                        onMouseMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, content: `${party.id}: ${party.votes.toLocaleString()} votes` })}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => router.push(`/dashboard/admin/incidents`)}
                      ></div>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 mt-3">{party.id}</p>
                  </div>
                );
              })}
            </div>

            {tooltip && <ChartTooltip x={tooltip.x} y={tooltip.y}>{tooltip.content}</ChartTooltip>}

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-3">Vote Count</p>
            </div>
          </div>

          {/* Bottom Section - Incidents and Polling Centers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Incidents */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Incidents</h2>
                {officerIncidents.length > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {officerIncidents.length} NEW
                  </span>
                )}
              </div>
              
              <div className="space-y-3">
                {recentIncidents.slice(0, 6).map((incident: any) => (
                  <div key={incident.id} onClick={() => router.push(`/dashboard/admin/incidents/${incident.id}`)} className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors ${incident.isNew ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          incident.severity === 'CRITICAL' 
                            ? 'bg-red-100 text-red-700' 
                            : incident.severity === 'HIGH'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {incident.severity}
                        </span>
                        {incident.isNew && (
                          <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
                            {incident.reportedBy || 'Officer'}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{incident.title}</p>
                    <p className="text-xs text-gray-500">{incident.location}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Polling Centers */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Polling Centers</h2>
              
              <div className="space-y-3">
                {topPollingCenters.map((center, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{center.name}</p>
                      <p className="text-xs text-gray-500">{center.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{center.votes.toLocaleString()} votes</p>
                      <p className="text-xs text-gray-500">{center.turnout}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
