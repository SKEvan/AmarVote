'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft, Shield, MapPin, Clock, FileText } from 'lucide-react';
import UserProfileControls from '@/components/shared/UserProfileControls';

function IncidentAcknowledgedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [incidentData, setIncidentData] = useState<any>(null);

  useEffect(() => {
    // Get incident data from URL params
    const title = searchParams.get('title');
    const severity = searchParams.get('severity');
    const location = searchParams.get('location');
    const reportedAt = searchParams.get('reportedAt');
    const notes = searchParams.get('notes');
    const officerName = searchParams.get('officerName');
    const officerRole = searchParams.get('officerRole');

    if (title && severity) {
      setIncidentData({
        title,
        severity,
        location,
        reportedAt,
        notes,
        officerName,
        officerRole,
      });
    }
  }, [searchParams]);

  if (!incidentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      {/* Header */}
      <header className="bg-green-700 text-white px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/police')}
              className="p-2 hover:bg-green-600 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Incident Acknowledged</h1>
              <p className="text-xs text-green-100">Successfully recorded your response</p>
            </div>
          </div>
          <UserProfileControls role="police" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8 border-4 border-green-400">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 shadow-xl">
              <CheckCircle className="w-16 h-16 text-green-600" strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Acknowledgement Successful!</h2>
            <p className="text-green-100 text-lg">Your response has been recorded and logged in the system</p>
          </div>

          {/* Incident Details */}
          <div className="p-8 space-y-6">
            {/* Officer Badge */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-600 p-3 rounded-full">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Acknowledged By</p>
                  <p className="text-2xl font-bold text-gray-900">{incidentData.officerName}</p>
                  <p className="text-sm text-green-700 font-semibold">{incidentData.officerRole}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="text-xs text-gray-500 mb-1">Acknowledgement Time</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  {new Date().toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Incident Information */}
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-700" />
                Incident Details
              </h3>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-1">Title</p>
                  <p className="text-lg font-semibold text-gray-900">{incidentData.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium mb-2">Severity Level</p>
                    <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${
                      incidentData.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      incidentData.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      incidentData.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {incidentData.severity}
                    </span>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium mb-1">Location</p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      {incidentData.location}
                    </p>
                  </div>
                </div>

                {incidentData.reportedAt && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium mb-1">Originally Reported</p>
                    <p className="text-sm text-gray-700">{new Date(incidentData.reportedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Officer's Notes */}
            {incidentData.notes && (
              <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-green-900 mb-4">Your Assessment & Action Notes</h3>
                <div className="bg-white rounded-lg p-5 border border-green-200">
                  <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                    {incidentData.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Status Badge */}
            <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 text-center">
              <p className="text-sm text-green-700 font-medium mb-2">New Status</p>
              <div className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg">
                RESOLVED
              </div>
              <p className="text-xs text-green-600 mt-3">This incident has been successfully resolved</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/dashboard/police')}
            className="bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 px-6 rounded-xl border-2 border-gray-300 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/dashboard/police/incidents')}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            View All Incidents
          </button>
        </div>

        {/* Info Notice */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900 mb-1">What happens next?</h4>
              <p className="text-sm text-blue-800">
                This incident has been marked as "Resolved" and your notes have been recorded. 
                The admin dashboard has been updated with your response. You can view this incident 
                at any time from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function IncidentAcknowledgedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <IncidentAcknowledgedContent />
    </Suspense>
  );
}
