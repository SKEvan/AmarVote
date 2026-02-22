"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Map, TrendingUp, FileCheck, Home, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

type SlidingSidebarProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  topOffsetClass?: string; // e.g., 'top-16' to leave room for a sticky header
};

export default function SlidingSidebar({ open: controlledOpen, onOpenChange, hideTrigger = false, topOffsetClass }: SlidingSidebarProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    else setUncontrolledOpen(val);
  };
  const router = useRouter();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (open && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div>
      {!hideTrigger && (
        <div className="fixed top-4 left-4 z-50">
          <button onClick={() => setOpen(true)} className="p-2 bg-white rounded shadow-md">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Backdrop overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 transition-opacity duration-300"
          style={{ zIndex: 9998 }}
          onClick={() => setOpen(false)}
        />
      )}

      <div className={`fixed ${topOffsetClass ? `${topOffsetClass} bottom-0` : 'inset-y-0'} left-0 w-64 transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`} style={{ zIndex: 9999 }}>
        <div ref={sidebarRef} className="w-full bg-white h-full border-r border-gray-200 shadow-lg relative z-50">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Home className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold">Menu</h4>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            <button onClick={() => { setOpen(false); router.push('/dashboard/admin'); }} className="w-full text-left p-3 rounded hover:bg-green-50 flex items-center gap-3">
              <Home className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">Admin Dashboard</div>
                <div className="text-xs text-gray-500">Main overview</div>
              </div>
            </button>

            <button onClick={() => { setOpen(false); router.push('/dashboard/admin/incidents'); }} className="w-full text-left p-3 rounded hover:bg-green-50 flex items-center gap-3">
              <Map className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">Incident Map</div>
                <div className="text-xs text-gray-500">Live incidents</div>
              </div>
            </button>

            <button onClick={() => { setOpen(false); router.push('/dashboard/admin/voting-trends'); }} className="w-full text-left p-3 rounded hover:bg-green-50 flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">Voting Trends</div>
                <div className="text-xs text-gray-500">Analytics</div>
              </div>
            </button>

            <button onClick={() => { setOpen(false); router.push('/dashboard/admin/user-management'); }} className="w-full text-left p-3 rounded hover:bg-green-50 flex items-center gap-3">
              <Bell className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">User Management</div>
                <div className="text-xs text-gray-500">Manage users & roles</div>
              </div>
            </button>

            <button onClick={() => { setOpen(false); router.push('/dashboard/admin/system-logs'); }} className="w-full text-left p-3 rounded hover:bg-green-50 flex items-center gap-3">
              <FileCheck className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-sm font-medium">System Logs</div>
                <div className="text-xs text-gray-500">Audit trail</div>
              </div>
            </button>
          </nav>

          
        </div>
      </div>
    </div>
  );
}
