'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, LogOut, User, Navigation, CheckCircle, AlertTriangle, Clock, MapPinIcon, UserCog, Bell, X } from 'lucide-react';
import UserProfileControls from '@/components/UserProfileControls';

// Mock notifications data
const mockNotifications = [
  {
    id: 'NOT-001',
    incidentId: 'INC-001',
    title: 'New High Priority Incident',
    message: 'Voter intimidation reported at Dhaka-10, Mirpur Polling Station',
    time: '2 minutes ago',
    priority: 'HIGH',
    read: false,
  },
  {
    id: 'NOT-002',
    incidentId: 'INC-004',
    title: 'New Medium Priority Incident',
    message: 'Crowd control issue at Dhaka-6, Tejgaon',
    time: '15 minutes ago',
    priority: 'MEDIUM',
    read: false,
  },
];

export default function PoliceDashboard() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newNotification, setNewNotification] = useState<typeof mockNotifications[0] | null>(null);

  // Simulate real-time notification
  useEffect(() => {
    const interval = setInterval(() => {
      const notification = {
        id: `NOT-${Date.now()}`,
        incidentId: `INC-${Math.floor(Math.random() * 100)}`,
        title: 'New Incident Alert',
        message: 'A new incident has been reported in your area',
        time: 'Just now',
        priority: Math.random() > 0.5 ? 'HIGH' : 'MEDIUM',
        read: false,
      };
      
      setNotifications(prev => [notification, ...prev]);
      setNewNotification(notification);
      
      // Auto-hide toast after 5 seconds
      setTimeout(() => setNewNotification(null), 5000);
    }, 45000); // 45 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (incidentId: string) => {
    setShowNotifications(false);
    router.push('/dashboard/police/map');
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
    router.push(`/dashboard/admin/incidents/${incidentId}`);
  };

  const handleViewMap = (incidentId: string) => {
    router.push('/dashboard/police/map');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* New Incident Toast Notification */}
      {newNotification && (
        <div className="fixed top-20 right-6 z-50 bg-red-600 text-white rounded-xl shadow-2xl p-4 max-w-sm animate-slide-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold mb-1">{newNotification.title}</p>
                <p className="text-sm text-red-100 mb-2">{newNotification.message}</p>
                <button
                  onClick={() => handleNotificationClick(newNotification.incidentId)}
                  className="text-sm font-semibold underline hover:text-white"
                >
                  View on Map →
                </button>
              </div>
            </div>
            <button
              onClick={() => setNewNotification(null)}
              className="hover:bg-white hover:bg-opacity-20 p-1 rounded flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <h1 className="text-xl font-semibold">Law Enforcement Alert System</h1>
        <div className="flex items-center gap-6">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="hover:bg-white hover:bg-opacity-20 p-1 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notif.incidentId)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 ${
                            notif.priority === 'HIGH' ? 'bg-red-600' : 'bg-yellow-600'
                          } rounded-full flex items-center justify-center flex-shrink-0`}>
                            <AlertTriangle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{notif.message}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-500">{notif.time}</p>
                              <span className="text-xs text-blue-600 font-medium">View on Map →</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                  <Link
                    href="/dashboard/police/map"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => setShowNotifications(false)}
                  >
                    View All on Map →
                  </Link>
                </div>
              </div>
            )}
          </div>

          <UserProfileControls role="police" />
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
                onClick={() => handleViewMap('INC-001')}
                className="bg-white bg-opacity-20 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                View Map
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
                    className="bg-gray-100 text-gray-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
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
                    className="bg-gray-100 text-gray-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
