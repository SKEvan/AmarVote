'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AlertTriangle, User, LogOut, CheckCircle, Save, X, Camera, MapPin, Clock, Upload, FileText, Trash2, Lock, ArrowLeft, ChevronDown } from 'lucide-react';
import UserProfileControls from '@/components/shared/UserProfileControls';
import OfficerSlidingSidebar from '@/components/shared/OfficerSlidingSidebar';
import CustomModal from '@/components/shared/CustomModal';
import { useModal } from '@/hooks/useModal';
import { addAuditLog, AuditActions } from '@/lib/auditLog';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

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
  gpsLocation?: { lat: number; lng: number };
}

export default function OfficerDashboard() {
  const router = useRouter();
  const modal = useModal();
  const [pollingCenterId, setPollingCenterId] = useState('');
  const [pollingCenterName, setPollingCenterName] = useState('');
  const [voteSubmissionEnabled, setVoteSubmissionEnabled] = useState(false);
  const [isInResubmissionWindow, setIsInResubmissionWindow] = useState(false);
  const [userName, setUserName] = useState('Presiding Officer');
  const [userRole, setUserRole] = useState('Presiding Officer');
  const [totalVoters, setTotalVoters] = useState<number>(0);
  const [voteCounts, setVoteCounts] = useState({
    PA: 0,
    PB: 0,
    PC: 0,
    PD: 0,
    PE: 0,
    PF: 0,
    IND: 0,
  });
  
  // Track if we've already processed a reset to prevent multiple resets
  const hasProcessedResetRef = useRef(false);

  // Load user data from localStorage and database
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First, try to load from localStorage immediately for faster initial render
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.name) setUserName(user.name);
          if (user.role) setUserRole(user.role);
          if (user.pollingCenterId) setPollingCenterId(user.pollingCenterId);
          if (user.pollingCenterName) setPollingCenterName(user.pollingCenterName);
        }
        
        const currentUserId = localStorage.getItem('currentUserId');
        
        if (currentUserId) {
          // Load from database API to get most up-to-date data
          const response = await fetch(`/api/users?userId=${currentUserId}`);
          
          if (response.ok) {
            const data = await response.json();
            const userFromDb = data.user;
            
            if (userFromDb) {
              setUserName(userFromDb.name);
              
              // Load polling center information
              if (userFromDb.pollingCenterId) {
                setPollingCenterId(userFromDb.pollingCenterId);
              }
              if (userFromDb.pollingCenterName) {
                setPollingCenterName(userFromDb.pollingCenterName);
              }
              
              // Update localStorage with latest data
              const updatedUserData = {
                name: userFromDb.name,
                role: 'Presiding Officer',
                avatar: userFromDb.avatar || '',
                userId: userFromDb._id,
                phone: userFromDb.phone || '',
                email: userFromDb.email,
                pollingCenterId: userFromDb.pollingCenterId || '',
                pollingCenterName: userFromDb.pollingCenterName || ''
              };
              localStorage.setItem('user', JSON.stringify(updatedUserData));
            }
          }
        }
      } catch (e) {
        console.error('Error loading user data:', e);
      }
    };
    
    loadUserData();
  }, []);

  // Check vote submission status from localStorage (set by admin)
  useEffect(() => {
    const checkVoteSubmissionStatus = () => {
      const stored = localStorage.getItem('voteSubmissionEnabled');
      setVoteSubmissionEnabled(stored === 'true');
    };

    // Check on mount
    checkVoteSubmissionStatus();

    // Check periodically (every 10 seconds) in case admin changes it
    const interval = setInterval(checkVoteSubmissionStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  // Check if votes have already been submitted for this polling center
  useEffect(() => {
    if (!pollingCenterId) return;

    try {
      const raw = localStorage.getItem('votesSubmissions');
      const submissions: any[] = raw ? JSON.parse(raw) : [];
      const existing = submissions.find((entry) => entry.pollingCenter === pollingCenterId);

      if (existing) {
        setSubmittedVoteData(existing);
        setShowVoteSubmittedView(true);
      } else {
        setSubmittedVoteData(null);
        setShowVoteSubmittedView(false);
      }
    } catch (err) {
      console.error('Error checking vote submission status', err);
    }
  }, [pollingCenterId]);

  // Check if admin has reset/re-enabled voting (to allow correction)
  useEffect(() => {
    const checkForReset = async () => {
      const centerResetKey = `voteSubmissionReset_${pollingCenterId || ''}`;
      const resubmitWindowKey = `voteResubmissionWindow_${pollingCenterId || ''}`;
      const resetFlag = localStorage.getItem(centerResetKey) || localStorage.getItem('voteSubmissionReset');
      const resubmitWindow = localStorage.getItem(resubmitWindowKey);
      
      if (resetFlag === 'true' && !hasProcessedResetRef.current) {
        // Admin has approved the correction request - reset submission and enable resubmission window
        // This should only run ONCE when the reset flag is first detected
        hasProcessedResetRef.current = true;
        setIsInResubmissionWindow(true);
        
        try {
          // Fetch the previously submitted vote data from the API to pre-fill the form
          const response = await fetchWithAuth(`/api/votes?pollingCenterId=${pollingCenterId}`);
          if (response.ok) {
            const data = await response.json();
            const existingVote = data.votes?.find((v: any) => v.pollingCenter === pollingCenterId);
            
            if (existingVote && existingVote.partyVotes) {
              // Pre-fill the form with previously submitted values
              setVoteCounts({
                PA: existingVote.partyVotes.PA || 0,
                PB: existingVote.partyVotes.PB || 0,
                PC: existingVote.partyVotes.PC || 0,
                PD: existingVote.partyVotes.PD || 0,
                PE: existingVote.partyVotes.PE || 0,
                PF: existingVote.partyVotes.PF || 0,
                IND: existingVote.partyVotes.IND || 0,
              });
              setTotalVoters(existingVote.totalVoters || 0);
            }
          }
          
          // Remove this center's submission from the multi-center list in localStorage
          const raw = localStorage.getItem('votesSubmissions');
          const existing: any[] = raw ? JSON.parse(raw) : [];
          const filtered = existing.filter((entry) => entry.pollingCenter !== pollingCenterId);
          localStorage.setItem('votesSubmissions', JSON.stringify(filtered));
        } catch (e) {
          console.error('Error loading previous vote data for correction', e);
          // If fetch fails, reset to 0
          setVoteCounts({ PA: 0, PB: 0, PC: 0, PD: 0, PE: 0, PF: 0, IND: 0 });
        }

        localStorage.removeItem('votesSubmitted');
        localStorage.removeItem('voteSubmissionReset');
        localStorage.removeItem(centerResetKey);
        const correctionKey = `correctionRequested_${pollingCenterId || ''}`;
        localStorage.removeItem(correctionKey);
        localStorage.removeItem('correctionRequested');

        // Persist that correction has been consumed for this center
        const correctionUsedKey = `correctionUsed_${pollingCenterId || ''}`;
        localStorage.setItem(correctionUsedKey, 'true');
        setCorrectionUsed(true);

        setCorrectionRequested(false);

        setShowVoteSubmittedView(false);
        setSubmittedVoteData(null);
      } else if (resubmitWindow === 'true') {
        // Just maintain the resubmission window state without resetting anything
        setIsInResubmissionWindow(true);
        
        // Also pre-fill data when re-entering the resubmission window
        if (!hasProcessedResetRef.current) {
          try {
            const response = await fetchWithAuth(`/api/votes?pollingCenterId=${pollingCenterId}`);
            if (response.ok) {
              const data = await response.json();
              const existingVote = data.votes?.find((v: any) => v.pollingCenter === pollingCenterId);
              
              if (existingVote && existingVote.partyVotes) {
                setVoteCounts({
                  PA: existingVote.partyVotes.PA || 0,
                  PB: existingVote.partyVotes.PB || 0,
                  PC: existingVote.partyVotes.PC || 0,
                  PD: existingVote.partyVotes.PD || 0,
                  PE: existingVote.partyVotes.PE || 0,
                  PF: existingVote.partyVotes.PF || 0,
                  IND: existingVote.partyVotes.IND || 0,
                });
                setTotalVoters(existingVote.totalVoters || 0);
              }
            }
          } catch (e) {
            console.error('Error loading vote data', e);
          }
        }
      } else {
        // No active resubmission window
        setIsInResubmissionWindow(false);
        hasProcessedResetRef.current = false; // Reset the flag when window closes
      }
    };
    
    checkForReset();
    const interval = setInterval(checkForReset, 10000);
    return () => clearInterval(interval);
  }, [pollingCenterId]);

  // Correction request state
  const [correctionRequested, setCorrectionRequested] = useState(false);
  const [correctionUsed, setCorrectionUsed] = useState(false);
  
  useEffect(() => {
    const correctionKey = `correctionRequested_${pollingCenterId || ''}`;
    const correctionUsedKey = `correctionUsed_${pollingCenterId || ''}`;
    const requested = localStorage.getItem(correctionKey) || localStorage.getItem('correctionRequested');
    setCorrectionRequested(requested === 'true');

    const used = localStorage.getItem(correctionUsedKey);
    setCorrectionUsed(used === 'true');
  }, [pollingCenterId]);

  const handleRequestCorrection = () => {
    if (correctionUsed) {
      modal.showAlert(
        'You have already used your one-time correction for this polling center.',
        'warning',
        'Correction Already Used'
      );
      return;
    }

    modal.showConfirm(
      'Are you sure you want to request a correction? Admin will review your request.',
      () => {
        const correctionKey = `correctionRequested_${pollingCenterId || ''}`;
        const meta = {
          officerName: userName,
          pollingCenterId,
          pollingCenterName,
          requestedAt: new Date().toISOString(),
        };

        localStorage.setItem('correctionRequested', 'true');
        localStorage.setItem(correctionKey, 'true');
        localStorage.setItem('correctionRequestMeta', JSON.stringify(meta));
        setCorrectionRequested(true);
        modal.showAlert(
          'Correction request submitted. Please wait for admin approval.',
          'success',
          'Request Submitted'
        );
      },
      {
        variant: 'warning',
        title: 'Request Correction',
        confirmText: 'Submit Request',
        cancelText: 'Cancel'
      }
    );
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
  const [submittedVoteData, setSubmittedVoteData] = useState<{ pollingCenter: string; totalVotes: number; submittedBy: { userId: string; name: string; email?: string } } | null>(null);

  // Additional state for new incident form fields
  const [incidentTitle, setIncidentTitle] = useState('');
  const [gpsLocation, setGpsLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Keep incident location locked to the officer's polling center
  useEffect(() => {
    if (pollingCenterId) {
      setIncidentLocation(pollingCenterId);
    }
  }, [pollingCenterId]);

  // Load incidents from database for this officer
  useEffect(() => {
    const loadIncidentsFromDatabase = async () => {
      try {
        const currentUserId = localStorage.getItem('currentUserId');
        if (!currentUserId) return;

        const response = await fetchWithAuth(`/api/incidents?userId=${currentUserId}`);
        if (response.ok) {
          const data = await response.json();
          const mappedIncidents: Incident[] = (data.incidents || []).map((inc: any) => ({
            id: inc._id,
            type: inc.type?.toLowerCase() || 'other',
            severity: inc.severity?.toLowerCase() || 'medium',
            description: inc.description,
            location: inc.location || inc.pollingCenterId,
            timestamp: inc.reportedAt,
            status: inc.status === 'Reported' ? 'submitted' : 'pending',
            attachments: [],
            gpsLocation: inc.coordinates || inc.gpsLocation || { lat: 23.8103, lng: 90.4125 },
          }));
          setSubmittedIncidents(mappedIncidents);
        }
      } catch (error) {
        console.error('Error loading incidents:', error);
      }
    };

    loadIncidentsFromDatabase();
    // Auto-refresh disabled for performance
    // const interval = setInterval(loadIncidentsFromDatabase, 30000);
    // return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: AttachedFile[] = [];
    
    Array.from(files).forEach((file) => {
      // Check file type (images and PDFs only)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        modal.showAlert(
          `File "${file.name}" is not supported. Only images and PDFs are allowed.`,
          'error',
          'Invalid File Type'
        );
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        modal.showAlert(
          `File "${file.name}" is too large. Maximum size is 10MB.`,
          'error',
          'File Too Large'
        );
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

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentTitle.trim()) {
      modal.showAlert(
        'Please provide an incident title.',
        'warning',
        'Missing Information'
      );
      return;
    }
    if (!incidentDescription.trim()) {
      modal.showAlert(
        'Please provide a description of the incident.',
        'warning',
        'Missing Information'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUserId = localStorage.getItem('currentUserId');
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Map severity to match schema enum (capitalize first letter)
      const severityMap: Record<string, string> = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical'
      };
      
      // Convert attached files to base64 for storage
      const filePromises = attachedFiles.map(file => {
        return fetch(file.url)
          .then(res => res.blob())
          .then(blob => {
            return new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          });
      });
      
      const base64Files = await Promise.all(filePromises);
      
      const incidentData = {
        title: incidentTitle || `${incidentType} Incident`,
        type: incidentType,
        severity: severityMap[incidentSeverity] || 'Medium',
        description: incidentDescription,
        location: incidentLocation || pollingCenterId,
        pollingCenterId: pollingCenterId,
        pollingCenterName: pollingCenterName || userInfo.pollingCenterName || 'Unknown Center',
        reportedBy: {
          userId: currentUserId || userInfo.userId || 'unknown',
          name: userName,
          role: 'officer'
        },
        gpsLocation: gpsLocation || { lat: 23.8103, lng: 90.4125 },
        attachments: base64Files,
        status: 'Reported'
      };

      // Submit to backend API
      const response = await fetchWithAuth('/api/incidents', {
        method: 'POST',
        body: JSON.stringify(incidentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit incident report');
      }

      const result = await response.json();

      const newIncident: Incident = {
        id: result.incident._id || `INC-${Date.now()}`,
        type: incidentType,
        severity: incidentSeverity,
        description: incidentDescription,
        location: incidentLocation || pollingCenterId,
        timestamp: new Date().toISOString(),
        status: 'submitted',
        attachments: [...attachedFiles],
        gpsLocation: gpsLocation || { lat: 23.8103, lng: 90.4125 },
      };

      const updatedIncidents = [newIncident, ...submittedIncidents];
      setSubmittedIncidents(updatedIncidents);
      
      // Save to localStorage for quick local display
      const existingIncidents = JSON.parse(localStorage.getItem('reportedIncidents') || '[]');
      const incidentToSave = {
        ...newIncident,
        gpsLocation: gpsLocation || { lat: 23.8103, lng: 90.4125 },
        reportedBy: userInfo.name || 'Presiding Officer',
        reportedByRole: 'Presiding Officer',
        pollingCenterId: pollingCenterId,
        pollingCenterName: pollingCenterName || userInfo.pollingCenterName || 'Unknown Center',
      };
      localStorage.setItem('reportedIncidents', JSON.stringify([incidentToSave, ...existingIncidents]));

      // Log incident report
      addAuditLog(
        AuditActions.INCIDENT_REPORTED,
        `Reported ${incidentType} incident (${incidentSeverity} severity) at ${incidentLocation || pollingCenterId}: ${incidentDescription.substring(0, 100)}`,
        userInfo.name || 'Presiding Officer'
      );
      
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
    } catch (error) {
      console.error('Error submitting incident:', error);
      modal.showAlert(
        error instanceof Error ? error.message : 'Failed to submit incident report. Please try again.',
        'error',
        'Submission Failed'
      );
      setIsSubmitting(false);
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    modal.showConfirm(
      'Are you sure? Vote counts can only be submitted ONCE and cannot be modified.',
      async () => {
        setIsSubmitting(true);
        
        try {
          const currentUserId = localStorage.getItem('currentUserId');
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          
          // Check if this is a correction resubmission
          const resubmitWindowKey = `voteResubmissionWindow_${pollingCenterId || ''}`;
          const isInCorrectionWindow = localStorage.getItem(resubmitWindowKey) === 'true';
        
        const voteData = {
          pollingCenter: pollingCenterId,
          pollingCenterName: pollingCenterName || 'Unknown Center',
          location: pollingCenterName || 'Unknown Center',
          totalVotes,
          totalVoters,
          submittedBy: {
            userId: currentUserId || userData.userId || 'unknown',
            name: userName,
            email: userData.email
          },
          partyVotes: voteCounts,
          isCorrection: isInCorrectionWindow,
        };

        // Submit to backend API
        const response = await fetchWithAuth('/api/votes', {
          method: 'POST',
          body: JSON.stringify(voteData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit votes');
        }

        const result = await response.json();

        // Persist submission list locally for UI display
        try {
          const raw = localStorage.getItem('votesSubmissions');
          const existing: any[] = raw ? JSON.parse(raw) : [];
          const filtered = existing.filter((entry) => entry.pollingCenter !== pollingCenterId);
          filtered.push(voteData);
          localStorage.setItem('votesSubmissions', JSON.stringify(filtered));
        } catch (err) {
          console.error('Error saving vote submissions locally', err);
        }

        // Keep legacy single-submission key for backward compatibility
        localStorage.setItem('votesSubmitted', JSON.stringify(voteData));

        // Close any resubmission window after the corrected submission
        localStorage.removeItem(resubmitWindowKey);
        setIsInResubmissionWindow(false);
        hasProcessedResetRef.current = false;
        
        // Mark correction as used if this was a correction
        if (isInCorrectionWindow) {
          const correctionUsedKey = `correctionUsed_${pollingCenterId || ''}`;
          localStorage.setItem(correctionUsedKey, 'true');
          setCorrectionUsed(true);
        }

        // Log vote submission
        addAuditLog(
          AuditActions.VOTE_SUBMITTED,
          `Submitted votes for ${pollingCenterName || 'Unknown Center'} (${pollingCenterId}) - Total: ${totalVotes} votes`,
          userName
        );

        setSubmittedVoteData(voteData);
        setShowVoteSubmittedView(true);
        
        // Reset form data
        setVoteCounts({
          PA: 0,
          PB: 0,
          PC: 0,
          PD: 0,
          PE: 0,
          PF: 0,
          IND: 0,
        });
        setTotalVoters(0);
      } catch (error) {
        console.error('Error submitting votes:', error);
        modal.showAlert(
          error instanceof Error ? error.message : 'Failed to submit votes. Please try again.',
          'error',
          'Submission Failed'
        );
        setIsSubmitting(false);
      }
      },
      {
        variant: 'warning',
        title: 'Confirm Vote Submission',
        confirmText: 'Submit Votes',
        cancelText: 'Cancel'
      }
    );
  };

  const handleLogout = () => {
    try { localStorage.removeItem('user'); } catch (e) {}
    router.push('/');
  };

  // Show Vote Submitted View
  if (showVoteSubmittedView && submittedVoteData) {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Green Header with Sliding Sidebar */}
        <header className="bg-blue-600 text-white px-6 py-4 sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <OfficerSlidingSidebar 
                onReportIncident={() => setShowIncidentModal(true)}
                onSubmitVotes={() => {}}
                voteSubmissionEnabled={voteSubmissionEnabled}
                votesAlreadySubmitted={true}
                submittedIncidentsCount={submittedIncidents.length}
              />
              <div className="flex items-center gap-3 text-white">
                <Image src="/images/logo-AmarVote.svg" alt="AmarVote" width={34} height={34} className="rounded-lg bg-white/10 p-1" />
                <h1 className="text-xl font-semibold">Vote Submission Confirmed - AmarVote</h1>
              </div>
            </div>
            <UserProfileControls role="officer" onLogout={handleLogout} showEditProfile={true} />
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Main Content - Success Card */}
          <div className="flex items-start justify-center pt-12">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-400 p-10 max-w-lg w-full text-center">
              {/* Success Icon */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-blue-500" strokeWidth={2} />
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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <div className="space-y-1">
                    <p><span className="font-semibold text-gray-700">Polling Center:</span> <span className="text-gray-600">{submittedVoteData.pollingCenter}</span></p>
                    <p><span className="font-semibold text-gray-700">Total Votes:</span> <span className="text-gray-600">{submittedVoteData.totalVotes}</span></p>
                    <p><span className="font-semibold text-gray-700">Submitted By:</span> <span className="text-gray-600">{submittedVoteData.submittedBy.name}</span></p>
                  </div>
                </div>

                {/* Request Correction Button OR Cancel/Edit Options */}
                {isInResubmissionWindow ? (
                  <div className="mt-6 space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm font-medium">✓ Correction Approved by Admin</p>
                      <p className="text-green-600 text-xs mt-1">You can now edit and resubmit your votes</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // Cancel the submission and allow re-editing
                        setShowVoteSubmittedView(false);
                        setSubmittedVoteData(null);
                        // Load previous vote counts if available
                        const previousVotes = submittedVoteData as any;
                        if (previousVotes?.partyVotes) {
                          setVoteCounts(previousVotes.partyVotes);
                        }
                        if (previousVotes?.totalVoters) {
                          setTotalVoters(previousVotes.totalVoters);
                        }
                        // Clear the resubmission window flag
                        const resubmitWindowKey = `voteResubmissionWindow_${pollingCenterId || ''}`; 
                        localStorage.removeItem(resubmitWindowKey);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      Edit & Resubmit Vote Counts
                    </button>
                  </div>
                ) : correctionRequested ? (
                  <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm font-medium">⏳ Correction Request Pending</p>
                    <p className="text-yellow-600 text-xs mt-1">Waiting for admin approval...</p>
                  </div>
                ) : correctionUsed ? (
                  <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-700 text-sm font-medium">Correction already used for this polling center.</p>
                    <p className="text-gray-500 text-xs mt-1">Further changes are not allowed.</p>
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

        {/* Keep Incident Report Modal available */}
        {showIncidentModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Dark overlay */}
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowIncidentModal(false)} />
            
            {/* Modal Content */}
            <div className="relative min-h-screen flex items-start justify-center pt-10 pb-10 px-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="bg-blue-600 text-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-6 h-6" />
                      <div>
                        <h1 className="text-lg font-semibold">Report Incident</h1>
                        <p className="text-sm text-blue-100">Submit emergency report</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowIncidentModal(false)}
                      className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

            {/* Form Content */}
            <form onSubmit={handleIncidentSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Photo Evidence Card */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold text-gray-900">Photo Evidence</span>
                  <span className="text-gray-400 text-sm">(Optional)</span>
                </div>
                
                {/* Upload Area */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl py-8 text-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
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
                          <div className="aspect-square rounded-lg bg-blue-100 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-blue-600" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                    Incident Title <span className="text-blue-500">*</span>
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
                    Incident Type <span className="text-blue-500">*</span>
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
                    Severity Level <span className="text-blue-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['low', 'medium', 'high', 'critical'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setIncidentSeverity(level as SeverityLevel)}
                        className={`py-2.5 px-3 border-2 rounded-lg text-sm font-medium transition-all ${
                          incidentSeverity === level
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
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
                    Description <span className="text-blue-500">*</span>
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
                    Polling Center ID <span className="text-blue-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pollingCenterId || incidentLocation}
                    readOnly
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Location</span>
                  </div>
                  <button
                    type="button"
                    onClick={getGPSLocation}
                    disabled={isGettingLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <MapPin className="w-4 h-4" />
                    {isGettingLocation ? 'Getting...' : 'Get GPS Location'}
                  </button>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-800">{gpsLocation ? 'GPS Location Captured ✓' : 'Auto-detected location'}</p>
                  <p className={`${gpsLocation ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                    Coordinates: {gpsLocation ? `${gpsLocation.lat.toFixed(6)}, ${gpsLocation.lng.toFixed(6)}` : '23.8103, 90.4125 (default)'}
                  </p>
                  {gpsLocation && (
                    <p className="text-xs text-blue-600 mt-1">
                      ✓ Your exact GPS location will be shared with law enforcement
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
              </div>
            </div>
          </div>
        )}

        {/* Incident Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full mx-4 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-blue-500" strokeWidth={2} />
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

        {/* Custom Modal */}
        <CustomModal
          isOpen={modal.isOpen}
          onClose={modal.handleClose}
          title={modal.config.title}
          message={modal.config.message}
          type={modal.type}
          onConfirm={modal.handleConfirm}
          variant={modal.config.variant}
          confirmText={modal.config.confirmText}
          cancelText={modal.config.cancelText}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Sliding Sidebar */}
      <header className="bg-blue-600 text-white px-6 py-4 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <OfficerSlidingSidebar 
              onReportIncident={() => setShowIncidentModal(true)}
              onSubmitVotes={() => {
                // Scroll to form section
                document.getElementById('vote-entry-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              voteSubmissionEnabled={voteSubmissionEnabled}
              votesAlreadySubmitted={showVoteSubmittedView}
              submittedIncidentsCount={submittedIncidents.length}
            />
            <div className="flex items-center gap-3 text-white">
              <Image src="/images/logo-AmarVote.svg" alt="AmarVote" width={34} height={34} className="rounded-lg bg-white/10 p-1" />
              <h1 className="text-xl font-semibold">Presiding Officer Dashboard - AmarVote</h1>
            </div>
          </div>
          <UserProfileControls role="officer" onLogout={handleLogout} showEditProfile={true} />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="space-y-6">
              {/* Status Alert - Dynamic based on vote submission status */}
              {voteSubmissionEnabled ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Voting Period Has Ended</p>
                    <p className="text-sm text-blue-700">You can now submit vote counts from your polling center</p>
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
              <div id="vote-entry-form" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-blue-800 mb-6">Party-wise Vote Entry</h2>
                
                {/* Resubmission Window Banner */}
                {isInResubmissionWindow && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-700">✓ Correction Approved - Resubmission Window Active</p>
                      <p className="text-xs text-green-600">You can now resubmit your vote counts</p>
                    </div>
                  </div>
                )}
                
                {/* Locked Warning Banner */}
                {!voteSubmissionEnabled && !isInResubmissionWindow && (
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
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!voteSubmissionEnabled && !isInResubmissionWindow ? 'bg-gray-100 text-gray-500' : ''}`}
                      readOnly
                      disabled={!voteSubmissionEnabled && !isInResubmissionWindow}
                    />
                  </div>

                  {/* Total Voters at Center */}
                  <div>
                    <label htmlFor="total-voters" className="block text-sm font-medium text-gray-700 mb-2">
                      Total Voters in This Center
                    </label>
                    <input
                      id="total-voters"
                      type="number"
                      min="0"
                      value={totalVoters}
                      onChange={(e) => setTotalVoters(Math.max(0, parseInt(e.target.value) || 0))}
                      className={`w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${!voteSubmissionEnabled && !isInResubmissionWindow ? 'bg-gray-100 text-gray-500' : ''}`}
                      placeholder="Enter total registered voters"
                      disabled={!voteSubmissionEnabled && !isInResubmissionWindow}
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
                            className={`w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center ${!voteSubmissionEnabled && !isInResubmissionWindow ? 'bg-gray-100 text-gray-400' : 'bg-gray-50'}`}
                            placeholder="0"
                            disabled={!voteSubmissionEnabled && !isInResubmissionWindow}
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
              {(voteSubmissionEnabled || isInResubmissionWindow) ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save className="w-5 h-5" />
                  {isInResubmissionWindow ? 'Resubmit Corrected Vote Counts' : 'Submit Vote Counts (One-Time Only)'}
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

              {/* Submitted Incidents Section */}
              {submittedIncidents.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Submitted Incident Reports</h2>
                  <div className="space-y-3">
                    {submittedIncidents.map((incident) => (
                      <div 
                        key={incident.id}
                        onClick={() => {
                          setSelectedIncident(incident);
                          setShowReviewModal(true);
                        }}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              incident.severity === 'critical' ? 'bg-red-100 text-red-700' :
                              incident.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                              incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {incident.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">{incident.id}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            incident.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {incident.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)} Incident
                        </p>
                        <p className="text-xs text-gray-600 mb-2">{incident.description.substring(0, 100)}...</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{incident.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(incident.timestamp).toLocaleString()}</span>
                          </div>
                          {incident.attachments && incident.attachments.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              <span>{incident.attachments.length} file(s)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

      {/* Incident Report Modal - Overlay Style */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Dark overlay */}
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowIncidentModal(false)} />
          
          {/* Modal Content */}
          <div className="relative min-h-screen flex items-start justify-center pt-10 pb-10 px-4">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="bg-blue-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6" />
                    <div>
                      <h1 className="text-lg font-semibold">Report Incident</h1>
                      <p className="text-sm text-blue-100">Submit emergency report</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowIncidentModal(false)}
                    className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

          {/* Form Content */}
          <form onSubmit={handleIncidentSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            
            {/* Photo Evidence Card */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Photo Evidence</span>
                <span className="text-gray-400 text-sm">(Optional)</span>
              </div>
              
              {/* Upload Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl py-8 text-center hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
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
                        <div className="aspect-square rounded-lg bg-blue-100 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                    Incident Title <span className="text-blue-500">*</span>
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
                    Incident Type <span className="text-blue-500">*</span>
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
                    Severity Level <span className="text-blue-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['low', 'medium', 'high', 'critical'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setIncidentSeverity(level as SeverityLevel)}
                      className={`py-2.5 px-3 border-2 rounded-lg text-sm font-medium transition-all ${
                        incidentSeverity === level
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
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
                    Description <span className="text-blue-500">*</span>
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
                    Polling Center ID <span className="text-blue-500">*</span>
                </label>
                <input
                  type="text"
                  value={pollingCenterId || incidentLocation}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Location</span>
                </div>
                <button
                  type="button"
                  onClick={getGPSLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4" />
                  {isGettingLocation ? 'Getting...' : 'Get GPS Location'}
                </button>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-800">{gpsLocation ? 'GPS Location Captured ✓' : 'Auto-detected location'}</p>
                <p className={`${gpsLocation ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  Coordinates: {gpsLocation ? `${gpsLocation.lat.toFixed(6)}, ${gpsLocation.lng.toFixed(6)}` : '23.8103, 90.4125 (default)'}
                </p>
                {gpsLocation && (
                  <p className="text-xs text-blue-600 mt-1">
                    ✓ Your exact GPS location will be shared with law enforcement
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowIncidentModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>
      )}

      {/* Incident Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full mx-4 text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-blue-500" strokeWidth={2} />
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Report Submitted Successfully</p>
                  <p className="text-xs text-blue-700">Authorities have been notified and are reviewing this incident.</p>
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
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
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

      {/* Custom Modal */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={modal.handleClose}
        title={modal.config.title}
        message={modal.config.message}
        type={modal.type}
        onConfirm={modal.handleConfirm}
        variant={modal.config.variant}
        confirmText={modal.config.confirmText}
        cancelText={modal.config.cancelText}
      />
    </div>
  );
}
