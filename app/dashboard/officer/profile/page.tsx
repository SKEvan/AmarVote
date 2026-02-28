'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Upload, Camera, Save, X } from 'lucide-react';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function OfficerProfileEditPage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    badge: '',
    station: '',
    district: '',
    rank: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  // Load existing user data from localStorage and database
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const currentUserId = localStorage.getItem('currentUserId');
        console.log('Loading profile for user ID:', currentUserId);
        
        if (!currentUserId) {
          console.error('No user ID found in localStorage');
          router.push('/login?role=officer');
          return;
        }
        
        setUserId(currentUserId);
        
        // Load from database API
        const response = await fetchWithAuth('/api/users');
        
        if (response.ok) {
          const data = await response.json();
          console.log('All users from API:', data.users?.length || 0);
          const userFromDb = (data.users || []).find((u: any) => u._id === currentUserId);
          
          if (userFromDb) {
            console.log('User found in database:', userFromDb);
            setProfileData({
              fullName: userFromDb.name || '',
              email: userFromDb.email || '',
              phone: userFromDb.phone || '',
              badge: userFromDb.serviceId || userFromDb.username || '',
              station: userFromDb.pollingCenterName || userFromDb.location || '',
              district: userFromDb.thana || userFromDb.location || '',
              rank: userFromDb.rank || 'Presiding Officer',
            });
            
            if (userFromDb.avatar) {
              setPreviewUrl(userFromDb.avatar);
            }
          } else {
            console.error('User not found in database with ID:', currentUserId);
          }
        } else {
          console.error('Failed to fetch users:', response.status);
        }
      } catch (e) {
        console.error('Error loading user data:', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserProfile();
  }, [router]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let avatarDataUrl = previewUrl;
      
      // Convert image file to base64 data URL if new image was selected
      if (profileImage) {
        const reader = new FileReader();
        avatarDataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(profileImage);
        });
      }
      
      // Update via database API
      if (userId) {
        const response = await fetchWithAuth('/api/users', {
          method: 'PATCH',
          body: JSON.stringify({
            userId: userId,
            phone: profileData.phone,
            avatar: avatarDataUrl || ''
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update profile');
        }
      }
      
      // Update localStorage display data
      const stored = localStorage.getItem('user');
      if (stored) {
        const userData = JSON.parse(stored);
        userData.avatar = avatarDataUrl || '';
        userData.phone = profileData.phone;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      alert('Profile updated successfully!');
      router.push('/dashboard/officer');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(error instanceof Error ? error.message : 'Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white px-6 py-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/officer"
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <p className="text-blue-100 text-sm">Update your photo and phone number</p>
          </div>
        </div>
      </header>

      {/* Loading State */}
      {isLoading ? (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile data...</p>
          </div>
        </div>
      ) : (
      /* Main Content */
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <form onSubmit={handleSave}>
            {/* Profile Picture Section */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-10 text-white">
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
                      className="absolute -top-2 -right-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors shadow-lg"
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
                  <p className="text-indigo-100 text-sm mb-4">
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
                      className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
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
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-400 mt-1">Contact admin to change</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-400 mt-1">Contact admin to change</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Phone Number <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Badge Number
                  </label>
                  <input
                    type="text"
                    name="badge"
                    value={profileData.badge}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-400 mt-1">Contact admin to change</p>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-gray-200 mt-8">
                Service Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Polling Station
                  </label>
                  <input
                    type="text"
                    name="station"
                    value={profileData.station}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-400 mt-1">Contact admin to change</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={profileData.district}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-400 mt-1">Contact admin to change</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Rank
                  </label>
                  <input
                    type="text"
                    name="rank"
                    value={profileData.rank}
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                    disabled
                    readOnly
                  />
                  <p className="text-xs text-gray-400 mt-1">Contact admin to change</p>
                </div>
              </div>

              {/* Info Notice */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Only your profile photo and phone number can be updated. For other changes, please contact the Election Commission administrator.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t-2 border-gray-200">
                <Link
                  href="/dashboard/officer"
                  className="flex-1 text-center border-2 border-gray-300 text-gray-700 font-semibold py-3.5 px-6 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  );
}
