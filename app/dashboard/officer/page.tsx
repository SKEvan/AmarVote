'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, User, LogOut, CheckCircle, Save, X, Camera, MapPin, Clock, Upload, FileText, Image, Trash2, Lock, ArrowLeft, ChevronDown } from 'lucide-react';

interface AttachedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

type IncidentType = 'violence' | 'fraud' | 'technical' | 'intimidation' | 'other';
type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

interface Incident {
  id: string;
  type: IncidentType;
  severity: SeverityLevel;
  description: string;
  location: string;
  timestamp: string;
  status: 'pending' | 'submitted';
  attachments: AttachedFile[];
}

export default function OfficerDashboard() {
  const router = useRouter();
  const [pollingCenterId, setPollingCenterId] = useState('PC-DHK-001');
  const [voteSubmissionEnabled, setVoteSubmissionEnabled] = useState(false);
  const [userName, setUserName] = useState('Presiding Officer');
  const [userRole, setUserRole] = useState('Presiding Officer');
  const [voteCounts, setVoteCounts] = useState({
    PA: 0,
    PB: 0,
    PC: 0,
    PD: 0,
    PE: 0,
    PF: 0,
    IND: 0,
  });

  // Load user data from localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.name) setUserName(user.name);
        if (user.role) setUserRole(user.role);
      }
    } catch (e) {
      // ignore errors
    }
  }, []);

  // Check vote submission status from localStorage (set by admin)
  useEffect(() => {
    const checkVoteSubmissionStatus = () => {
      const stored = localStorage.getItem('voteSubmissionEnabled');
      setVoteSubmissionEnabled(stored === 'true');
    };

    // Check on mount
    checkVoteSubmissionStatus();

    // Check periodically (every 2 seconds) in case admin changes it
    const interval = setInterval(checkVoteSubmissionStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  // Check if votes have already been submitted
  useEffect(() => {
    const submittedData = localStorage.getItem('votesSubmitted');
    if (submittedData) {
      const data = JSON.parse(submittedData);
      setSubmittedVoteData(data);
      setShowVoteSubmittedView(true);
    }
  }, []);

  // Check if admin has reset/re-enabled voting (to allow correction)
  useEffect(() => {
    const checkForReset = () => {
      const resetFlag = localStorage.getItem('voteSubmissionReset');
      if (resetFlag === 'true') {
        // Admin has approved the correction request - reset submission
        localStorage.removeItem('votesSubmitted');
        localStorage.removeItem('voteSubmissionReset');
        localStorage.removeItem('correctionRequested');
        setShowVoteSubmittedView(false);
        setSubmittedVoteData(null);
        // Reset vote counts
        setVoteCounts({ PA: 0, PB: 0, PC: 0, PD: 0, PE: 0, PF: 0, IND: 0 });
      }
    };
    
    checkForReset();
    const interval = setInterval(checkForReset, 2000);
    return () => clearInterval(interval);
  }, []);

  // Correction request state
  const [correctionRequested, setCorrectionRequested] = useState(false);
  
  useEffect(() => {
    const requested = localStorage.getItem('correctionRequested');
    if (requested === 'true') {
      setCorrectionRequested(true);
    }
  }, []);

  const handleRequestCorrection = () => {
    if (confirm('Are you sure you want to request a correction? Admin will review your request.')) {
      localStorage.setItem('correctionRequested', 'true');
      setCorrectionRequested(true);
      alert('Correction request submitted. Please wait for admin approval.');
    }
  };

  // Incident Report State
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentType, setIncidentType] = useState<IncidentType>('other');
  const [incidentSeverity, setIncidentSeverity] = useState<SeverityLevel>('medium');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [submittedIncidents, setSubmittedIncidents] = useState<Incident[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVoteSubmittedView, setShowVoteSubmittedView] = useState(false);
  const [submittedVoteData, setSubmittedVoteData] = useState<{ pollingCenter: string; totalVotes: number; submittedBy: string } | null>(null);

  // Additional state for new incident form fields
  const [incidentTitle, setIncidentTitle] = useState('');
  const [gpsLocation, setGpsLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = [];
    
    Array.from(files).forEach((file) => {
      // Check file type (images and PDFs only)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not supported. Only images and PDFs are allowed.`);
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return;
      }

      newFiles.push({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
      });
    });

    setAttachedFiles(prev => [...prev, ...newFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const incidentTypes = [
    { value: 'violence', label: 'Violence/Physical Altercation', icon: '⚠️' },
    { value: 'fraud', label: 'Suspected Fraud', icon: '🚨' },
    { value: 'technical', label: 'Technical Issues', icon: '🔧' },
    { value: 'intimidation', label: 'Voter Intimidation', icon: '😰' },
    { value: 'other', label: 'Other', icon: '📋' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' },
  ];

  const getGPSLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsGettingLocation(false);
        },
        (error) => {
          // Fallback to default Dhaka coordinates
          setGpsLocation({ lat: 23.8103, lng: 90.4125 });
          setIsGettingLocation(false);
        }
      );
    } else {
      // Fallback to default Dhaka coordinates
      setGpsLocation({ lat: 23.8103, lng: 90.4125 });
      setIsGettingLocation(false);
    }
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentTitle.trim()) {
      alert('Please provide an incident title.');
      return;
    }
    if (!incidentDescription.trim()) {
      alert('Please provide a description of the incident.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newIncident: Incident = {
        id: `INC-${Date.now()}`,
        type: incidentType,
        severity: incidentSeverity,
        description: incidentDescription,
        location: incidentLocation || pollingCenterId,
        timestamp: new Date().toISOString(),
        status: 'submitted',
        attachments: [...attachedFiles],
      };

      const updatedIncidents = [newIncident, ...submittedIncidents];
      setSubmittedIncidents(updatedIncidents);
      
      // Save to localStorage so admin and police dashboards can see it
      const existingIncidents = JSON.parse(localStorage.getItem('reportedIncidents') || '[]');
      localStorage.setItem('reportedIncidents', JSON.stringify([newIncident, ...existingIncidents]));
      
      setIsSubmitting(false);
      setShowIncidentModal(false);
      
      // Reset form
      setIncidentTitle('');
      setIncidentType('other');
      setIncidentSeverity('medium');
      setIncidentDescription('');
      setIncidentLocation('');
      setAttachedFiles([]);
      setGpsLocation(null);

      // Show success modal
      setShowSuccessModal(true);
    }, 1000);
  };

  const getSeverityColor = (severity: SeverityLevel) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity];
  };

  const parties = [
    { id: 'PA', name: 'Party A', icon: '🏛️' },
    { id: 'PB', name: 'Party B', icon: '🍃' },
    { id: 'PC', name: 'Party C', icon: '🚗' },
    { id: 'PD', name: 'Party D', icon: '😊' },
    { id: 'PE', name: 'Party E', icon: '⚖️' },
    { id: 'PF', name: 'Party F', icon: '🔨' },
    { id: 'IND', name: 'Independent Candidates', icon: '⭐' },
  ];

  const handleVoteChange = (partyId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setVoteCounts(prev => ({ ...prev, [partyId]: numValue }));
  };

  const totalVotes = Object.values(voteCounts).reduce((sum, count) => sum + count, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm('Are you sure? Vote counts can only be submitted ONCE and cannot be modified.')) {
      console.log({ pollingCenterId, voteCounts, totalVotes });
      // Store submitted vote data
      const voteData = {
        pollingCenter: pollingCenterId,
        totalVotes: totalVotes,
        submittedBy: `${userName} - Dhaka`,
        submittedAt: new Date().toISOString()
      };
      setSubmittedVoteData(voteData);
      // Save to localStorage to persist the submitted state
      localStorage.setItem('votesSubmitted', JSON.stringify(voteData));
      // Show success view (no redirect)
      setShowVoteSubmittedView(true);
    }
  };

  const handleLogout = () => {
    try { localStorage.removeItem('user'); } catch (e) {}
    router.push('/');
  };

  // Show Vote Submitted View
  if (showVoteSubmittedView && submittedVoteData) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Blue Header */}
        <div className="bg-blue-600 shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowVoteSubmittedView(false)}
                className="text-white hover:bg-blue-500 p-1 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-white">Vote Submission Confirmed</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center border-2 border-blue-300">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">Presiding Officer - Dhaka</p>
                  <p className="text-xs text-blue-200">Presiding Officer</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg transition-all duration-200"
              >
                <LogOut className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-base font-semibold text-gray-900">Officer Menu</h2>
                </div>
                
                <div className="p-4 space-y-3">
                  {/* Report Incident Button */}
                  <button 
                    onClick={() => setShowIncidentModal(true)}
                    className="w-full bg-white border-2 border-red-200 rounded-lg p-4 flex items-center gap-3 hover:bg-red-50 transition-all"
                  >
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-red-600">Report Incident</p>
                      <p className="text-xs text-red-400">Always available</p>
                    </div>
                  </button>

                  {/* Voting Status */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Voting Status</p>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-pink-500 rounded-full"></span>
                        <p className="text-sm font-semibold text-pink-600">Voting Ended</p>
                      </div>
                      <p className="text-xs text-gray-600">Center: {submittedVoteData.pollingCenter}</p>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Votes Submitted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Success Card */}
            <div className="col-span-9 flex items-start justify-center pt-12">
              <div className="bg-white rounded-2xl shadow-lg border-2 border-green-400 p-10 max-w-lg w-full text-center">
                {/* Success Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" strokeWidth={2} />
                  </div>
                </div>

                {/* Success Message */}
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Votes Submitted Successfully!
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  Your vote count has been securely recorded<br />
                  and locked. The submission cannot be modified.
                </p>

                {/* Vote Details Box */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                  <div className="space-y-1">
                    <p><span className="font-semibold text-gray-700">Polling Center:</span> <span className="text-gray-600">{submittedVoteData.pollingCenter}</span></p>
                    <p><span className="font-semibold text-gray-700">Total Votes:</span> <span className="text-gray-600">{submittedVoteData.totalVotes}</span></p>
                    <p><span className="font-semibold text-gray-700">Submitted By:</span> <span className="text-gray-600">{submittedVoteData.submittedBy}</span></p>
                  </div>
                </div>

                {/* Request Correction Button */}
                {correctionRequested ? (
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm font-medium">⏳ Correction Request Pending</p>
                    <p className="text-yellow-600 text-xs mt-1">Waiting for admin approval...</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestCorrection}
                    className="mt-6 text-orange-600 text-sm font-medium hover:text-orange-700 transition-colors underline"
                  >
                    Made a mistake? Request Correction
                  </button>
                )}

                {/* Info text */}
                <p className="text-gray-400 text-xs mt-4">
                  Vote submission is now disabled. Incident reporting remains available.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Keep Incident Report Modal available */}
        {showIncidentModal && (
          <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto">
            {/* Blue Header */}
            <div className="bg-blue-600 text-white px-4 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowIncidentModal(false)}
                  className="p-1 hover:bg-blue-500 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-semibold">Report Incident</h1>
                  <p className="text-sm text-blue-100">Presiding Officer</p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleIncidentSubmit} className="max-w-2xl mx-auto p-4 space-y-4">
              
              {/* Photo Evidence Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Photo Evidence</span>
                  <span className="text-gray-400 text-sm">(Optional)</span>
                </div>
                
                {/* Upload Area */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl py-10 text-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload photo</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Attached Files Preview */}
                {attachedFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {attachedFiles.map((file) => (
                      <div key={file.id} className="relative group">
                        {file.type.startsWith('image/') ? (
                          <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="aspect-square rounded-lg bg-red-100 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-red-600" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Incident Details Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Incident Details</h3>
                
                {/* Incident Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Incident Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={incidentTitle}
                    onChange={(e) => setIncidentTitle(e.target.value)}
                    placeholder="Brief description of the incident"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Incident Type Dropdown */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Incident Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={incidentType}
                      onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      {incidentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Severity Level */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Severity Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['low', 'medium', 'high', 'critical'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setIncidentSeverity(level as SeverityLevel)}
                        className={`py-2.5 px-3 border-2 rounded-lg text-sm font-medium transition-all ${
                          incidentSeverity === level
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {level.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={incidentDescription}
                    onChange={(e) => setIncidentDescription(e.target.value)}
                    placeholder="Detailed description of what happened"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Polling Center ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Polling Center ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={incidentLocation || pollingCenterId}
                    onChange={(e) => setIncidentLocation(e.target.value)}
                    placeholder="e.g., DHK-PS-001"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-900">Location</span>
                  </div>
                  <button
                    type="button"
                    onClick={getGPSLocation}
                    disabled={isGettingLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <MapPin className="w-4 h-4" />
                    {isGettingLocation ? 'Getting...' : 'Get GPS Location'}
                  </button>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-800">Auto-detected location</p>
                  <p className="text-gray-500">
                    Coordinates: {gpsLocation ? `${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}` : '23.8103, 90.4125'}
                  </p>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex gap-3 pt-2 pb-8">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="flex-1 px-6 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      Submit Incident Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Incident Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full mx-4 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" strokeWidth={2} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Incident Reported Successfully!
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Your incident report has been submitted and<br />
                law enforcement has been notified.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-indigo-600 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Vote Entry Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{userName}</p>
                <p className="text-xs text-indigo-200">{userRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">Officer Menu</h2>
              </div>
              
              <div className="p-4 space-y-3">
                {/* Report Incident Button */}
                <button 
                  onClick={() => setShowIncidentModal(true)}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 border border-red-600 rounded-lg p-4 flex items-center gap-3 hover:from-red-600 hover:to-red-700 transition-all shadow-sm"
                >
                  <AlertTriangle className="w-5 h-5 text-white" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">Report Incident</p>
                    <p className="text-xs text-red-100">Always available</p>
                  </div>
                </button>

                {/* Voting Status */}
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Voting Status</p>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 ${voteSubmissionEnabled ? 'bg-green-500' : 'bg-green-500'} rounded-full`}></span>
                      <p className={`text-sm font-semibold ${voteSubmissionEnabled ? 'text-green-700' : 'text-green-700'}`}>
                        {voteSubmissionEnabled ? 'Voting Ended' : 'Voting In Progress'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600">Center: {pollingCenterId}</p>
                    <button 
                      type="button"
                      className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Enter Vote Results
                    </button>
                  </div>
                </div>

                {/* Submitted Incidents - Review in Sidebar */}
                {submittedIncidents.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-red-50 border-b border-red-200 p-3">
                      <p className="text-xs font-semibold text-red-800">
                        📋 {submittedIncidents.length} Incident(s) Reported
                      </p>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {submittedIncidents.map((incident) => (
                        <div 
                          key={incident.id}
                          onClick={() => {
                            setSelectedIncident(incident);
                            setShowReviewModal(true);
                          }}
                          className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {incidentTypes.find(t => t.value === incident.type)?.icon}
                              </span>
                              <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${getSeverityColor(incident.severity)}`}>
                                {incident.severity.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-[10px] text-indigo-600 font-medium">View →</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">{incident.description}</p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(incident.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="space-y-6">
              {/* Status Alert - Dynamic based on vote submission status */}
              {voteSubmissionEnabled ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Voting Period Has Ended</p>
                    <p className="text-sm text-green-700">You can now submit vote counts from your polling center</p>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-full py-3 px-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-800" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-yellow-900">Voting In Progress</p>
                    <p className="text-xs text-yellow-700">Vote entry will be unlocked when voting period ends</p>
                  </div>
                </div>
              )}

              {/* Vote Entry Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-indigo-900 mb-6">Party-wise Vote Entry</h2>
                
                {/* Locked Warning Banner */}
                {!voteSubmissionEnabled && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-700">Vote entry is locked until voting period ends</p>
                      <p className="text-xs text-orange-600">Please wait for official voting period to end</p>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Polling Center ID */}
                  <div>
                    <label htmlFor="polling-center" className="block text-sm font-medium text-gray-700 mb-2">
                      Polling Center ID
                    </label>
                    <input
                      id="polling-center"
                      type="text"
                      value={pollingCenterId}
                      onChange={(e) => setPollingCenterId(e.target.value)}
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${!voteSubmissionEnabled ? 'bg-gray-100 text-gray-500' : ''}`}
                      readOnly
                      disabled={!voteSubmissionEnabled}
                    />
                  </div>

                  {/* Party Vote Inputs */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Enter Vote Counts by Party</h3>
                    <div className="space-y-3">
                      {parties.map((party) => (
                        <div key={party.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div className="w-8 h-8 flex items-center justify-center text-xl">
                            {party.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{party.id}</p>
                            <p className="text-xs text-gray-600">{party.name}</p>
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={voteCounts[party.id as keyof typeof voteCounts]}
                            onChange={(e) => handleVoteChange(party.id, e.target.value)}
                            className={`w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center ${!voteSubmissionEnabled ? 'bg-gray-100 text-gray-400' : 'bg-gray-50'}`}
                            placeholder="0"
                            disabled={!voteSubmissionEnabled}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Votes */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 bg-blue-50 -mx-6 px-6 py-4 -mb-6 rounded-b-lg">
                    <p className="text-base font-medium text-gray-700">Total Votes:</p>
                    <p className="text-2xl font-bold text-blue-600">{totalVotes}</p>
                  </div>
                </form>
              </div>

              {/* Submit Button - Outside form card */}
              {voteSubmissionEnabled ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save className="w-5 h-5" />
                  Submit Vote Counts (One-Time Only)
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full bg-gray-300 text-gray-500 font-semibold py-3.5 px-4 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  Vote Entry Locked
                </button>
              )}

              {/* Important Information */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900 mb-2">Important Information</p>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                      <li>Vote entry is LOCKED until the official voting period ends</li>
                      <li>Once submitted, votes CANNOT be modified or resubmitted</li>
                      <li>Each polling center can submit votes only ONCE</li>
                      <li>Incident reporting remains available at all times</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Incident Report Modal - Full Page Style */}
      {showIncidentModal && (
        <div className="fixed inset-0 bg-gray-100 z-50 overflow-y-auto">
          {/* Blue Header */}
          <div className="bg-blue-600 text-white px-4 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowIncidentModal(false)}
                className="p-1 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-semibold">Report Incident</h1>
                <p className="text-sm text-blue-100">Presiding Officer</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleIncidentSubmit} className="max-w-2xl mx-auto p-4 space-y-4">
            
            {/* Photo Evidence Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Photo Evidence</span>
                <span className="text-gray-400 text-sm">(Optional)</span>
              </div>
              
              {/* Upload Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl py-10 text-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload photo</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Attached Files Preview */}
              {attachedFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {attachedFiles.map((file) => (
                    <div key={file.id} className="relative group">
                      {file.type.startsWith('image/') ? (
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-square rounded-lg bg-red-100 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-red-600" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incident Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Incident Details</h3>
              
              {/* Incident Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Incident Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  placeholder="Brief description of the incident"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Incident Type Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Incident Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    {incidentTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Severity Level */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Severity Level <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['low', 'medium', 'high', 'critical'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setIncidentSeverity(level as SeverityLevel)}
                      className={`py-2.5 px-3 border-2 rounded-lg text-sm font-medium transition-all ${
                        incidentSeverity === level
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {level.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  placeholder="Detailed description of what happened"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Polling Center ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Polling Center ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={incidentLocation || pollingCenterId}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  placeholder="e.g., DHK-PS-001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Location</span>
                </div>
                <button
                  type="button"
                  onClick={getGPSLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4" />
                  {isGettingLocation ? 'Getting...' : 'Get GPS Location'}
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-800">Auto-detected location</p>
                <p className="text-gray-500">
                  Coordinates: {gpsLocation ? `${gpsLocation.lat.toFixed(4)}, ${gpsLocation.lng.toFixed(4)}` : '23.8103, 90.4125'}
                </p>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex gap-3 pt-2 pb-8">
              <button
                type="button"
                onClick={() => setShowIncidentModal(false)}
                className="flex-1 px-6 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Submit Incident Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Incident Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full mx-4 text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" strokeWidth={2} />
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Incident Reported Successfully!
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Your incident report has been submitted and<br />
              law enforcement has been notified.
            </p>

            {/* Close Button - Auto close after 3 seconds */}
            <button
              onClick={() => setShowSuccessModal(false)}
              className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Incident Review Modal */}
      {showReviewModal && selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  selectedIncident.severity === 'critical' ? 'bg-red-100' :
                  selectedIncident.severity === 'high' ? 'bg-orange-100' :
                  selectedIncident.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  {incidentTypes.find(t => t.value === selectedIncident.type)?.icon}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Incident Report Details</h2>
                  <p className="text-sm text-gray-600">ID: {selectedIncident.id}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedIncident(null);
                }}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Report Submitted Successfully</p>
                  <p className="text-xs text-green-700">Authorities have been notified and are reviewing this incident.</p>
                </div>
              </div>

              {/* Incident Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Incident Type */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Incident Type</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {incidentTypes.find(t => t.value === selectedIncident.type)?.label}
                  </p>
                </div>

                {/* Severity */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Severity Level</p>
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getSeverityColor(selectedIncident.severity)}`}>
                    {selectedIncident.severity.toUpperCase()}
                  </span>
                </div>

                {/* Location */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">{selectedIncident.location}</p>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Reported At</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(selectedIncident.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Description</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-800 leading-relaxed">{selectedIncident.description}</p>
                </div>
              </div>

              {/* Attachments */}
              {selectedIncident.attachments && selectedIncident.attachments.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Attachments ({selectedIncident.attachments.length})
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedIncident.attachments.map((file) => (
                      <div key={file.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                        {file.type.startsWith('image/') ? (
                          <div>
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="block">
                              <div className="aspect-video bg-gray-100 relative group">
                                <img 
                                  src={file.url} 
                                  alt={file.name} 
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                  <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                                    Click to view
                                  </span>
                                </div>
                              </div>
                            </a>
                            <div className="p-3">
                              <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                        ) : (
                          <a 
                            href={file.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              <p className="text-xs text-indigo-600 mt-1">Click to open PDF</p>
                            </div>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Report Timeline</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Incident Reported</p>
                      <p className="text-xs text-gray-500">{new Date(selectedIncident.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Under Review</p>
                      <p className="text-xs text-gray-500">Authorities are reviewing this report</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 opacity-50">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Resolution Pending</p>
                      <p className="text-xs text-gray-400">Awaiting action from authorities</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedIncident(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-white transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
