'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, AlertTriangle, Clock, Bell, X } from 'lucide-react';

// Import Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

// Mock incidents data with coordinates
const mockIncidents = [
  {
    id: 'INC-001',
    title: 'Voter intimidation reported',
    location: 'Dhaka-10, Mirpur Polling Station',
    lat: 23.8223,
    lng: 90.3654,
    priority: 'HIGH',
    time: '15:15:00',
    distance: '1.6 km',
    type: 'Intimidation',
    status: 'pending'
  },
  {
    id: 'INC-002',
    title: 'Ballot box tampering attempt',
    location: 'Dhaka-8, Mohammadpur Station',
    lat: 23.7679,
    lng: 90.3577,
    priority: 'HIGH',
    time: '14:30:00',
    distance: '3.2 km',
    type: 'Tampering',
    status: 'pending'
  },
  {
    id: 'INC-003',
    title: 'Crowd control issue',
    location: 'Dhaka-5, Dhanmondi Station',
    lat: 23.7461,
    lng: 90.3742,
    priority: 'MEDIUM',
    time: '13:45:00',
    distance: '4.5 km',
    type: 'Crowd Control',
    status: 'acknowledged'
  }
];

export default function MapPage() {
  const [incidents, setIncidents] = useState(mockIncidents);
  const [selectedIncident, setSelectedIncident] = useState<typeof mockIncidents[0] | null>(null);
  const [notification, setNotification] = useState<typeof mockIncidents[0] | null>(null);
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Leaflet CSS and JS
    const loadLeaflet = async () => {
      if (!window.L) {
        // Add Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Add Leaflet JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        
        await new Promise((resolve) => {
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      if (mapRef.current && window.L && !mapInstanceRef.current) {
        // Initialize map centered on Dhaka, Bangladesh
        const map = window.L.map(mapRef.current).setView([23.8103, 90.4125], 12);

        // Add OpenStreetMap tiles
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Add markers for incidents
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

  // Update markers when incidents change
  useEffect(() => {
    if (mapInstanceRef.current && window.L) {
      updateMarkers();
    }
  }, [incidents]);

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    incidents.forEach((incident) => {
      const color = incident.priority === 'HIGH' ? '#dc2626' : incident.priority === 'MEDIUM' ? '#ca8a04' : '#9ca3af';
      
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
        .on('click', () => setSelectedIncident(incident));

      // Add popup
      marker.bindPopup(`
        <div style="font-family: system-ui; padding: 8px;">
          <div style="font-weight: bold; color: ${color}; margin-bottom: 4px;">${incident.id} - ${incident.priority}</div>
          <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">${incident.title}</div>
          <div style="font-size: 12px; color: #666;">
            <div style="margin-bottom: 4px;">📍 ${incident.location}</div>
            <div style="margin-bottom: 4px;">🕐 ${incident.time}</div>
            <div>📏 ${incident.distance} away</div>
          </div>
        </div>
      `);

      markersRef.current.push(marker);
    });
  };

  // Simulate real-time incident updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate a new incident every 30 seconds
      const newIncident = {
        id: `INC-${String(incidents.length + 1).padStart(3, '0')}`,
        title: 'New incident reported',
        location: 'Dhaka-12, Tejgaon Station',
        lat: 23.7500 + (Math.random() - 0.5) * 0.1,
        lng: 90.3900 + (Math.random() - 0.5) * 0.1,
        priority: Math.random() > 0.5 ? 'HIGH' : 'MEDIUM',
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        distance: `${(Math.random() * 5 + 1).toFixed(1)} km`,
        type: ['Intimidation', 'Tampering', 'Crowd Control'][Math.floor(Math.random() * 3)],
        status: 'pending'
      };
      
      setIncidents(prev => [newIncident, ...prev]);
      setNotification(newIncident);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [incidents.length]);

  const getPriorityColor = (priority: string) => {
    return priority === 'HIGH' ? 'bg-red-600' : 'bg-yellow-600';
  };

  const getPriorityBorderColor = (priority: string) => {
    return priority === 'HIGH' ? 'border-red-500' : 'border-yellow-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/police"
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Live Incident Map</h1>
            <p className="text-red-100 text-sm">Real-time incident tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="font-semibold">{incidents.filter(i => i.status === 'pending').length} Active</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-red-600 text-white rounded-xl shadow-2xl p-4 max-w-sm animate-slide-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold mb-1">New Incident Alert!</p>
                <p className="text-sm text-red-100">{notification.title}</p>
                <p className="text-sm text-red-100">{notification.location}</p>
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-80px)]">
        {/* Map View */}
        <div className="flex-1 relative">
          {/* Leaflet Map Container */}
          <div ref={mapRef} className="absolute inset-0 w-full h-full z-0"></div>

          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-10">
            <p className="font-bold text-gray-800">Dhaka, Bangladesh</p>
            <p className="text-sm text-gray-500">Live Incident Tracking</p>
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
            <p className="font-bold text-gray-800 mb-3">Priority Levels</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-600 rounded-full shadow"></div>
                <span className="text-sm font-medium">High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-600 rounded-full shadow"></div>
                <span className="text-sm font-medium">Medium Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full shadow"></div>
                <span className="text-sm font-medium">Acknowledged</span>
              </div>
            </div>
          </div>
        </div>

        {/* Incident List Sidebar */}
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">Active Incidents</h2>
            <p className="text-sm text-gray-500">{incidents.length} total incidents</p>
          </div>

          <div className="divide-y divide-gray-200">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedIncident?.id === incident.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                } ${getPriorityBorderColor(incident.priority)} border-l-4`}
                onClick={() => setSelectedIncident(incident)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 ${getPriorityColor(incident.priority)} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${getPriorityColor(incident.priority)} text-white text-xs font-bold px-2 py-0.5 rounded`}>
                        {incident.priority}
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
                        <span>{incident.time}</span>
                      </div>
                      <span>•</span>
                      <span>{incident.distance} away</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
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
