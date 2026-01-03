'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';

export default function AdminProfileViewPage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    fullName: 'System Administrator',
    email: 'admin@bec.gov.bd',
    phone: '+880 1712-345678',
    badge: 'BEC-ADMIN-001',
    department: 'Bangladesh Election Commission',
    district: 'Dhaka',
    rank: 'System Administrator',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load existing user data from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.name) {
          setProfileData(prev => ({
            ...prev,
            fullName: user.name,
          }));
        }
        if (user.avatar) {
          setPreviewUrl(user.avatar);
        }
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white px-6 py-4 shadow-md">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/admin"
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-green-100 text-sm">View your profile information</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Profile Picture Section */}
          <div className="bg-gradient-to-br from-green-600 to-green-700 px-8 py-10 text-white">
            <h2 className="text-xl font-semibold mb-6">Profile Picture</h2>
            <div className="flex items-center gap-8">
              {/* Current Image */}
              <div className="w-32 h-32 rounded-full overflow-hidden bg-white bg-opacity-20 flex items-center justify-center border-4 border-white shadow-lg">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-white" strokeWidth={1.5} />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold mb-2">{profileData.fullName}</h3>
                <p className="text-green-100 text-sm">Administrator</p>
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-500 text-sm font-medium mb-2">
                  Full Name
                </label>
                <p className="text-gray-800 font-medium text-lg">{profileData.fullName}</p>
              </div>
              <div>
                <label className="block text-gray-500 text-sm font-medium mb-2">
                  Email Address
                </label>
                <p className="text-gray-800 font-medium text-lg">{profileData.email}</p>
              </div>
              <div>
                <label className="block text-gray-500 text-sm font-medium mb-2">
                  Phone Number
                </label>
                <p className="text-gray-800 font-medium text-lg">{profileData.phone}</p>
              </div>
              <div>
                <label className="block text-gray-500 text-sm font-medium mb-2">
                  Admin ID
                </label>
                <p className="text-gray-800 font-medium text-lg">{profileData.badge}</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200 mt-8">
              Service Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-500 text-sm font-medium mb-2">
                  Department
                </label>
                <p className="text-gray-800 font-medium text-lg">{profileData.department}</p>
              </div>
              <div>
                <label className="block text-gray-500 text-sm font-medium mb-2">
                  District
                </label>
                <p className="text-gray-800 font-medium text-lg">{profileData.district}</p>
              </div>
              <div>
                <label className="block text-gray-500 text-sm font-medium mb-2">
                  Role
                </label>
                <p className="text-gray-800 font-medium text-lg">{profileData.rank}</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex gap-4 mt-8 pt-6 border-t-2 border-gray-200">
              <Link
                href="/dashboard/admin"
                className="flex-1 text-center bg-green-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-green-700 transition-colors shadow-md"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
