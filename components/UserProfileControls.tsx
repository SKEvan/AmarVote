'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon } from 'lucide-react';

type Props = {
  role?: 'admin' | 'police' | 'officer' | string;
  onLogout?: () => void;
};

export default function UserProfileControls({ role = 'admin', onLogout }: Props) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; avatar?: string } | null>(null);

  useEffect(() => {
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
  }, [role]);

  const handleLogout = () => {
    try { localStorage.removeItem('user'); } catch (e) {}
    if (onLogout) onLogout();
    router.push('/');
  };

  const avatarUrl = user?.avatar || (user ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ffffff&color=111827` : '');

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-6 h-6 text-white" />
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-white">{user?.name}</p>
          <p className="text-xs text-white/80">{user?.role}</p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all duration-200"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-white">Logout</span>
      </button>
    </div>
  );
}
