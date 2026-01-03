'use client';

import { useState, useEffect, useRef } from 'react';
import SlidingSidebar from '@/components/shared/SlidingSidebar';
import NotificationBell from '@/components/shared/NotificationBell';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, AlertTriangle, Clock } from 'lucide-react';
import UserProfileControls from '@/components/shared/UserProfileControls';
import ChartTooltip from '@/components/shared/ChartTooltip';

// Import Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

export default function IncidentMapPage() {
  const router = useRouter();
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  // search removed per request; only filtering remains
  const [userHover, setUserHover] = useState<{ x: number; y: number; content: string } | null>(null);
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);

  // Load real incidents from localStorage
  useEffect(() => {
    const loadIncidents = () => {
      const stored = localStorage.getItem('reportedIncidents');
      if (stored) {
        const parsedIncidents = JSON.parse(stored).map((inc: any) => ({
          ...inc,
          severity: inc.severity.toUpperCase(),
          lat: inc.gpsLocation?.lat || inc.coordinates?.lat || 23.8103,
          lng: inc.gpsLocation?.lng || inc.coordinates?.lng || 90.4125,
          division: inc.location || inc.division || 'Unknown',
        }));
        setIncidents(parsedIncidents);
      } else {
        setIncidents([]);
      }
    };
    loadIncidents();
    const interval = setInterval(loadIncidents, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filters + search
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const filteredIncidents = incidents.filter(i => filterSeverity === 'ALL' || i.severity === filterSeverity);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      if (!window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        
        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (mapRef.current && window.L && !mapInstanceRef.current) {
        const map = window.L.map(mapRef.current).setView([23.8103, 90.4125], 8);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        updateMarkers();
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when incidents or filters change
  useEffect(() => {
    if (mapInstanceRef.current && window.L) {
      updateMarkers();
    }
  }, [incidents, filterSeverity]);

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // use filteredIncidents so markers respect selected filters
    filteredIncidents.forEach((incident) => {
      const color = incident.severity === 'CRITICAL' ? '#dc2626' : 
                   incident.severity === 'HIGH' ? '#ea580c' : '#ca8a04';
      
      const customIcon = window.L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="position: relative;">
            <div style="
              width: 40px;
              height: 40px;
              background-color: ${color};
              border: 3px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
              ${incident.status === 'pending' ? 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;' : ''}
            ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div style="
              position: absolute;
              top: 45px;
              left: 50%;
              transform: translateX(-50%);
              background: white;
              padding: 4px 8px;
              border-radius: 4px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
              font-size: 11px;
              font-weight: bold;
              white-space: nowrap;
            ">${incident.id}</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = window.L.marker([incident.lat, incident.lng], { icon: customIcon })
        .addTo(mapInstanceRef.current)
        .on('click', () => {
          setSelectedIncident(incident.id);
          router.push(`/dashboard/admin/incidents/${incident.id}`);
        });

      marker.bindPopup(`
        <div style="font-family: system-ui; padding: 8px;">
          <div style="font-weight: bold; color: ${color}; margin-bottom: 4px;">${incident.id} - ${incident.severity}</div>
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">${incident.title}</div>
          <div style="font-size: 12px; color: #666;">
            <div style="margin-bottom: 4px;">📍 ${incident.location}</div>
            <div style="margin-bottom: 4px;">🕐 ${incident.reportedTime}</div>
            <div>📋 Type: ${incident.type}</div>
          </div>
        </div>
      `);

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    // refresh markers when filter changes
    updateMarkers();
  }, [filterSeverity]);

  // Calculate division breakdown (based on filtered incidents)
  const divisionBreakdown = filteredIncidents.reduce((acc, inc) => {
    const existing = acc.find((d: { division: string; count: number }) => d.division === inc.division);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ division: inc.division, count: 1 });
    }
    return acc;
  }, [] as Array<{ division: string; count: number }>);

  // Calculate severity breakdown
  const severityBreakdown = [
    { severity: 'CRITICAL', count: filteredIncidents.filter(i => i.severity === 'CRITICAL').length, color: '#ef4444' },
    { severity: 'HIGH', count: filteredIncidents.filter(i => i.severity === 'HIGH').length, color: '#f97316' },
    { severity: 'MEDIUM', count: filteredIncidents.filter(i => i.severity === 'MEDIUM').length, color: '#eab308' },
    { severity: 'LOW', count: filteredIncidents.filter(i => i.severity === 'LOW').length, color: '#10b981' },
  ];

  // Pie chart calculations
  const totalIncidents = filteredIncidents.length;
  const [pieTooltip, setPieTooltip] = useState<{ x: number; y: number; content: string } | null>(null);
  const getPieSegment = (count: number, startAngle: number) => {
    const sliceAngle = (count / totalIncidents) * 360;
    return { startAngle, sliceAngle, endAngle: startAngle + sliceAngle };
  };

  const getSeverityPieSegment = (count: number, startAngle: number) => {
    const totalSeverity = severityBreakdown.reduce((sum, s) => sum + s.count, 0);
    const sliceAngle = (count / totalSeverity) * 360;
    return { startAngle, sliceAngle, endAngle: startAngle + sliceAngle };
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-green-700 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">Live Incident Map</h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserProfileControls role="admin" />
          </div>
        </div>
      </header>

      <SlidingSidebar />
      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {/* Stats Row */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Filter:</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Export CSV for system logs is implemented on the System Logs page */}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Division Pie Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Incidents by Division</h2>
            <div className="flex justify-center">
              <svg width="200" height="200" className="flex-shrink-0">
                {divisionBreakdown.map((div: { division: string; count: number }, idx: number) => {
                  let angle = 0;
                  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
                  const segment = getPieSegment(div.count, angle);
                  divisionBreakdown.slice(0, idx).forEach((d: { division: string; count: number }) => {
                    angle += (d.count / totalIncidents) * 360;
                  });
                  const seg = getPieSegment(div.count, angle);
                  
                  return (
                    <path
                      key={div.division}
                      d={getArcPath(100, 100, 80, seg.startAngle, seg.endAngle)}
                      fill={colors[idx % colors.length]}
                      onMouseMove={(e:any) => setPieTooltip({ x: e.clientX, y: e.clientY, content: `${div.division}: ${div.count} incidents` })}
                      onMouseLeave={() => setPieTooltip(null)}
                    />
                  );
                })}
              </svg>
            </div>

            {pieTooltip && <ChartTooltip x={pieTooltip.x} y={pieTooltip.y}>{pieTooltip.content}</ChartTooltip>}

            {/* Legend */}
            <div className="mt-6 space-y-2">
              {divisionBreakdown.map((div: { division: string; count: number }, idx: number) => {
                const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
                return (
                  <div key={div.division} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: colors[idx % colors.length] }}
                      ></div>
                      <span className="text-gray-600">{div.division}</span>
                    </div>
                    <span className="text-gray-900 font-semibold">({div.count})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Severity Pie Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Incidents by Severity</h2>
            <div className="flex justify-center">
              <svg width="200" height="200" className="flex-shrink-0">
                {severityBreakdown.map((sev, idx) => {
                  let angle = 0;
                  severityBreakdown.slice(0, idx).forEach(s => {
                    angle += (s.count / severityBreakdown.reduce((sum, s) => sum + s.count, 0)) * 360;
                  });
                  const seg = getSeverityPieSegment(sev.count, angle);
                  
                  return (
                    <path
                      key={sev.severity}
                      d={getArcPath(100, 100, 80, seg.startAngle, seg.endAngle)}
                      fill={sev.color}
                      onMouseMove={(e:any) => setPieTooltip({ x: e.clientX, y: e.clientY, content: `${sev.severity}: ${sev.count}` })}
                      onMouseLeave={() => setPieTooltip(null)}
                    />
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="mt-6 space-y-2">
              {severityBreakdown.map((sev) => (
                <div key={sev.severity} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sev.color }}
                    ></div>
                    <span className="text-gray-600">{sev.severity}</span>
                  </div>
                  <span className="text-gray-900 font-semibold">{sev.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Overview Title */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Map Overview</h2>

        {/* Map and Incidents Section */}
        <div className="flex h-[500px] gap-6 relative">
          {/* Map Area */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden relative shadow-md hover:shadow-lg transition-shadow">
            {/* Leaflet Map Container */}
            <div ref={mapRef} className="w-full h-full"></div>

            {/* Map Controls Overlay */}
            <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
              <p className="font-bold text-gray-800">Bangladesh Election Map</p>
              <p className="text-sm text-gray-500">Live Incident Tracking</p>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
              <p className="font-bold text-gray-800 mb-3">Incident Severity</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full shadow"></div>
                  <span className="text-sm font-medium">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-600 rounded-full shadow"></div>
                  <span className="text-sm font-medium">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full shadow"></div>
                  <span className="text-sm font-medium">Medium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Incidents List Sidebar */}
          <div className="w-96 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col shadow-md hover:shadow-lg transition-shadow">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">Active Incidents</h2>
              <p className="text-sm text-gray-500">{incidents.length} total incidents</p>
            </div>

            <div className="divide-y divide-gray-200 overflow-y-auto flex-1">
              {filteredIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 border-l-4 ${
                    incident.severity === 'CRITICAL' ? 'border-red-500' :
                    incident.severity === 'HIGH' ? 'border-orange-500' : 'border-yellow-500'
                  }`}
                  onClick={() => router.push(`/dashboard/admin/incidents/${incident.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      onMouseMove={(e:any) => setUserHover({ x: e.clientX, y: e.clientY, content: `${incident.reportedBy}\n${incident.id}@example.com\nPresiding Officer` })}
                      onMouseLeave={() => setUserHover(null)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        incident.severity === 'CRITICAL' ? 'bg-red-100' :
                        incident.severity === 'HIGH' ? 'bg-orange-100' : 'bg-yellow-100'
                      }`}
                    >
                      <AlertTriangle className={`w-4 h-4 ${
                        incident.severity === 'CRITICAL' ? 'text-red-600' :
                        incident.severity === 'HIGH' ? 'text-orange-600' : 'text-yellow-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`${
                          incident.severity === 'CRITICAL' ? 'bg-red-600' :
                          incident.severity === 'HIGH' ? 'bg-orange-600' : 'bg-yellow-600'
                        } text-white text-xs font-bold px-2 py-0.5 rounded`}>
                          {incident.severity}
                        </span>
                        <span className="text-xs text-gray-500">{incident.id}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{incident.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{incident.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{incident.reportedTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {userHover && <ChartTooltip x={userHover.x} y={userHover.y}>
          <div className="text-sm whitespace-pre-line">{userHover.content}</div>
        </ChartTooltip>}
      </main>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
}
