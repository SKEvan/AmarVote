'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import UserProfileControls from '@/components/shared/UserProfileControls';
import { ArrowLeft, AlertTriangle, MapPin, Clock, User, X, Image as ImageIcon } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function PoliceIncidentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const incidentId = params.id as string;

  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false);
  const [handlingNotes, setHandlingNotes] = useState('');
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [fetchedIncidentData, setFetchedIncidentData] = useState<any>(null);

  useEffect(() => {
    const loadIncident = async () => {
      try {
        const response = await fetchWithAuth('/api/incidents');
        if (response.ok) {
          const data = await response.json();
          const found = (data.incidents || []).find((inc: any) => inc._id === incidentId);
          if (found) {
            setIncident({
              ...found,
              id: found._id,
            });
            setFetchedIncidentData(found);
            setHandlingNotes(found.notes || '');
            setHasAcknowledged(found.status === 'Under Investigation' || found.status === 'Resolved');
            
            // Log incident view
            await fetchWithAuth('/api/audit-logs', {
              method: 'POST',
              body: JSON.stringify({
                user: 'Law Enforcement',
                action: 'INCIDENT_VIEWED',
                details: `Viewed ${found.title} incident (${found.severity} severity) - ${incidentId}`,
                ip: 'Client',
              }),
            });
          }
        }
      } catch (error) {
        console.error('Error loading incident:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadIncident();
  }, [incidentId]);

  const handleAcknowledge = async () => {
    if (!incident) return;

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
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = localStorage.getItem('currentUserId');
      
      const updatePayload = {
        incidentId: incidentId,
        status: 'Under Investigation',
        acknowledgedBy: {
          userId: currentUserId || 'unknown',
          name: userData.name || 'Unknown Officer',
          role: userData.role || 'Law Enforcement',
        },
        acknowledgedAt: new Date().toISOString(),
        acknowledgementNotes: handlingNotes,
      };
      
      console.log('Sending acknowledgement payload:', updatePayload);
      
      // Update incident status in database
      const response = await fetch(`/api/incidents`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        const updatedData = await response.json();
        console.log('Acknowledgement response:', updatedData);
        
        setIncident({
          ...incident,
          status: 'Under Investigation',
          acknowledgedBy: updatePayload.acknowledgedBy,
          acknowledgedAt: updatePayload.acknowledgedAt,
          acknowledgementNotes: handlingNotes,
        });
        setFetchedIncidentData(updatedData.incident);
        setHasAcknowledged(true);
        setShowAcknowledgeModal(false);

        // Log incident acknowledgement
        await fetchWithAuth('/api/audit-logs', {
          method: 'POST',
          body: JSON.stringify({
            user: 'Law Enforcement',
            action: 'INCIDENT_ACKNOWLEDGED',
            details: `Acknowledged ${incident.title} incident (${incident.severity}) - ${incidentId}: ${handlingNotes.substring(0, 100)}`,
            ip: 'Client',
          }),
        });

        alert('Incident acknowledged successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to acknowledge incident:', errorData);
        alert('Failed to acknowledge incident: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error acknowledging incident:', error);
      alert('An error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading incident details...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Incident Details</h1>
          <UserProfileControls role="police" showEditProfile={true} />
        </div>

        <div className="p-6 max-w-4xl mx-auto text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Incident Not Found</h2>
          <button
            onClick={() => router.back()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getSeverityBg = (severity: string) => {
    const sev = severity?.toUpperCase();
    switch (sev) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      case 'LOW': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const wordCount = handlingNotes.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-red-700 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Incident Details</h1>
              <p className="text-xs text-red-100">{incident.id}</p>
            </div>
          </div>
          <UserProfileControls role="police" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {/* Severity and Status Badges */}
        <div className="mb-6 flex gap-2">
          <span className={`px-4 py-2 rounded text-sm font-bold ${getSeverityBg(incident.severity)}`}>
            {incident.severity} SEVERITY
          </span>
          <span className={`px-4 py-2 rounded text-sm font-bold ${
            incident.status === 'Resolved' ? 'bg-green-100 text-green-700' :
            incident.status === 'Under Investigation' ? 'bg-blue-100 text-blue-700' :
            incident.status === 'Dismissed' ? 'bg-gray-100 text-gray-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {incident.status.toUpperCase()}
          </span>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photo and Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Evidence */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Photo Evidence</h2>
              </div>
              
              {incident.attachments && incident.attachments.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {incident.attachments.map((attachment: any, index: number) => {
                    // Handle both object format {id, name, type, url, size} and string format (base64 or URL)
                    const isObject = typeof attachment === 'object' && attachment !== null;
                    const imageUrl = isObject ? attachment.url : attachment;
                    const imageName = isObject ? attachment.name : `Evidence ${index + 1}`;
                    
                    // Skip if no valid image URL
                    if (!imageUrl || imageUrl === '') {
                      return null;
                    }
                    
                    return (
                      <div key={isObject ? attachment.id : index} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={imageUrl} 
                          alt={imageName}
                          className="w-full h-96 object-contain bg-white"
                          onError={(e) => {
                            // Handle image load error
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'flex items-center justify-center h-96 bg-gray-100';
                            errorDiv.innerHTML = `
                              <div class="text-center p-4">
                                <svg class="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p class="text-gray-600 text-sm">Failed to load image</p>
                                <p class="text-gray-400 text-xs mt-1">Image may be corrupted or unavailable</p>
                              </div>
                            `;
                            target.parentNode?.appendChild(errorDiv);
                          }}
                        />
                        {isObject && attachment.name && (
                          <div className="p-3 bg-white border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                            {attachment.size && (
                              <p className="text-xs text-gray-500 mt-1">{(attachment.size / 1024).toFixed(1)} KB</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">No photo evidence attached</p>
                  </div>
                </div>
              )}
            </div>

            {/* Incident Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Incident Information</h2>
              
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Title</p>
                  <p className="text-gray-900 font-semibold">{incident.title}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Type</p>
                  <p className="text-gray-900">{incident.type}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Description</p>
                  <p className="text-gray-900">{incident.description}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium mb-1">Polling Center ID</p>
                  <p className="text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">{incident.pollingCenterId}</p>
                </div>
              </div>
            </div>

            {/* Law Enforcement Response - If Available */}
            {(fetchedIncidentData?.acknowledgementNotes || fetchedIncidentData?.resolutionNotes || incident?.resolutionNotes) && (
              <div className="bg-red-50 rounded-lg border-2 border-red-300 p-6">
                <h2 className="text-lg font-semibold text-red-900 mb-4">Law Enforcement Response</h2>
                <div className="bg-white rounded p-4 mb-3 border border-red-200">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {fetchedIncidentData?.acknowledgementNotes || fetchedIncidentData?.resolutionNotes || incident?.resolutionNotes}
                  </p>
                </div>
                {fetchedIncidentData?.acknowledgedAt && fetchedIncidentData?.acknowledgedBy && (
                  <div className="text-sm text-red-700 space-y-1">
                    <p>
                      <strong>Acknowledged By:</strong> {fetchedIncidentData.acknowledgedBy.name} ({fetchedIncidentData.acknowledgedBy.role})
                    </p>
                    <p>
                      <strong>Badge/ID:</strong> {fetchedIncidentData.acknowledgedBy.userId}
                    </p>
                    <p>
                      <strong>Acknowledged At:</strong> {new Date(fetchedIncidentData.acknowledgedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Acknowledge Incident Button */}
            {!hasAcknowledged && (
              <button
                onClick={() => setShowAcknowledgeModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Acknowledge Incident & Add Notes
              </button>
            )}
          </div>

          {/* Right Column - Location and Timeline */}
          <div className="space-y-6">
            {/* Location */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">Location</h2>
              </div>
              
              <p className="text-gray-900 font-semibold mb-1">{incident.location}</p>
              {(incident.gpsLocation || incident.coordinates) && (
                <p className="text-xs text-gray-500 mb-4">
                  Coordinates: {incident.gpsLocation?.lat || incident.coordinates?.lat}, {incident.gpsLocation?.lng || incident.coordinates?.lng}
                </p>
              )}
            </div>

            {/* Time */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Time</h2>
              </div>
              
              <p className="text-gray-900 font-semibold mb-1">Reported At</p>
              <p className="text-gray-600 text-sm">{new Date(incident.reportedAt || incident.createdAt).toLocaleString()}</p>
            </div>

            {/* Reported By */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Reported By</h2>
              </div>
              
              <p className="text-gray-900 font-semibold">{incident.reportedBy?.name || 'Unknown'}</p>
              <p className="text-sm text-gray-500">{incident.reportedBy?.role || 'N/A'}</p>
            </div>

            {/* Status Badge */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
              <div className={`px-4 py-3 rounded-lg text-center font-semibold capitalize ${
                incident.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                incident.status === 'Under Investigation' ? 'bg-blue-100 text-blue-700' :
                incident.status === 'Dismissed' ? 'bg-gray-100 text-gray-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {incident.status}
              </div>
            </div>
          </div>
        </div>
      </main>

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
                  <strong>Incident:</strong> {incident.title}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Please describe how you handled this incident or what action was taken.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Handling Notes (Max 100 words)
                  <span className="text-xs text-gray-500 ml-2">
                    {wordCount > 0 && `${wordCount}/100 words`}
                  </span>
                </label>
                <textarea
                  value={handlingNotes}
                  onChange={(e) => setHandlingNotes(e.target.value)}
                  placeholder="Describe the actions taken, resolution, or current status of handling this incident..."
                  maxLength={400}
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    wordCount > 100
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-red-500'
                  }`}
                />
                {wordCount > 100 && (
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
                  onClick={handleAcknowledge}
                  disabled={wordCount > 100 || handlingNotes.trim().length === 0}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Acknowledge & Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
