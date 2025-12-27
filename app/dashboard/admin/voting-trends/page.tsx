'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserProfileControls from '@/components/UserProfileControls';
import SlidingSidebar from '@/components/SlidingSidebar';
import NotificationBell from '@/components/NotificationBell';
import ChartTooltip from '@/components/ChartTooltip';
import ShieldIcon from '@/components/ShieldIcon';

const partyVotes = [
  { party: 'PA', votes: 15420, color: '#10b981' },
  { party: 'PB', votes: 12890, color: '#3b82f6' },
  { party: 'PC', votes: 8650, color: '#f59e0b' },
  { party: 'PD', votes: 4200, color: '#a855f7' },
  { party: 'PE', votes: 2870, color: '#ec4899' },
  { party: 'PF', votes: 1540, color: '#ef4444' },
  { party: 'PND', votes: 980, color: '#6b7280' },
];

// Mock voting centers data (each bar represents a voting center)
const votingCenters = [
  { id: 'VC-01', name: 'Central High', votes: 4200 },
  { id: 'VC-02', name: 'Eastside Hall', votes: 9800 },
  { id: 'VC-03', name: 'West Park', votes: 7200 },
  { id: 'VC-04', name: 'North Field', votes: 5600 },
  { id: 'VC-05', name: 'South Plaza', votes: 3400 },
  { id: 'VC-06', name: 'Riverside', votes: 2100 },
  { id: 'VC-07', name: 'Lakeside', votes: 4800 },
  { id: 'VC-08', name: 'Old Town', votes: 1500 },
];

const maxVotes = Math.max(...partyVotes.map(p => p.votes), ...votingCenters.map(c => c.votes));
const chartHeight = 420;

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
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const [pieTooltip, setPieTooltip] = useState<{ x: number; y: number; content: string } | null>(null);

  const totalVotes = partyVotes.reduce((s, p) => s + p.votes, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <SlidingSidebar />
      <header className="bg-green-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center">
              <ShieldIcon className="w-8 h-8 mr-2" color="#ffffff" />
            </div>
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
              <p className="text-2xl font-bold text-blue-700">PA</p>
              <p className="text-sm text-blue-500">15,420 votes</p>
            </div>
          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-lg p-5 shadow-sm">
            <div>
              <p className="text-sm text-pink-700">Participating Parties</p>
              <p className="text-2xl font-bold text-pink-700">{partyVotes.length}</p>
            </div>
          </div>
        </div>

        {/* Bar chart (top) */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Votes by Voting Center</h2>

          <div className="flex">
            {/* Y axis labels */}
            <div className="w-16 pr-4 flex flex-col justify-between text-xs text-gray-500">
              {([0.0, 0.25, 0.5, 0.75, 1.0] as number[]).reverse().map((t, idx) => (
                <div key={idx} className="h-[84px] flex items-center">
                  {Math.round(t * maxVotes).toLocaleString()}
                </div>
              ))}
            </div>

            <div className="flex-1 relative">
              <div className="w-full h-[420px] bg-gradient-to-b from-gray-50 to-white rounded-md relative">
                {/* horizontal grid lines */}
                {([0.0, 0.25, 0.5, 0.75, 1.0] as number[]).map((t, idx) => (
                  <div
                    key={idx}
                    style={{ top: `${(1 - t) * 100}%` }}
                    className="absolute left-0 right-0 border-t border-dashed border-gray-200"
                  />
                ))}

                <div className="absolute inset-0 flex items-end gap-4 px-2 pb-6">
                  {votingCenters.map((c) => {
                    const h = (c.votes / maxVotes) * chartHeight;
                    return (
                      <div key={c.id} className="flex-1 flex flex-col items-center">
                        <div className="relative w-full h-full flex items-end">
                          <div
                            className="rounded-t-md cursor-pointer w-full mx-1 shadow-sm"
                            style={{ height: `${h}px`, backgroundColor: '#3b82f6' }}
                            onMouseMove={(e:any) => setTooltip({ x: e.clientX, y: e.clientY, content: `${c.name}: ${c.votes.toLocaleString()} votes` })}
                            onMouseLeave={() => setTooltip(null)}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-white px-2 py-0.5 rounded shadow-sm">{c.votes.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs font-semibold text-gray-900 text-center px-1">{c.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500 flex justify-center">
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 inline-block rounded" />
                  Votes
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
              <svg width="320" height="320">
                {(() => {
                  let angle = 0;
                  return partyVotes.map((p, idx) => {
                    const slice = (p.votes / totalVotes) * 360;
                    const seg = { startAngle: angle, endAngle: angle + slice };
                    angle += slice;
                    const midAngle = seg.startAngle + (slice / 2);
                    const label = `${((p.votes/totalVotes)*100).toFixed(1)}%`;
                    const labelPos = polarToCartesian(160, 160, 110, midAngle);
                    return (
                      <g key={p.party}>
                        <path
                          d={getArcPath(160, 160, 120, seg.startAngle, seg.endAngle)}
                          fill={p.color}
                          onMouseMove={(e:any) => setPieTooltip({ x: e.clientX, y: e.clientY, content: `${p.party}: ${label} (${p.votes.toLocaleString()})` })}
                          onMouseLeave={() => setPieTooltip(null)}
                        />
                        <text x={labelPos.x} y={labelPos.y} fontSize={12} textAnchor="middle" fill="#111" dominantBaseline="middle">{label}</text>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-semibold mb-4">Detailed Party Statistics (Top 3)</h3>
            <div className="space-y-4">
              {(() => {
                const top = [...partyVotes].sort((a,b)=>b.votes-a.votes).slice(0,3);
                const leader = top[0];
                return top.map((p) => (
                  <div key={p.party} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: p.color }} />
                        <div>
                          <p className="text-sm font-semibold">{p.party}</p>
                          <p className="text-xs text-gray-500">Party {p.party}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{p.votes.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{((p.votes/totalVotes)*100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-2">
                      <div style={{ width: `${(p.votes/totalVotes)*100}%`, backgroundColor: p.color, height: '100%' }} />
                    </div>

                    {p.party !== leader.party && (
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
