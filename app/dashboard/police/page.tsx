'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, LogOut, User, Navigation, CheckCircle, AlertTriangle, Clock, MapPinIcon, UserCog, X, Menu, Home } from 'lucide-react';
import UserProfileControls from '@/components/shared/UserProfileControls';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function PoliceDashboard() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const [officerIncidents, setOfficerIncidents] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [allIncidentsList, setAllIncidentsList] = useState<any[]>([]);
  const [activeUnacknowledgedIncidents, setActiveUnacknowledgedIncidents] = useState<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [acknowledgeIncidentId, setAcknowledgeIncidentId] = useState<string | null>(null);
  const [handlingNotes, setHandlingNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load incidents from database
  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const response = await fetchWithAuth('/api/incidents');
        if (response.ok) {
          const data = await response.json();
          const incidents = (data.incidents || []).map((inc: any) => ({
            ...inc,
            id: inc._id,
            gpsLocation: inc.coordinates || { lat: 23.8103, lng: 90.4125 },
            coordinates: inc.coordinates || { lat: 23.8103, lng: 90.4125 },
          }));
          
          setOfficerIncidents(incidents);
          setAllIncidentsList(incidents);
          
          // Filter active unacknowledged incidents
          const unacknowledged = incidents.filter((inc: any) => 
            inc.status === 'Reported' && 
            !inc.acknowledgedBy
          );
          setActiveUnacknowledgedIncidents(unacknowledged);
        } else {
          console.error('Failed to fetch incidents:', response.status);
        }
      } catch (error) {
        console.error('Error loading incidents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadIncidents();
    // Auto-refresh disabled for performance
    // const interval = setInterval(loadIncidents, 30000);
    // return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    router.push('/');
  };

  const handleAcknowledge = (incidentId: string) => {
    setAcknowledgeIncidentId(incidentId);
    setHandlingNotes('');
    setShowAcknowledgeModal(true);
  };

  const handleConfirmAcknowledge = async () => {
    if (!acknowledgeIncidentId) return;

    if (handlingNotes.trim().length === 0) {
      alert('Please add handling notes before acknowledging');
      return;
    }

    const wordCount = handlingNotes.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 100) {
      alert('Handling notes must be 100 words or less');
      return;
    }

    try {
      // Get current user info
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const currentUserId = localStorage.getItem('currentUserId');

      const response = await fetchWithAuth('/api/incidents', {
        method: 'PATCH',
        body: JSON.stringify({
          incidentId: acknowledgeIncidentId,
          status: 'Reported',
          acknowledgedBy: {
            userId: currentUserId || '',
            name: currentUser?.name || 'Unknown Officer',
            role: 'Police'
          },
          acknowledgedAt: new Date().toISOString(),
          acknowledgementNotes: handlingNotes,
          resolutionNotes: handlingNotes,
        }),
      });

      if (response.ok) {
        // Refresh incidents from database
        const fetchResponse = await fetchWithAuth('/api/incidents');
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          const incidents = (data.incidents || []).map((inc: any) => ({
            ...inc,
            id: inc._id,
            gpsLocation: inc.coordinates || { lat: 23.8103, lng: 90.4125 },
            coordinates: inc.coordinates || { lat: 23.8103, lng: 90.4125 },
          }));
          setOfficerIncidents(incidents);
        }
        
        setShowAcknowledgeModal(false);
        setAcknowledgeIncidentId(null);
        setHandlingNotes('');
        alert('Incident acknowledged successfully!');
      } else {
        const errorData = await response.json();
        alert('Failed to acknowledge incident: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error acknowledging incident:', error);
      alert('An error occurred');
    }
  };

  const handleNavigate = (incident: any) => {
    // If incident has GPS coordinates, open in Google Maps
    if (incident.gpsLocation) {
      const { lat, lng } = incident.gpsLocation;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      // Fallback to location string search
      const location = encodeURIComponent(incident.location);
      window.open(`https://www.google.com/maps/search/?api=1&query=${location}`, '_blank');
    }
  };

  const handleViewDetails = (incident: any) => {
    setSelectedIncident(incident);
    setShowDetailsModal(true);
  };

  const handleViewMap = (incidentId: string) => {
    router.push('/dashboard/police/map');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between">
          {/* Hamburger Menu Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200 mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-xl font-semibold">Law Enforcement Alert System</h1>
          <UserProfileControls role="police" showEditProfile={true} />
        </div>
      </header>

      {/* Sliding Sidebar Menu */}
      <>
        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        {/* Sidebar */}
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
              className="flex items-start gap-3 p-4 rounded-lg hover:bg-red-50 transition-colors border-2 border-red-500 bg-red-50"
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
              className="flex items-start gap-3 p-4 rounded-lg hover:bg-red-50 transition-colors"
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

      <div className="flex">
        {/* Removed Static Sidebar - Now using sliding menu */}
        <div className="flex-1 p-6 max-w-[1600px] mx-auto">
          {/* Priority Levels Legend */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Priority Levels</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-red-600 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-700">High Priority</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-700">Medium Priority</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-700">Acknowledged</span>
              </div>
            </div>
          </div>

          {/* Statistics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-red-600 font-bold text-2xl">{officerIncidents.filter(inc => inc.status === 'Reported' || inc.status === 'Under Investigation').length}</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Active Alerts</h3>
              <p className="text-xs text-gray-500 mt-1">Pending incidents</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-orange-600 font-bold text-2xl">{officerIncidents.filter(inc => inc.severity?.toLowerCase() === 'high' || inc.severity?.toLowerCase() === 'critical').length}</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">High Priority</h3>
              <p className="text-xs text-gray-500 mt-1">Urgent response needed</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-blue-600 font-bold text-2xl">{officerIncidents.length}</span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">From Officers</h3>
              <p className="text-xs text-gray-500 mt-1">Field reported</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-green-600 font-bold text-2xl">
                  {officerIncidents.length > 0 ? officerIncidents.length : '-'}
                </span>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">Total Incidents</h3>
              <p className="text-xs text-gray-500 mt-1">All reported</p>
            </div>
          </div>

          {/* Active Unacknowledged Incidents Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Active Unacknowledged Incidents</h2>
                <p className="text-sm text-gray-500 mt-1">Real-time incident monitoring and response</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  {activeUnacknowledgedIncidents.length} Active
                </div>
                <Link
                  href="/dashboard/police/map"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  View Map
                </Link>
              </div>
            </div>

            {activeUnacknowledgedIncidents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="text-lg font-medium">All incidents have been acknowledged</p>
              </div>
            ) : (
              <div className="space-y-5">
                {activeUnacknowledgedIncidents.map((incident: any) => {
                  const severityColors: Record<string, { bg: string; border: string; badge: string; shadow: string }> = {
                    low: { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-600', shadow: 'hover:shadow-blue-200' },
                    medium: { bg: 'bg-yellow-50', border: 'border-yellow-300', badge: 'bg-yellow-600', shadow: 'hover:shadow-yellow-200' },
                    high: { bg: 'bg-orange-50', border: 'border-orange-300', badge: 'bg-orange-600', shadow: 'hover:shadow-orange-200' },
                    critical: { bg: 'bg-red-50', border: 'border-red-300', badge: 'bg-red-600', shadow: 'hover:shadow-red-200' },
                  };
                  const colors = severityColors[incident.severity?.toLowerCase()] || severityColors.medium;
                  const incidentTime = new Date(incident.reportedAt || incident.createdAt);
                  const timeStr = incidentTime.toLocaleTimeString('en-US', { hour12: false });
                  const minutesAgo = Math.floor((Date.now() - incidentTime.getTime()) / 60000);
                  
                  return (
                    <div key={incident.id} className={`${colors.bg} border ${colors.border} rounded-xl p-6 shadow-sm ${colors.shadow} hover:shadow-lg transition-all duration-300`}>
                      <div className="flex items-start gap-3 mb-4">
                        <span className={`${colors.badge} text-white font-bold text-xs px-3 py-1 rounded-md`}>
                          {incident.severity?.toUpperCase() || 'MEDIUM'}
                        </span>
                        <span className="text-gray-600 font-semibold">{incident.id}</span>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md ml-auto">
                          🆕 {incident.reportedBy?.name || 'Officer'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {incident.title || 'Incident Report'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{incident.description}</p>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPinIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900">{incident.location}</p>
                            <p className="text-sm text-gray-500">Polling Center</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900">{timeStr}</p>
                            <p className="text-sm text-gray-500">{minutesAgo} min ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="font-semibold text-gray-900">{incident.severity?.charAt(0).toUpperCase() + incident.severity?.slice(1).toLowerCase() || 'Medium'}</p>
                            <p className="text-sm text-gray-500">Severity Level</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleNavigate(incident)}
                          className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <Navigation className="w-4 h-4" />
                          Navigate
                        </button>
                        <button
                          onClick={() => handleAcknowledge(incident.id)}
                          className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Acknowledge & Add Notes
                        </button>
                        <button
                          onClick={() => handleViewDetails(incident)}
                          className="bg-gray-100 text-gray-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 border border-gray-300 shadow-sm"
                        >
                          <MapPin className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Incident Details Modal */}
      {showDetailsModal && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between sticky top-0">
              <div>
                <h2 className="text-xl font-bold">Incident Details</h2>
                <p className="text-sm text-red-100">ID: {selectedIncident.id}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-red-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="font-semibold text-gray-900 capitalize">{selectedIncident.status || 'Pending'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Severity</p>
                  <p className={`font-semibold capitalize ${
                    selectedIncident.severity?.toLowerCase() === 'high' || selectedIncident.severity?.toLowerCase() === 'critical'
                      ? 'text-red-600'
                      : selectedIncident.severity?.toLowerCase() === 'medium'
                      ? 'text-orange-600'
                      : 'text-blue-600'
                  }`}>
                    {selectedIncident.severity || 'Medium'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedIncident.description}</p>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedIncident.location}</p>
                    {selectedIncident.gpsLocation && (
                      <p className="text-sm text-gray-600 mt-1">
                        GPS: {selectedIncident.gpsLocation.lat.toFixed(6)}, {selectedIncident.gpsLocation.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reported Time</h3>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5" />
                  <p>{new Date(selectedIncident.reportedAt || selectedIncident.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedIncident.attachments && selectedIncident.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments ({selectedIncident.attachments.length})</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedIncident.attachments.map((file: any, index: number) => {
                      // Handle both object format and string format
                      const isObject = typeof file === 'object' && file !== null;
                      const imageUrl = isObject ? file.url : file;
                      const fileName = isObject ? file.name : `Evidence ${index + 1}`;
                      const fileSize = isObject ? file.size : null;
                      const fileType = isObject ? file.type : 'image/';
                      
                      return (
                        <div key={isObject ? file.id : index} className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-400 transition-colors group">
                          {(!isObject || fileType.startsWith('image/')) ? (
                            <div className="relative">
                              <img 
                                src={imageUrl} 
                                alt={fileName}
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                <button
                                  onClick={() => window.open(imageUrl, '_blank')}
                                  className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium transition-opacity"
                                >
                                  View Full Size
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="h-48 bg-gray-100 flex items-center justify-center">
                              <div className="text-center">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <p className="text-xs text-gray-500">PDF Document</p>
                              </div>
                            </div>
                          )}
                          <div className="p-3 bg-white">
                            <p className="font-medium text-sm text-gray-900 truncate">{fileName}</p>
                            {fileSize && <p className="text-xs text-gray-500 mt-1">{(fileSize / 1024).toFixed(1)} KB</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleNavigate(selectedIncident);
                  }}
                  className="flex-1 bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Navigation className="w-5 h-5" />
                  Navigate to Location
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleAcknowledge(selectedIncident.id);
                  }}
                  disabled={selectedIncident.status === 'Under Investigation' || selectedIncident.status === 'Resolved'}
                  className={`flex-1 font-semibold px-5 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    selectedIncident.status === 'Under Investigation' || selectedIncident.status === 'Resolved'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  {selectedIncident.status === 'Under Investigation' || selectedIncident.status === 'Resolved' ? 'Acknowledged' : 'Acknowledge & Add Notes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledge Modal */}
      {showAcknowledgeModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowAcknowledgeModal(false)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto shadow-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Acknowledge Incident</h2>
                <button
                  onClick={() => setShowAcknowledgeModal(false)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Incident ID:</strong> {acknowledgeIncidentId}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Please describe how you handled this incident or what action was taken.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Handling Notes (Max 100 words)
                  <span className="text-xs text-gray-500 ml-2">
                    {handlingNotes.trim().split(/\s+/).filter(word => word.length > 0).length > 0 && 
                      `${handlingNotes.trim().split(/\s+/).filter(word => word.length > 0).length}/100 words`}
                  </span>
                </label>
                <textarea
                  value={handlingNotes}
                  onChange={(e) => setHandlingNotes(e.target.value)}
                  placeholder="Describe the actions taken, resolution, or current status of handling this incident..."
                  maxLength={400}
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    handlingNotes.trim().split(/\s+/).filter(word => word.length > 0).length > 100
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                />
                {handlingNotes.trim().split(/\s+/).filter(word => word.length > 0).length > 100 && (
                  <p className="text-xs text-red-600 mt-1">⚠️ Notes exceed 100 words limit</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAcknowledgeModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAcknowledge}
                  disabled={handlingNotes.trim().split(/\s+/).filter(word => word.length > 0).length > 100 || handlingNotes.trim().length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Acknowledge & Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
