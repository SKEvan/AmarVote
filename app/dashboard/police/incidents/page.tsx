'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserProfileControls from '@/components/shared/UserProfileControls';
import { AlertTriangle, Clock, CheckCircle, MapPin, ArrowLeft, X, Menu } from 'lucide-react';

export default function PoliceIncidentsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'pending' | 'responded' | 'resolved' | 'acknowledged'>('ALL');

  // Mock incidents data similar to Admin Dashboard
  const mockIncidents = [
    {
      id: 'INC-001',
      severity: 'HIGH',
      title: 'Group of individuals preventing voters from entering polling station',
      location: 'Azad Adda High School',
      status: 'pending',
      description: 'Multiple individuals blocking the entrance with aggressive behavior',
      reportedBy: 'Officer Rahman',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    },
    {
      id: 'INC-002',
      severity: 'CRITICAL',
      title: 'Unauthorized person found ballot boxes',
      location: 'Pathaiya',
      status: 'responded',
      description: 'Suspicious individual attempting to access ballot box storage',
      reportedBy: 'Officer Khan',
      timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    },
    {
      id: 'INC-003',
      severity: 'MEDIUM',
      title: 'Electronic voting machine stopped working, backup system activated',
      location: 'Radio Colony Model School',
      status: 'resolved',
      description: 'EVM malfunction resolved by technical support',
      reportedBy: 'Officer Ali',
      timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
    },
    {
      id: 'INC-004',
      severity: 'MEDIUM',
      title: 'Large crowd gathering causing delays',
      location: 'Banasree Model School',
      status: 'resolved',
      description: 'Crowd management completed, voting resumed',
      reportedBy: 'Officer Hassan',
      timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
    },
    {
      id: 'INC-005',
      severity: 'HIGH',
      title: 'Voter intimidation attempts reported',
      location: 'Shusujan Zirnat Ali High School',
      status: 'responded',
      description: 'Multiple voters reporting intimidation near polling center',
      reportedBy: 'Officer Rahim',
      timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    },
    {
      id: 'INC-006',
      severity: 'LOW',
      title: 'Lost and found - Voter ID document',
      location: 'Mirza Golan Hafiz College',
      status: 'resolved',
      description: 'Voter ID document found and returned to owner',
      reportedBy: 'Officer Hassan',
      timestamp: new Date(Date.now() - 4 * 60 * 60000).toISOString(),
    },
    {
      id: 'INC-007',
      severity: 'CRITICAL',
      title: 'Armed individuals spotted near polling center',
      location: 'Savar Girls High School',
      status: 'pending',
      description: 'Armed suspect seen in vicinity of polling station',
      reportedBy: 'Officer Ali',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    {
      id: 'INC-008',
      severity: 'HIGH',
      title: 'Technical issue - Voter list system offline',
      location: 'Sakot Central Hub',
      status: 'acknowledged',
      description: 'Voter verification system temporarily down',
      reportedBy: 'System Admin',
      timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
    },
  ];

  // Load incidents from localStorage and combine with mock data
  useEffect(() => {
    const loadIncidents = () => {
      const stored = localStorage.getItem('reportedIncidents');
      const officerIncidents = stored ? JSON.parse(stored).map((inc: any) => ({
        ...inc,
        gpsLocation: inc.gpsLocation || { lat: 23.8103, lng: 90.4125 },
      })) : [];
      
      // Combine officer-reported incidents with mock incidents
      const combined = [...officerIncidents, ...mockIncidents];
      setIncidents(combined);
    };
    loadIncidents();

    const interval = setInterval(loadIncidents, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredIncidents = filterStatus === 'ALL' 
    ? incidents 
    : incidents.filter(inc => inc.status === filterStatus);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'LOW': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-50 border-red-200';
      case 'HIGH': return 'bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-50 border-yellow-200';
      case 'LOW': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-red-600';
      case 'responded': return 'text-orange-600';
      case 'resolved': return 'text-blue-600';
      case 'acknowledged': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
        >
          <Menu className="w-6 h-6" />
        </button>

        <h1 className="text-xl font-semibold">All Incidents</h1>
        <UserProfileControls role="police" showEditProfile={true} />
      </div>

      {/* Sliding Sidebar Menu */}
      <>
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
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
            <button
              onClick={() => { setSidebarOpen(false); router.push('/dashboard/police'); }}
              className="w-full text-left flex items-start gap-3 p-4 rounded-lg hover:bg-red-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-red-600 mt-1" />
              <div>
                <div className="text-base font-semibold text-gray-900">Back to Dashboard</div>
                <div className="text-sm text-gray-500">Main overview</div>
              </div>
            </button>
          </nav>
        </div>
      </>

      {/* Main Content */}
      <div className="p-6 max-w-6xl mx-auto">
        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['ALL', 'pending', 'responded', 'resolved', 'acknowledged'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 text-sm opacity-75">
                ({incidents.filter(inc => status === 'ALL' || inc.status === status).length})
              </span>
            </button>
          ))}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-red-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-red-600">{incidents.filter(inc => inc.status === 'pending').length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600 opacity-30" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-orange-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Responded</p>
                <p className="text-2xl font-bold text-orange-600">{incidents.filter(inc => inc.status === 'responded').length}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600 opacity-30" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-blue-600">{incidents.filter(inc => inc.status === 'resolved').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600 opacity-30" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-green-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Acknowledged</p>
                <p className="text-2xl font-bold text-green-600">{incidents.filter(inc => inc.status === 'acknowledged').length}</p>
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
                    borderLeftColor: incident.severity === 'CRITICAL' ? '#dc2626' : 
                                   incident.severity === 'HIGH' ? '#ea580c' :
                                   incident.severity === 'MEDIUM' ? '#ca8a04' : '#3b82f6'
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
                        Reported: {new Date(incident.timestamp).toLocaleString()} by {incident.reportedBy || 'Unknown'}
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
                  <p className="text-gray-900">{selectedIncident.reportedBy}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Time</label>
                  <p className="text-gray-900">{new Date(selectedIncident.timestamp).toLocaleString()}</p>
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
