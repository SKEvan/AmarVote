'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ShieldIcon from '@/components/shared/ShieldIcon';
import UserProfileControls from '@/components/shared/UserProfileControls';
import SlidingSidebar from '@/components/shared/SlidingSidebar';
import NotificationBell from '@/components/shared/NotificationBell';
import CustomModal from '@/components/shared/CustomModal';
import { useModal } from '@/hooks/useModal';
import { fetchWithAuth } from '@/lib/fetchWithAuth';
import { 
  LogOut, 
  FileText, 
  AlertTriangle, 
  MapPin, 
  TrendingUp,
  Map,
  BarChart3,
  Users,
  FileCheck,
  Network,
  Menu,
  X,
  Search,
  Filter,
  UserPlus,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Shield,
  Check,
  AlertCircle,
  ChevronLeft
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Admin' | 'Officer' | 'Police';
  status: 'Active' | 'Inactive' | 'Pending';
  location: string;
  joinedDate: string;
  lastActive: string;
  username?: string;
  password?: string;
  serviceId?: string;
  rank?: string;
  avatar?: string;
  nidDocument?: string;
  pollingCenterId?: string;
  pollingCenterName?: string;
}

export default function UserManagementPage() {
  const router = useRouter();
  const modal = useModal();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 20;

  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Officer' as 'Admin' | 'Officer' | 'Police',
    location: '',
    password: '',
    username: ''
  });

  const handleLogout = () => {
    modal.showConfirm(
      'Are you sure you want to logout?',
      () => {
        router.push('/');
      },
      {
        variant: 'warning',
        title: 'Confirm Logout',
        confirmText: 'Logout',
        cancelText: 'Cancel'
      }
    );
  };

  // Load users from shared store
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Refresh when filters or page changes
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // Build query parameters  
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: usersPerPage.toString(),
        });
        
        if (filterRole && filterRole !== 'All') params.append('role', filterRole);
        if (filterStatus && filterStatus !== 'All') params.append('status', filterStatus);
        if (debouncedSearch.trim()) params.append('search', debouncedSearch.trim());
        
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
        
        try {
          const response = await fetchWithAuth(`/api/users?${params.toString()}`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!isMounted) return;
          
          if (response.ok) {
            const data = await response.json();
            // Map _id to id for compatibility
            const mappedUsers = (data.users || []).map((user: any) => ({
              ...user,
              id: user._id,
              joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
              lastActive: user.lastActive || 'Never'
            }));
            setUsers(mappedUsers);
            
            // Update pagination info
            if (data.pagination) {
              setTotalPages(data.pagination.totalPages);
              setTotalUsers(data.pagination.total);
            }
          } else if (response.status === 401) {
            modal.showAlert(
              'Session expired. Please login again.',
              'warning',
              'Session Expired'
            );
            router.push('/login?role=admin');
          }
        } catch (err: any) {
          if (!isMounted) return;
          
          if (err.name === 'AbortError') {
            modal.showAlert(
              'Request timed out. Please check your internet connection.',
              'error',
              'Timeout Error'
            );
          } else {
            console.error('Error fetching users:', err);
            modal.showAlert(
              'Failed to load users. Please try refreshing the page.',
              'error',
              'Error'
            );
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchUsers();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [currentPage, filterRole, filterStatus, debouncedSearch, usersPerPage]);
  
  // Separate function for manual refresh (used by action buttons)
  const refreshUsers = async () => {
    setCurrentPage(1);
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'Admin': return 'bg-emerald-100 text-emerald-700';
      case 'Officer': return 'bg-blue-100 text-blue-700';
      case 'Police': return 'bg-rose-100 text-rose-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Inactive': return 'bg-gray-100 text-gray-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Add new user
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.location || !newUser.password || !newUser.username) {
      modal.showAlert(
        'Please fill all fields',
        'warning',
        'Missing Information'
      );
      return;
    }

    try {
      const response = await fetchWithAuth('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          username: newUser.username,
          password: newUser.password,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          status: 'Active',
          location: newUser.location,
          lastActive: 'Just now'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        modal.showAlert(
          data.error || 'Failed to add user',
          'error',
          'Add User Failed'
        );
        return;
      }

      // Log user creation
      const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
      await fetchWithAuth('/api/audit-logs', {
        method: 'POST',
        body: JSON.stringify({
          user: adminInfo.name || 'Admin',
          action: 'USER_CREATED',
          details: `Created ${newUser.role} account: ${newUser.name} (${newUser.username})`,
          ip: 'Client',
        }),
      });

      await refreshUsers();
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', role: 'Officer', location: '', password: '', username: '' });
      modal.showAlert(
        `User added successfully! Username: ${newUser.username}`,
        'success',
        'User Added'
      );
    } catch (error) {
      console.error('Error adding user:', error);
      modal.showAlert(
        'An error occurred while adding the user',
        'error',
        'Error'
      );
    }
  };

  // Approve user
  const handleApproveUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: userId, status: 'Active' }),
      });

      if (!response.ok) {
        modal.showAlert(
          'Failed to approve user',
          'error',
          'Approval Failed'
        );
        return;
      }

      // Log user approval
      if (user) {
        const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
        await fetchWithAuth('/api/audit-logs', {
          method: 'POST',
          body: JSON.stringify({
            user: adminInfo.name || 'Admin',
            action: 'USER_APPROVED',
            details: `Approved ${user.role} account: ${user.name} (${user.username || user.email})`,
            ip: 'Client',
          }),
        });
      }
      
      await refreshUsers();
      setSuccessMessage('User approved successfully! They can now log in.');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error approving user:', error);
      modal.showAlert(
        'An error occurred while approving the user',
        'error',
        'Error'
      );
    }
  };

  // Reject user
  const handleRejectUser = async (userId: string) => {
    modal.showConfirm(
      'Are you sure you want to reject this user? This will delete their account.',
      async () => {
        const user = users.find(u => u.id === userId);
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/users?userId=${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          modal.showAlert(
            'Failed to reject user',
            'error',
            'Rejection Failed'
          );
          return;
        }

        // Log user rejection
        if (user) {
          const adminInfo = JSON.parse(localStorage.getItem('user') || '{}');
          await fetchWithAuth('/api/audit-logs', {
            method: 'POST',
            body: JSON.stringify({
              user: adminInfo.name || 'Admin',
              action: 'USER_REJECTED',
              details: `Rejected and deleted ${user.role} account: ${user.name} (${user.username || user.email})`,
              ip: 'Client',
            }),
          });
        }
        
        await refreshUsers();
        modal.showAlert(
          'User rejected and removed from the system.',
          'success',
          'User Rejected'
        );
      } catch (error) {
        console.error('Error rejecting user:', error);
        modal.showAlert(
          'An error occurred while rejecting the user',
          'error',
          'Error'
        );
      }
      },
      {
        variant: 'warning',
        title: 'Reject User',
        confirmText: 'Reject',
        cancelText: 'Cancel'
      }
    );
  };

  // View user details
  const handleViewUser = (user: User) => {
    console.log('Viewing user:', user);
    console.log('User nidDocument:', user.nidDocument ? 'Present' : 'Missing');
    if (user.nidDocument) {
      console.log('Document type:', user.nidDocument.substring(0, 30));
    }
    setSelectedUser(user);
    setShowUserDetailModal(true);
  };

  // Delete user
  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users?userId=${userToDelete}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          modal.showAlert(
            'Failed to delete user',
            'error',
            'Delete Failed'
          );
          return;
        }

        await refreshUsers();
        setShowDeleteModal(false);
        setUserToDelete(null);
        setSuccessMessage('User deleted successfully.');
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Error deleting user:', error);
        modal.showAlert(
          'An error occurred while deleting the user',
          'error',
          'Error'
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white px-6 py-4 sticky top-0 z-40 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-green-700 rounded transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-green-700 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">User Management</h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserProfileControls role="admin" />
          </div>
        </div>
      </header>

      {/* Sidebar */}
  <SlidingSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} hideTrigger />

      {/* Main Content */}
      <div className="transition-all duration-300">

        {/* Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Users</p>
                  <h3 className="text-3xl font-bold text-gray-800">{users.length}</h3>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Users</p>
                  <h3 className="text-3xl font-bold text-emerald-600">
                    {users.filter(u => u.status === 'Active').length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Pending Approval</p>
                  <h3 className="text-3xl font-bold text-yellow-600">
                    {users.filter(u => u.status === 'Pending').length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Inactive Users</p>
                  <h3 className="text-3xl font-bold text-gray-600">
                    {users.filter(u => u.status === 'Inactive').length}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="md:w-48">
                <select
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="All">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Officer">Officer</option>
                  <option value="Police">Police</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="md:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Add User Button */}
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <UserPlus className="w-5 h-5" />
                Add User
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                          <p className="text-gray-500">Loading users...</p>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-gray-500">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                    <tr 
                      key={user.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleViewUser(user)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                            <p className="text-xs text-gray-400">{user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {user.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{user.lastActive}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">{user.joinedDate}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.status === 'Pending' ? (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleApproveUser(user.id); }}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1 text-sm"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                                Approve
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleRejectUser(user.id); }}
                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 text-sm"
                                title="Reject"
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id); }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {users.length > 0 && (
              <div className="mt-6 px-6 pb-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-medium">{((currentPage - 1) * usersPerPage) + 1}</span> to <span className="font-medium">{Math.min(currentPage * usersPerPage, totalUsers)}</span> of <span className="font-medium">{totalUsers}</span> users
                </p>
                {totalPages > 1 && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                    className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${currentPage === 1 || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  >
                    Previous
                  </button>
                  {(() => {
                    // Smart pagination: show first, last, current and nearby pages
                    const pages = [];
                    const maxVisible = 7; // Maximum number of page buttons to show
                    
                    if (totalPages <= maxVisible) {
                      // Show all pages if total is small
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      // Show first page
                      pages.push(1);
                      
                      // Calculate range around current page
                      let start = Math.max(2, currentPage - 1);
                      let end = Math.min(totalPages - 1, currentPage + 1);
                      
                      // Add ellipsis if there's a gap
                      if (start > 2) pages.push('...');
                      
                      // Add pages around current
                      for (let i = start; i <= end; i++) pages.push(i);
                      
                      // Add ellipsis if there's a gap
                      if (end < totalPages - 1) pages.push('...');
                      
                      // Show last page
                      pages.push(totalPages);
                    }
                    
                    return pages.map((page, idx) => 
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-500">...</span>
                      ) : (
                        <button 
                          key={page}
                          onClick={() => setCurrentPage(page as number)}
                          disabled={isLoading}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page 
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                              : 'border border-gray-300 hover:bg-gray-50'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {page}
                        </button>
                      )
                    );
                  })()}
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoading}
                    className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages || isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                  >
                    Next
                  </button>
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New User</h2>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username (for login)</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  placeholder="Enter username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'Admin' | 'Officer' | 'Police'})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="Officer">Presiding Officer</option>
                  <option value="Police">Law Enforcement</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newUser.location}
                  onChange={(e) => setNewUser({...newUser, location: e.target.value})}
                  placeholder="e.g., Dhaka, Chattogram"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Enter password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedUser.status === 'Pending' ? 'Application Details' : 'User Profile Details'}
              </h2>
              <button 
                onClick={() => {
                  setShowUserDetailModal(false);
                  setSelectedUser(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  selectedUser.role === 'Police' 
                    ? 'bg-gradient-to-br from-rose-400 to-rose-600' 
                    : selectedUser.role === 'Officer'
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                    : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                }`}>
                  <span className="text-white font-semibold text-2xl">
                    {selectedUser.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedUser.name}</h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role === 'Police' ? 'Law Enforcement' : selectedUser.role === 'Officer' ? 'Presiding Officer' : selectedUser.role}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                    <p className="text-gray-800 font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                    <p className="text-gray-800 font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Service ID / Employee ID</label>
                    <p className="text-gray-800 font-medium">{selectedUser.serviceId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                    <p className="text-gray-800 font-medium">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Username</label>
                    <p className="text-gray-800 font-medium">{selectedUser.username || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              {(selectedUser.role === 'Police' || selectedUser.role === 'Officer') && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gray-500" />
                    {selectedUser.role === 'Police' ? 'Service Information' : 'Assignment Information'}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        {selectedUser.role === 'Police' ? 'Service ID' : 'NID'}
                      </label>
                      <p className="text-gray-800 font-medium">{selectedUser.serviceId || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        {selectedUser.role === 'Police' ? 'Rank / Designation' : 'Designation'}
                      </label>
                      <p className="text-gray-800 font-medium">{selectedUser.rank || 'N/A'}</p>
                    </div>
                    {selectedUser.role === 'Officer' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Polling Center ID</label>
                          <p className="text-gray-800 font-medium">{selectedUser.pollingCenterId || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Polling Center Name</label>
                          <p className="text-gray-800 font-medium">{selectedUser.pollingCenterName || 'N/A'}</p>
                        </div>
                      </>
                    )}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        {selectedUser.role === 'Police' ? 'Posted Station / Location' : 'Polling Station / Location'}
                      </label>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-800 font-medium">{selectedUser.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Document - Show for Officers and Police */}
              {(selectedUser.role === 'Officer' || selectedUser.role === 'Police') && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    {selectedUser.role === 'Officer' ? 'Attached NID Document' : 'Service Identity Card'}
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedUser.nidDocument ? (
                      <>
                        {selectedUser.nidDocument.startsWith('data:image') ? (
                          <div className="space-y-3">
                            <img 
                              src={selectedUser.nidDocument} 
                              alt={selectedUser.role === 'Officer' ? 'NID Document' : 'Service Identity Card'} 
                              className="w-full max-w-md mx-auto rounded-lg border-2 border-gray-200 shadow-sm"
                            />
                            <a
                              href={selectedUser.nidDocument}
                              download={`${selectedUser.role === 'Officer' ? 'NID' : 'ServiceCard'}_${selectedUser.name.replace(/\s+/g, '_')}.jpg`}
                              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <FileText className="w-4 h-4" />
                              Download Image
                            </a>
                          </div>
                        ) : selectedUser.nidDocument.startsWith('data:application/pdf') ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-center p-8 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                              <div className="text-center">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-600 font-medium mb-1">PDF Document</p>
                                <p className="text-xs text-gray-500">Click download to view</p>
                              </div>
                            </div>
                            <a
                              href={selectedUser.nidDocument}
                              download={`${selectedUser.role === 'Officer' ? 'NID' : 'ServiceCard'}_${selectedUser.name.replace(/\s+/g, '_')}.pdf`}
                              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <FileText className="w-4 h-4" />
                              Download PDF
                            </a>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Document format not supported for preview</p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center p-8 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-center">
                          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            {selectedUser.role === 'Officer' ? 'No NID document attached' : 'No service identity card attached'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-gray-500" />
                  Account Information
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
                    <p className="text-gray-800 font-medium">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Account Status</label>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Application Date</label>
                    <p className="text-gray-800 font-medium">{selectedUser.joinedDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Last Active</label>
                    <p className="text-gray-800 font-medium">{selectedUser.lastActive}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200">
                {selectedUser.status === 'Pending' ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        handleApproveUser(selectedUser.id);
                        setShowUserDetailModal(false);
                        setSelectedUser(null);
                      }}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve Application
                    </button>
                    <button
                      onClick={() => {
                        handleRejectUser(selectedUser.id);
                        setShowUserDetailModal(false);
                        setSelectedUser(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject Application
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowUserDetailModal(false);
                      setSelectedUser(null);
                    }}
                    className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/*         className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Delete User</h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Success!</h2>
            <p className="text-gray-600 text-center mb-6">
              {successMessage}
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal */}
      <CustomModal
        isOpen={modal.isOpen}
        onClose={modal.handleClose}
        title={modal.config.title}
        message={modal.config.message}
        type={modal.type}
        onConfirm={modal.handleConfirm}
        variant={modal.config.variant}
        confirmText={modal.config.confirmText}
        cancelText={modal.config.cancelText}
      />
    </div>
  );
}
