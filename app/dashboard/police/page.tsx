'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, LogOut, User, Navigation, CheckCircle, AlertTriangle, Clock, MapPinIcon, UserCog } from 'lucide-react';

export default function PoliceDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/');
  };

  const handleAcknowledge = (incidentId: string) => {
    alert(`Incident ${incidentId} acknowledged`);
  };

  const handleNavigate = (location: string) => {
    alert(`Navigating to ${location}`);
  };

  const handleViewDetails = (incidentId: string) => {
    alert(`Viewing details for ${incidentId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-semibold">Law Enforcement Alert System</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="font-semibold">Officer Rahman - Dhaka Metro</p>
              <p className="text-sm text-red-100">Law Enforcement</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-72px)] p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">
            Enforcement Menu
          </h2>
          <div className="space-y-3">
            <Link 
              href="/dashboard/police/map"
              className="w-full bg-green-50 border-2 border-green-500 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-3"
            >
              <MapPin className="w-5 h-5" />
              <div className="text-left">
                <p className="font-semibold">View Map</p>
                <p className="text-sm text-green-600">Live incidents</p>
              </div>
            </Link>
            <Link 
              href="/dashboard/police/profile"
              className="w-full bg-blue-50 border-2 border-blue-500 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-3"
            >
              <UserCog className="w-5 h-5" />
              <div className="text-left">
                <p className="font-semibold">Edit Profile</p>
                <p className="text-sm text-blue-600">Update your info</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Priority Alert Banner */}
          <div className="bg-gradient-to-r from-red-400 via-red-300 to-orange-300 rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-30 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white text-red-600 font-bold text-sm px-3 py-1 rounded-full">
                    PRIORITY ALERT
                  </span>
                  <span className="bg-red-500 text-white font-bold text-sm px-3 py-1 rounded-full">
                    HIGH
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Voter intimidation reported</h3>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">Dhaka-10, Mirpur Polling Station</p>
                      <p className="text-sm text-white text-opacity-90">Distance: 1.6 km from your location</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <div className="text-right">
                      <p className="font-semibold">15:15:00</p>
                      <p className="text-sm text-white text-opacity-90">815 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleNavigate('Dhaka-10, Mirpur Polling Station')}
                className="bg-white text-red-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Navigate
              </button>
              <button
                onClick={() => handleAcknowledge('INC-001')}
                className="bg-white bg-opacity-20 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Acknowledge
              </button>
              <button
                onClick={() => handleViewDetails('INC-001')}
                className="bg-white bg-opacity-20 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>

          {/* All Active Alerts Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">All Active Alerts</h2>
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold">
                2 pending incidents
              </div>
            </div>

            {/* Alert Cards */}
            <div className="space-y-4">
              {/* HIGH Priority Alert */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-md">
                    HIGH
                  </span>
                  <span className="text-gray-600 font-semibold">INC-001</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Voter intimidation reported</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Dhaka-10, Mirpur Polling Station</p>
                      <p className="text-sm text-gray-500">1.6 km away</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">15:15:00</p>
                      <p className="text-sm text-gray-500">815 min ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Intimidation</p>
                      <p className="text-sm text-gray-500">Incident Type</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleNavigate('Dhaka-10, Mirpur Polling Station')}
                    className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Navigate
                  </button>
                  <button
                    onClick={() => handleAcknowledge('INC-001')}
                    className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Acknowledge
                  </button>
                  <button
                    onClick={() => handleViewDetails('INC-001')}
                    className="bg-gray-100 text-gray-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* MEDIUM Priority Alert */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="bg-yellow-600 text-white font-bold text-xs px-3 py-1 rounded-md">
                    MEDIUM
                  </span>
                  <span className="text-gray-600 font-semibold">INC-004</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Crowd control issue</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Dhaka-6, Tejgaon</p>
                      <p className="text-sm text-gray-500">12.3 km away</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">16:00:00</p>
                      <p className="text-sm text-gray-500">770 min ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Disturbance</p>
                      <p className="text-sm text-gray-500">Incident Type</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleNavigate('Dhaka-6, Tejgaon')}
                    className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Navigate
                  </button>
                  <button
                    onClick={() => handleAcknowledge('INC-004')}
                    className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Acknowledge
                  </button>
                  <button
                    onClick={() => handleViewDetails('INC-004')}
                    className="bg-gray-100 text-gray-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
