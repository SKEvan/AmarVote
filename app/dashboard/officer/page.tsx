'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, User, LogOut, CheckCircle, Save } from 'lucide-react';

export default function OfficerDashboard() {
  const router = useRouter();
  const [pollingCenterId, setPollingCenterId] = useState('PC-DHK-001');
  const [votingStatus] = useState('ended');
  const [voteCounts, setVoteCounts] = useState({
    PA: 0,
    PB: 0,
    PC: 0,
    PD: 0,
    PE: 0,
    PF: 0,
    IND: 0,
  });

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
      alert('Vote counts submitted successfully!');
    }
  };

  const handleLogout = () => {
    try { localStorage.removeItem('user'); } catch (e) {}
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-600 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Vote Entry Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">Presiding Officer - Ghana</p>
                <p className="text-xs text-white/80">Presiding Officer</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5 text-white" />
              <span className="text-white">Logout</span>
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
                <button className="w-full bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3 hover:bg-orange-100 transition-colors">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-orange-900">Report Incident</p>
                    <p className="text-xs text-orange-700">Report Incidents</p>
                  </div>
                </button>

                {/* Voting Status */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="text-sm font-medium text-gray-900">Voting Status</p>
                    </div>
                    <div className="ml-6">
                      <p className="text-xs font-semibold text-green-700">✓ Voting Ended</p>
                      <p className="text-xs text-gray-600 mt-1">Center: {pollingCenterId}</p>
                    </div>
                    <button className="w-full mt-3 bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                      Enter Vote Results
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="space-y-6">
              {/* Success Alert */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Voting Period Has Ended</p>
                  <p className="text-sm text-green-700">You can now submit vote counts from your polling center</p>
                </div>
              </div>

              {/* Vote Entry Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Party-wise Vote Entry</h2>
                
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      readOnly
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
                            className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total Votes */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <p className="text-base font-semibold text-gray-900">Total Votes:</p>
                    <p className="text-2xl font-bold text-indigo-600">{totalVotes}</p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Submit Vote Counts (One-Time Only)
                  </button>
                </form>
              </div>

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
    </div>
  );
}
