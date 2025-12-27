'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Upload, Camera, Save, X } from 'lucide-react';

export default function ProfileEditPage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    fullName: 'Officer Rahman',
    email: 'rahman@police.gov.bd',
    phone: '+880 1712-345678',
    badge: 'BD-DMP-15432',
    station: 'Dhaka Metro',
    district: 'Dhaka',
    rank: 'Inspector',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size <= 5 * 1024 * 1024) { // 5MB limit
        if (file.type.startsWith('image/')) {
          setProfileImage(file);
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        } else {
          alert('Please upload an image file (JPG, PNG, etc.)');
        }
      } else {
        alert('Image size must be less than 5MB');
      }
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Save profile data
    alert('Profile updated successfully!');
    router.push('/dashboard/police');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white px-6 py-4 shadow-md">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/police"
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <p className="text-red-100 text-sm">Update your personal information and profile picture</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <form onSubmit={handleSave}>
            {/* Profile Picture Section */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 px-8 py-10 text-white">
              <h2 className="text-xl font-semibold mb-6">Profile Picture</h2>
              <div className="flex items-center gap-8">
                {/* Current/Preview Image */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-white bg-opacity-20 flex items-center justify-center border-4 border-white shadow-lg">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" strokeWidth={1.5} />
                    )}
                  </div>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">
                    {profileImage ? 'Image Selected' : 'Upload New Picture'}
                  </h3>
                  <p className="text-red-100 text-sm mb-4">
                    {profileImage 
                      ? `${profileImage.name} (${(profileImage.size / 1024).toFixed(1)} KB)` 
                      : 'JPG, PNG, or GIF (Max 5MB)'
                    }
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="file"
                      id="profileImageUpload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profileImageUpload"
                      className="inline-flex items-center gap-2 bg-white text-red-600 font-semibold px-5 py-2.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Camera className="w-5 h-5" />
                      {profileImage ? 'Change Picture' : 'Choose Picture'}
                    </label>
                  </div>
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
                  <label className="block text-gray-700 font-medium mb-2">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Badge Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="badge"
                    value={profileData.badge}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200 mt-8">
                Service Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Posted Station <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="station"
                    value={profileData.station}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    District <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={profileData.district}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Rank <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="rank"
                    value={profileData.rank}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t-2 border-gray-200">
                <Link
                  href="/dashboard/police"
                  className="flex-1 text-center border-2 border-gray-300 text-gray-700 font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-red-700 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
