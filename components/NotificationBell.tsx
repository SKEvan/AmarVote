"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, X, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { notifications as sharedNotifications } from '@/data/mockData';

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(sharedNotifications || []);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // future: subscribe to live notifications
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  function handleClickNotification(incidentId: string, id: string) {
    // mark as read
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    setOpen(false);
    router.push(`/dashboard/admin/incidents/${incidentId}`);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <button onClick={() => setOpen(false)} className="hover:bg-white hover:bg-opacity-20 p-1 rounded">
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
                  className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${notif.priority === 'HIGH' ? 'bg-red-600' : 'bg-yellow-600'} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                        {!notif.read && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{notif.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{notif.time}</p>
                        <button onClick={() => handleClickNotification(notif.incidentId, notif.id)} className="text-xs text-green-600 font-medium">View on Map →</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-right">
            <Link href="/dashboard/admin/incidents" onClick={() => setOpen(false)} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All on Map →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
