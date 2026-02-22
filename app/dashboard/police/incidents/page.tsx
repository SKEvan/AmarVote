'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserProfileControls from '@/components/shared/UserProfileControls';
import { AlertTriangle, Clock, CheckCircle, MapPin, ArrowLeft, X, Menu, Home } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function PoliceIncidentsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Reported' | 'Under Investigation' | 'Resolved'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Load incidents from database
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const response = await fetchWithAuth('/api/incidents');
        if (response.ok) {
          const data = await response.json();
          const officerIncidents = (data.incidents || []).map((inc: any) => ({
            ...inc,
            id: inc._id,
            gpsLocation: inc.coordinates || { lat: 23.8103, lng: 90.4125 },
          }));
          
          setIncidents(officerIncidents);
        }
      } catch (error) {
        console.error('Error loading incidents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIncidents();
    const interval = setInterval(loadIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredIncidents = filterStatus === 'ALL' 
    ? incidents 
    : incidents.filter(inc => inc.status === filterStatus);

  const getSeverityColor = (severity: string) => {
    const sev = severity?.toUpperCase();
    switch (sev) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getSeverityBg = (severity: string) => {
    const sev = severity?.toUpperCase();
    switch (sev) {
      case 'CRITICAL': return 'bg-red-50 border-red-200';
      case 'HIGH': return 'bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-50 border-yellow-200';
      case 'LOW': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reported': return 'text-red-600';
      case 'Under Investigation': return 'text-orange-600';
      case 'Resolved': return 'text-green-600';
      case 'Dismissed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-xl font-semibold">All Incidents</h1>
          <UserProfileControls role="police" showEditProfile={true} />
        </div>
      </header>

      {/* Sliding Sidebar Menu */}
      <>
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        <div className={`fixed inset-0 left-0 top-0 w-80 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-white">
            <h4 className="font-semibold text-lg">Menu</h4>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            <Link
              href="/dashboard/police"
              onClick={() => setSidebarOpen(false)}
              className="flex items-start gap-3 p-4 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Home className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <div className="text-base font-semibold text-gray-900">Dashboard</div>
                <div className="text-sm text-gray-500">Main overview</div>
              </div>
            </Link>

            <Link
              href="/dashboard/police/incidents"
              onClick={() => setSidebarOpen(false)}
              className="flex items-start gap-3 p-4 rounded-lg hover:bg-red-50 transition-colors border-2 border-red-500 bg-red-50"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <div className="text-base font-semibold text-gray-900">View All Incidents</div>
                <div className="text-sm text-gray-500">All reported incidents</div>
              </div>
            </Link>

            <Link
              href="/dashboard/police/map"
              onClick={() => setSidebarOpen(false)}
              className="flex items-start gap-3 p-4 rounded-lg hover:bg-red-50 transition-colors"
            >
              <MapPin className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <div className="text-base font-semibold text-gray-900">View Map</div>
                <div className="text-sm text-gray-500">Live incidents</div>
              </div>
            </Link>
          </nav>
        </div>
      </>

      {/* Main Content */}
      <div className="p-6 max-w-6xl mx-auto">
        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(['ALL', 'Reported', 'Under Investigation', 'Resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status}
              <span className="ml-2 text-sm opacity-75">
                ({status === 'ALL' 
                  ? incidents.length 
                  : incidents.filter(inc => inc.status === status).length})
              </span>
            </button>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-red-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-red-600">{incidents.filter(inc => inc.status === 'Reported' || inc.status === 'Under Investigation').length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600 opacity-30" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-green-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{incidents.filter(inc => inc.status === 'Resolved' || inc.status === 'Dismissed').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-30" />
            </div>
          </div>
        </div>

        {/* Incidents List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredIncidents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No incidents found</p>
              </div>
            ) : (
              filteredIncidents.map((incident) => (
                <div
                  key={incident.id}
                  onClick={() => { setSelectedIncident(incident); setShowDetailsModal(true); }}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${getSeverityBg(incident.severity)}`}
                  style={{
                    borderLeftColor: incident.severity?.toUpperCase() === 'CRITICAL' ? '#dc2626' : 
                                   incident.severity?.toUpperCase() === 'HIGH' ? '#ea580c' :
                                   incident.severity?.toUpperCase() === 'MEDIUM' ? '#ca8a04' : '#3b82f6'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold bg-white border capitalize ${getStatusColor(incident.status)}`}>
                          {incident.status}
                        </span>
                        <span className="text-xs text-gray-500">{incident.id}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{incident.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        {incident.location}
                      </div>
                      <p className="text-sm text-gray-600">{incident.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Reported: {new Date(incident.reportedAt || incident.createdAt).toLocaleString()} by {incident.reportedBy?.name || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedIncident && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedIncident.title}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-600">ID</label>
                  <p className="text-gray-900">{selectedIncident.id}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Severity</label>
                  <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${getSeverityColor(selectedIncident.severity)}`}>
                    {selectedIncident.severity}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Status</label>
                  <span className={`inline-block px-2 py-1 rounded text-sm font-semibold capitalize ${getStatusColor(selectedIncident.status)}`}>
                    {selectedIncident.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Location</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {selectedIncident.location}
                  </p>
                  {selectedIncident.gpsLocation && (
                    <p className="text-xs text-gray-500 mt-1">
                      GPS: {selectedIncident.gpsLocation.lat.toFixed(4)}, {selectedIncident.gpsLocation.lng.toFixed(4)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Description</label>
                  <p className="text-gray-900">{selectedIncident.description}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Reported By</label>
                  <p className="text-gray-900">{selectedIncident.reportedBy?.name || 'Unknown'} ({selectedIncident.reportedBy?.role || 'N/A'})</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Time</label>
                  <p className="text-gray-900">{new Date(selectedIncident.reportedAt || selectedIncident.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                {selectedIncident.gpsLocation && (
                  <button
                    onClick={() => {
                      const lat = selectedIncident.gpsLocation.lat;
                      const lng = selectedIncident.gpsLocation.lng;
                      // Open in external map (Google Maps)
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Navigate to Location
                  </button>
                )}
                <button
                  onClick={() => { setShowDetailsModal(false); router.push(`/dashboard/police/incidents/${selectedIncident.id}`); }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
