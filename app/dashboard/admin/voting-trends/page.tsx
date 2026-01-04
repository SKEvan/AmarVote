'use client';

import { useMemo, useState, useEffect } from 'react';
import UserProfileControls from '@/components/shared/UserProfileControls';
import SlidingSidebar from '@/components/shared/SlidingSidebar';
import NotificationBell from '@/components/shared/NotificationBell';
import ChartTooltip from '@/components/shared/ChartTooltip';
import { BarChart3, Menu, X } from 'lucide-react';

const PARTIES = [
  { id: 'PA', name: 'Party A', color: '#10b981' },
  { id: 'PB', name: 'Party B', color: '#3b82f6' },
  { id: 'PC', name: 'Party C', color: '#f59e0b' },
  { id: 'PD', name: 'Party D', color: '#a855f7' },
  { id: 'PE', name: 'Party E', color: '#ec4899' },
  { id: 'PF', name: 'Party F', color: '#ef4444' },
  { id: 'IND', name: 'Independent', color: '#6b7280' },
];

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * (Math.PI / 180.0);
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const getArcPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${centerX} ${centerY}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
};

export default function VotingTrendsPage() {
  const [graphMode, setGraphMode] = useState<'percentage' | 'leading'>('percentage');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [pieTooltip, setPieTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [voteSubmissions, setVoteSubmissions] = useState<any[]>([]);

  const niceCeil = (value: number) => {
    if (value <= 0) return 0;
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const normalized = value / magnitude;
    let nice = 1;
    if (normalized > 5) nice = 10;
    else if (normalized > 3) nice = 5;
    else if (normalized > 2) nice = 3;
    else if (normalized > 1) nice = 2;
    return nice * magnitude;
  };

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
  }, [voteSubmissions]);

  const votingCenters = useMemo(() => {
    return voteSubmissions.map((sub: any, idx: number) => {
      const votes = sub.partyVotes || {};
      const leading = Object.entries(votes).reduce(
        (acc: { id: string; value: number }, [id, val]) => {
          const num = Number(val) || 0;
          if (num > acc.value) return { id, value: num };
          return acc;
        },
        { id: '', value: 0 }
      );

      return {
        id: sub.pollingCenter || `center-${idx}`,
        name: sub.pollingCenterName || sub.pollingCenter || 'Polling Center',
        votesCast: Number(sub.totalVotes) || 0,
        leadingParty: leading.id || 'N/A',
        leadingVotes: leading.value,
      };
    });
  }, [voteSubmissions]);

  const totalVotesCast = votingCenters.reduce((sum, c) => sum + c.votesCast, 0);
  const totalVotes = partyVotes.reduce((s, p) => s + p.votes, 0);

  const leadingParty = partyVotes.reduce(
    (max, p) => (p.votes > max.votes ? p : max),
    { id: 'N/A', name: 'N/A', color: '#6b7280', votes: 0 }
  );
  const participatingCount = partyVotes.filter((p) => p.votes > 0).length || partyVotes.length;

  // Calculate max values for scaling
  const percentages = totalVotesCast > 0
    ? votingCenters.map(c => (c.votesCast / totalVotesCast) * 100)
    : [0];
  const leadingVotes = votingCenters.length > 0
    ? votingCenters.map(c => c.leadingVotes)
    : [0];
  
  const maxPercentage = Math.max(...percentages);
  const maxLeadingVotes = Math.max(...leadingVotes);

  const axisMaxPercentage = Math.min(100, Math.max(10, niceCeil(maxPercentage)) || 100);
  const axisMaxLeadingVotes = Math.max(10, niceCeil(maxLeadingVotes));

  const chartHeight = 420;

  return (
    <div className="min-h-screen bg-gray-50">
      <SlidingSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} hideTrigger />
      <header className="bg-green-600 text-white px-6 py-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="p-2 hover:bg-green-700 rounded transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-bold">Voting Trends & Analytics</h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserProfileControls role="admin" />
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Top stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700">Total Votes Cast</p>
                <p className="text-2xl font-bold text-emerald-700">{totalVotes.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm">
            <div>
              <p className="text-sm text-blue-700">Leading Party</p>
              <p className="text-2xl font-bold text-blue-700">{leadingParty.id}</p>
              <p className="text-sm text-blue-500">{leadingParty.votes > 0 ? `${leadingParty.votes.toLocaleString()} votes` : 'No data yet'}</p>
            </div>
          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-lg p-5 shadow-sm">
            <div>
              <p className="text-sm text-pink-700">Participating Parties</p>
              <p className="text-2xl font-bold text-pink-700">{participatingCount}</p>
            </div>
          </div>
        </div>

        {/* Bar chart with toggle */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {graphMode === 'percentage' 
                ? 'Voting Percentage by Center' 
                : 'Leading Party Votes by Center'}
            </h2>
            
            {/* Toggle button in top right corner */}
            <button
              onClick={() => setGraphMode(graphMode === 'percentage' ? 'leading' : 'percentage')}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 transition-colors font-medium text-green-700"
              title="Toggle between voting percentage and leading party votes"
            >
              <BarChart3 className="w-5 h-5" />
              Switch View
            </button>
          </div>

          <div className="flex">
            {/* Y axis labels */}
            <div className="w-16 pr-4 flex flex-col justify-between text-xs text-gray-500" style={{ height: `${chartHeight}px` }}>
                  {([0.0, 0.25, 0.5, 0.75, 1.0] as number[]).reverse().map((t, idx) => (
                <div key={idx} className="flex items-center justify-end">
                  {graphMode === 'percentage'
                    ? `${Math.round(t * axisMaxPercentage)}%`
                    : Math.round(t * axisMaxLeadingVotes).toLocaleString()
                  }
                </div>
              ))}
            </div>

            <div className="flex-1 relative">
              <div className="w-full bg-gradient-to-b from-gray-50 to-white rounded-md relative overflow-hidden" style={{ height: `${chartHeight}px` }}>
                {/* Horizontal grid lines */}
                {([0.0, 0.25, 0.5, 0.75, 1.0] as number[]).map((t, idx) => (
                  <div
                    key={idx}
                    style={{ top: `${(1 - t) * 100}%` }}
                    className="absolute left-0 right-0 border-t border-dashed border-gray-200"
                  />
                ))}

                <div className="absolute inset-0 flex items-end gap-2 px-2 py-6">
                  {votingCenters.map((center) => {
                    let barHeight = 0;
                    let tooltipText = '';
                    let barColor = '#3b82f6';

                    if (graphMode === 'percentage') {
                      const percentage = totalVotesCast > 0 ? (center.votesCast / totalVotesCast) * 100 : 0;
                      barHeight = axisMaxPercentage === 0 ? 0 : Math.min((percentage / axisMaxPercentage) * chartHeight, chartHeight - 2);
                      tooltipText = `${center.name}: ${center.votesCast.toLocaleString()} of ${totalVotesCast.toLocaleString()} votes (${percentage.toFixed(1)}%)`;
                    } else {
                      barHeight = axisMaxLeadingVotes === 0 ? 0 : Math.min((center.leadingVotes / axisMaxLeadingVotes) * chartHeight, chartHeight - 2);
                      const partyInfo = PARTIES.find((p) => p.id === center.leadingParty);
                      barColor = partyInfo?.color || '#6b7280';
                      tooltipText = partyInfo
                        ? `${center.name}: ${partyInfo.name} (${center.leadingParty}) ${center.leadingVotes.toLocaleString()} votes`
                        : `${center.name}: ${center.leadingVotes.toLocaleString()} votes`;
                    }

                    return (
                      <div key={center.id} className="flex-1 flex flex-col items-center justify-end min-h-0">
                        <div className="relative w-full flex items-end justify-center h-full">
                          <div
                            className="rounded-t-md cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                            style={{
                              height: `${barHeight}px`,
                              backgroundColor: barColor,
                              width: '100%',
                              maxWidth: '80%',
                            }}
                            onMouseMove={(e: any) =>
                              setTooltip({ x: e.clientX, y: e.clientY, content: tooltipText })
                            }
                            onMouseLeave={() => setTooltip(null)}
                          >
                          </div>
                        </div>
                        <div className="mt-3 text-xs font-semibold text-gray-900 text-center px-1 line-clamp-2 w-full">{center.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500 flex justify-center">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="w-3 h-3 inline-block rounded"
                    style={{
                      backgroundColor:
                        graphMode === 'percentage' ? '#3b82f6' : '#10b981',
                    }}
                  />
                  {graphMode === 'percentage'
                    ? 'Voting Percentage'
                    : 'Leading Party Votes'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lower area: pie + top-3 details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Party Vote Share Distribution</h3>
            <div className="flex justify-center">
              {totalVotes === 0 ? (
                <p className="text-sm text-gray-500">No votes submitted yet.</p>
              ) : (
                <svg width="320" height="320">
                  {(() => {
                    let angle = 0;
                    return partyVotes.map((p) => {
                      const slice = (p.votes / totalVotes) * 360;
                      const seg = { startAngle: angle, endAngle: angle + slice };
                      angle += slice;
                      const label = `${((p.votes/totalVotes)*100).toFixed(1)}%`;
                      return (
                        <g key={p.id}>
                          <path
                            d={getArcPath(160, 160, 120, seg.startAngle, seg.endAngle)}
                            fill={p.color}
                            onMouseMove={(e:any) => setPieTooltip({ x: e.clientX, y: e.clientY, content: `${p.id}: ${label} (${p.votes.toLocaleString()})` })}
                            onMouseLeave={() => setPieTooltip(null)}
                          />
                        </g>
                      );
                    });
                  })()}
                </svg>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Detailed Party Statistics (Top 3)</h3>
            <div className="space-y-4">
              {(() => {
                const top = [...partyVotes].sort((a,b)=>b.votes-a.votes).slice(0,3);
                const leader = top[0];
                return top.map((p) => (
                  <div key={p.id} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: p.color }} />
                        <div>
                          <p className="text-sm font-semibold">{p.id}</p>
                          <p className="text-xs text-gray-500">{p.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{p.votes.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{totalVotes > 0 ? ((p.votes/totalVotes)*100).toFixed(1) : '0.0'}%</p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                      <div style={{ width: `${totalVotes > 0 ? (p.votes/totalVotes)*100 : 0}%`, backgroundColor: p.color, height: '100%' }} />
                    </div>

                    {leader && p.id !== leader.id && (
                      <p className="text-xs text-gray-500">{(leader.votes - p.votes).toLocaleString()} votes behind leader</p>
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {tooltip && <ChartTooltip x={tooltip.x} y={tooltip.y}>{tooltip.content}</ChartTooltip>}
        {pieTooltip && <ChartTooltip x={pieTooltip.x} y={pieTooltip.y}>{pieTooltip.content}</ChartTooltip>}
      </main>
    </div>
  );
}
