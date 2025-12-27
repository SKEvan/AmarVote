'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import UserProfileControls from '@/components/UserProfileControls';
import SlidingSidebar from '@/components/SlidingSidebar';
import NotificationBell from '@/components/NotificationBell';
import ChartTooltip from '@/components/ChartTooltip';
import { logs as sharedLogs } from '@/data/mockData';

const mockLogs = sharedLogs || [];

export default function SystemLogsPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [userHover, setUserHover] = useState<{ x: number; y: number; content: string } | null>(null);

  const filtered = useMemo(() => {
    return mockLogs.filter(l => {
      if (actionFilter !== 'ALL' && l.action !== actionFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (l.timestamp || '').toLowerCase().includes(q) || (l.user || '').toLowerCase().includes(q) || (l.action || '').toLowerCase().includes(q) || (l.details || '').toLowerCase().includes(q) || (l.ip || '').toLowerCase().includes(q);
    });
  }, [query, actionFilter]);

  const stats = useMemo(() => {
    const total = mockLogs.length;
    const votesSubmitted = mockLogs.filter(m => m.action === 'VOTE SUBMITTED').length;
    const incidentsReported = mockLogs.filter(m => m.action === 'INCIDENT REPORTED').length;
    const usersCreated = mockLogs.filter(m => m.action === 'USER CREATED').length;
    return { total, votesSubmitted, incidentsReported, usersCreated };
  }, [mockLogs]);

  function exportCsv() {
    const rows = [['timestamp','user','action','details','ip']];
    filtered.forEach(r => rows.push([r.timestamp, r.user, r.action, r.details, r.ip]));
    const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_logs_${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SlidingSidebar />
      <header className="bg-green-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-green-700 rounded transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">System Logs & Audit Trail</h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserProfileControls role="admin" />
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <input
            aria-label="Search logs"
            placeholder="Search logs by user, action, or details..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm"
          />

          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm">
            <option value="ALL">All Actions</option>
            <option value="VOTE SUBMITTED">Vote Submitted</option>
            <option value="INCIDENT REPORTED">Incident Reported</option>
            <option value="USER CREATED">User Created</option>
            <option value="DASHBOARD ACCESSED">Dashboard Accessed</option>
            <option value="PERMISSIONS MODIFIED">Permissions Modified</option>
          </select>

          <button onClick={exportCsv} className="ml-2 inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg shadow-sm text-sm">Export CSV</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Total Logs</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Votes Submitted</p>
            <p className="text-2xl font-bold text-green-600">{stats.votesSubmitted}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Incidents Reported</p>
            <p className="text-2xl font-bold text-orange-600">{stats.incidentsReported}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-600">Users Created</p>
            <p className="text-2xl font-bold text-blue-600">{stats.usersCreated}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="grid grid-cols-12 gap-4 text-xs text-gray-500">
              <div className="col-span-3 font-medium">TIMESTAMP</div>
              <div className="col-span-2">USER</div>
              <div className="col-span-2">ACTION</div>
              <div className="col-span-4">DETAILS</div>
              <div className="col-span-1 text-right">IP ADDRESS</div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[520px] overflow-auto">
            {filtered.map((log) => (
              <div key={log.id} className="p-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <div className="text-sm font-medium">{log.timestamp}</div>
                  </div>

                  <div className="col-span-2 flex items-center gap-3">
                    <div
                      onMouseMove={(e:any) => setUserHover({ x: e.clientX, y: e.clientY, content: `${log.user}\n${log.user}@example.com` })}
                      onMouseLeave={() => setUserHover(null)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm text-gray-700"
                    >
                      {log.user.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-700 truncate">{log.user}</div>
                  </div>

                  <div className="col-span-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded" style={{ background: '#eef2ff', color: '#3730a3' }}>{log.action}</span>
                  </div>

                  <div className="col-span-4 text-sm text-gray-600">{log.details}</div>

                  <div className="col-span-1 text-right text-sm text-gray-600">{log.ip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {userHover && <ChartTooltip x={userHover.x} y={userHover.y}><div className="text-sm whitespace-pre-line">{userHover.content}</div></ChartTooltip>}
      </main>
    </div>
  );
}
