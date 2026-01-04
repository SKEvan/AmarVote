'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, UserCog } from 'lucide-react';

type Props = {
  role?: 'admin' | 'police' | 'officer' | string;
  onLogout?: () => void;
  showEditProfile?: boolean;
};

export default function UserProfileControls({ role = 'admin', onLogout, showEditProfile = true }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; avatar?: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const loadUser = () => {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          setUser(JSON.parse(raw));
          return;
        }
      } catch (e) {
        // ignore
      }

      // default fallback based on role
      if (role === 'police') {
        setUser({ name: 'Officer Rahman', role: 'Law Enforcement', avatar: '' });
      } else if (role === 'admin') {
        setUser({ name: 'System Administrator', role: 'BEC Admin', avatar: '' });
      } else {
        setUser({ name: 'User', role: role || 'Member', avatar: '' });
      }
    };
    
    loadUser();
    
    // Listen for storage changes to update profile pic
    const handleStorageChange = () => {
      loadUser();
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also check on focus in case localStorage was updated in same window
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [role]);

  const handleLogout = () => {
    try { localStorage.removeItem('user'); } catch (e) {}
    if (onLogout) onLogout();
    router.push('/');
  };

  const handleEditProfile = () => {
    if (!showEditProfile) return;
    setShowDropdown(false);

    const profilePath = role === 'police'
      ? '/dashboard/police/profile'
      : role === 'admin'
      ? '/dashboard/admin/profile'
      : role === 'officer'
      ? '/dashboard/officer/profile'
      : '/dashboard/profile';

    // Use router.push for SPA navigation with a hard fallback to ensure it works everywhere
    try {
      router.push(profilePath);
    } catch (e) {
      window.location.href = profilePath;
    }
  };

  const avatarUrl = user?.avatar && user.avatar.trim() !== '' ? user.avatar : (user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ffffff&color=111827` : '');

  // Get color scheme based on role
  const getColorScheme = () => {
    if (role === 'police') return { bg: 'bg-red-600', text: 'text-red-600' };
    if (role === 'admin') return { bg: 'bg-green-600', text: 'text-green-600' };
    if (role === 'officer') return { bg: 'bg-indigo-600', text: 'text-indigo-600' };
    return { bg: 'bg-blue-600', text: 'text-blue-600' };
  };

  const colors = getColorScheme();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3 relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden hover:ring-4 hover:ring-white/30 transition-all cursor-pointer shadow-md"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {/* Name and Role - Always visible */}
        <div className="text-right">
          <p className="text-sm font-semibold text-white">{user?.name}</p>
          <p className="text-xs text-white/90">{user?.role}</p>
        </div>

        {/* Profile Dropdown Menu - Only Edit Profile */}
        {showDropdown && (
          <>
            {/* Backdrop for closing dropdown */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowDropdown(false)}
            ></div>
            
            <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl overflow-hidden z-40 border border-gray-200">
              {/* Edit Profile Option */}
              {showEditProfile && (
                <button
                  onClick={handleEditProfile}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-full ${colors.bg} bg-opacity-10 flex items-center justify-center`}>
                    <UserCog className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Edit Profile</p>
                    <p className="text-xs text-gray-500">Update your info</p>
                  </div>
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Separate Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
      >
        <LogOut className="w-4 h-4 text-white" />
        <span className="text-sm font-medium text-white">Logout</span>
      </button>
    </div>
  );
}
