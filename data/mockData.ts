// ====== USER MANAGEMENT SYSTEM ======
export interface SystemUser {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  phone?: string;
  role: 'Admin' | 'Officer' | 'Police';
  status: 'Active' | 'Inactive' | 'Pending';
  location: string;
  joinedDate: string;
  lastActive: string;
  serviceId?: string;
  rank?: string;
  avatar?: string;
  pollingCenterId?: string;
  pollingCenterName?: string;
  thana?: string;
}

// Default users (hardcoded for demo)
const defaultUsers: SystemUser[] = [
  {
    id: 'USR-001',
    username: 'admin',
    password: 'admin123',
    name: 'Lt Tanvir Ahmed',
    email: 'tanvir.ahmed@bec.gov.bd',
    role: 'Admin',
    status: 'Active',
    location: 'Dhaka',
    joinedDate: '2024-01-15',
    lastActive: '2 hours ago'
  },
  {
    id: 'USR-002',
    username: 'officer',
    password: 'officer123',
    name: 'Md. Kamal Hossain',
    email: 'kamal.hossain@bec.gov.bd',
    role: 'Officer',
    status: 'Active',
    location: 'Chattogram',
    joinedDate: '2024-02-20',
    lastActive: '1 day ago'
  },
  {
    id: 'USR-003',
    username: 'rahman',
    password: 'rahman123',
    name: 'Inspector Rahim Khan',
    email: 'rahim.khan@police.gov.bd',
    role: 'Police',
    status: 'Active',
    location: 'Sylhet',
    joinedDate: '2024-03-10',
    lastActive: '3 hours ago'
  },
  {
    id: 'USR-004',
    username: 'fatima',
    password: 'fatima123',
    name: 'Ms. Fatima Begum',
    email: 'fatima.begum@bec.gov.bd',
    role: 'Officer',
    status: 'Pending',
    location: 'Rajshahi',
    joinedDate: '2024-11-25',
    lastActive: 'Never'
  },
  {
    id: 'USR-005',
    username: 'ali',
    password: 'ali123',
    name: 'ASP Mohammad Ali',
    email: 'mohammad.ali@police.gov.bd',
    role: 'Police',
    status: 'Inactive',
    location: 'Khulna',
    joinedDate: '2024-01-30',
    lastActive: '2 weeks ago'
  },
  {
    id: 'USR-006',
    username: 'shamima',
    password: 'shamima123',
    name: 'Dr. Shamima Rahman',
    email: 'shamima.rahman@bec.gov.bd',
    role: 'Admin',
    status: 'Active',
    location: 'Dhaka',
    joinedDate: '2023-12-01',
    lastActive: '30 mins ago'
  },
  {
    id: 'USR-007',
    username: 'nazrul',
    password: 'nazrul123',
    name: 'Nazrul Islam',
    email: 'nazrul.islam@bec.gov.bd',
    role: 'Officer',
    status: 'Active',
    location: 'Barisal',
    joinedDate: '2024-04-15',
    lastActive: '5 hours ago'
  },
  {
    id: 'USR-008',
    username: 'jasim',
    password: 'jasim123',
    name: 'SI Jasim Uddin',
    email: 'jasim.uddin@police.gov.bd',
    role: 'Police',
    status: 'Pending',
    location: 'Rangpur',
    joinedDate: '2024-12-01',
    lastActive: 'Never'
  }
];

const USERS_STORAGE_KEY = 'amarvote_users';
const USERS_VERSION_KEY = 'amarvote_users_version';
const CURRENT_VERSION = '2'; // Increment this when default users change

// Get users from localStorage or return defaults
export const getUsers = (): SystemUser[] => {
  if (typeof window === 'undefined') return defaultUsers;
  
  try {
    const storedVersion = localStorage.getItem(USERS_VERSION_KEY);
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    
    // If version matches and we have stored data, use it
    if (storedVersion === CURRENT_VERSION && stored) {
      return JSON.parse(stored);
    }
    
    // Otherwise, initialize with defaults (preserving any new registered users if possible)
    if (stored && storedVersion !== CURRENT_VERSION) {
      // Merge: keep registered users that aren't in defaults
      const oldUsers: SystemUser[] = JSON.parse(stored);
      const defaultIds = defaultUsers.map(u => u.id);
      const newRegisteredUsers = oldUsers.filter(u => !defaultIds.includes(u.id));
      const mergedUsers = [...defaultUsers, ...newRegisteredUsers];
      localStorage.setItem(USERS_VERSION_KEY, CURRENT_VERSION);
      saveUsers(mergedUsers);
      return mergedUsers;
    }
  } catch (e) {
    console.error('Error loading users:', e);
  }
  
  // Initialize with default users
  localStorage.setItem(USERS_VERSION_KEY, CURRENT_VERSION);
  saveUsers(defaultUsers);
  return defaultUsers;
};

// Save users to localStorage
export const saveUsers = (users: SystemUser[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users:', e);
  }
};

// Add a new user
export const addUser = (user: Omit<SystemUser, 'id'>): SystemUser => {
  const users = getUsers();
  // Find the highest existing ID number and increment
  const maxId = users.reduce((max, u) => {
    const idNum = parseInt(u.id.replace('USR-', ''), 10);
    return idNum > max ? idNum : max;
  }, 0);
  const newId = `USR-${String(maxId + 1).padStart(3, '0')}`;
  const newUser: SystemUser = { ...user, id: newId };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

// Update user status
export const updateUserStatus = (userId: string, status: 'Active' | 'Inactive' | 'Pending'): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].status = status;
    users[index].lastActive = status === 'Active' ? 'Just now' : users[index].lastActive;
    saveUsers(users);
  }
};

// Delete a user
export const deleteUser = (userId: string): void => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== userId);
  saveUsers(filtered);
};

// Update user profile (phone and avatar)
export const updateUserProfile = (userId: string, updates: { phone?: string; avatar?: string }): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    if (updates.phone) users[index].phone = updates.phone;
    if (updates.avatar !== undefined) users[index].avatar = updates.avatar;
    saveUsers(users);
  }
};

// Get user by ID
export const getUserById = (userId: string): SystemUser | undefined => {
  const users = getUsers();
  return users.find(u => u.id === userId);
};

// Authenticate user (for login)
export const authenticateUser = (username: string, password: string, role: 'admin' | 'officer' | 'police'): { success: boolean; user?: SystemUser; error?: string } => {
  const users = getUsers();
  
  const roleMap = {
    admin: 'Admin',
    officer: 'Officer', 
    police: 'Police'
  };
  
  const user = users.find(u => 
    u.username.toLowerCase() === username.toLowerCase() && 
    u.password === password &&
    u.role === roleMap[role]
  );
  
  if (!user) {
    return { success: false, error: 'Invalid credentials. Please check your username, password, and selected role.' };
  }
  
  if (user.status === 'Pending') {
    return { success: false, error: 'Your account is pending approval. Please wait for admin verification.' };
  }
  
  if (user.status === 'Inactive') {
    return { success: false, error: 'Your account has been deactivated. Please contact the administrator.' };
  }
  
  return { success: true, user };
};

// Register new law enforcement user
export const registerLawEnforcementUser = (userData: {
  fullName: string;
  email: string;
  phone: string;
  serviceId: string;
  postedStation: string;
  district: string;
  rank: string;
  username: string;
  password: string;
}): SystemUser => {
  return addUser({
    username: userData.username,
    password: userData.password,
    name: userData.fullName,
    email: userData.email,
    phone: userData.phone,
    role: 'Police',
    status: 'Pending',
    location: `${userData.district} - ${userData.postedStation}`,
    joinedDate: new Date().toISOString().split('T')[0],
    lastActive: 'Never',
    serviceId: userData.serviceId,
    rank: userData.rank
  });
};

// Register new presiding officer user
export const registerPresidingOfficerUser = (userData: {
  fullName: string;
  email: string;
  phone: string;
  employeeId: string;
  pollingStation: string;
  pollingCenterId?: string;
  district: string;
  thana?: string;
  designation: string;
  username: string;
  password: string;
}): SystemUser => {
  return addUser({
    username: userData.username,
    password: userData.password,
    name: userData.fullName,
    email: userData.email,
    phone: userData.phone,
    role: 'Officer',
    status: 'Pending',
    location: `${userData.district} - ${userData.pollingStation}`,
    joinedDate: new Date().toISOString().split('T')[0],
    lastActive: 'Never',
    serviceId: userData.employeeId,
    rank: userData.designation,
    pollingCenterId: userData.pollingCenterId,
    pollingCenterName: userData.pollingStation,
    thana: userData.thana
  });
};

// ====== INCIDENTS DATA ======
export const incidents = [
  {
    id: 'INC-001',
    title: 'Voter intimidation reported',
    type: 'Intimidation',
    severity: 'HIGH',
    division: 'Dhaka',
    location: 'Dhaka-10, Mirpur Polling Station',
    lat: 23.8223,
    lng: 90.3654,
    status: 'pending',
    reportedTime: '2025-12-27 10:45 AM',
    reportedBy: 'Officer Rahman',
  },
  {
    id: 'INC-002',
    title: 'Ballot box tampering attempt',
    type: 'Tampering',
    severity: 'CRITICAL',
    division: 'Chittagong',
    location: 'Chittagong-5, Agrabad Station',
    lat: 22.3569,
    lng: 91.7832,
    status: 'responded',
    reportedTime: '2025-12-27 11:20 AM',
    reportedBy: 'Officer Hassan',
  },
  {
    id: 'INC-003',
    title: 'Technical malfunction - EVM',
    type: 'Technical',
    severity: 'MEDIUM',
    division: 'Rajshahi',
    location: 'Rajshahi-3, Boalia Thana',
    lat: 24.3745,
    lng: 88.6042,
    status: 'resolved',
    reportedTime: '2025-12-27 09:15 AM',
    reportedBy: 'Officer Khan',
  },
  {
    id: 'INC-004',
    title: 'Crowd control issue',
    type: 'Control',
    severity: 'MEDIUM',
    division: 'Dhaka',
    location: 'Dhaka-6, Tejgaon',
    lat: 23.7850,
    lng: 90.3650,
    status: 'pending',
    reportedTime: '2025-12-27 10:05 AM',
    reportedBy: 'Officer Ahmed',
  },
  {
    id: 'INC-005',
    title: 'Unknown individuals photographing voters',
    type: 'Unauthorized Activity',
    severity: 'HIGH',
    division: 'Khulna',
    location: 'Khulna-2, Khulna City',
    lat: 22.8456,
    lng: 89.5671,
    status: 'pending',
    reportedTime: '2025-12-27 11:50 AM',
    reportedBy: 'Officer Karim',
  },
];

export const logs = [
  { id: 1, timestamp: '20/12/2025 16:23:15', user: 'officer@dhaka-6', action: 'VOTE SUBMITTED', details: 'Submitted votes for Tejgaon Polling Center (DHK-PS-006)', ip: '103.45.12.34' },
  { id: 2, timestamp: '20/12/2025 16:15:42', user: 'admin@bec', action: 'USER CREATED', details: 'Created new presiding officer account for Comilla-2', ip: '103.45.12.1' },
  { id: 3, timestamp: '20/12/2025 16:05:18', user: 'officer@mirpur', action: 'INCIDENT REPORTED', details: 'Reported voter intimidation incident (INC-001)', ip: '103.45.12.56' },
  { id: 4, timestamp: '20/12/2025 15:58:33', user: 'law_enforcement@dhaka', action: 'INCIDENT VIEWED', details: 'Viewed incident details for INC-002', ip: '103.45.12.89' },
  { id: 5, timestamp: '20/12/2025 15:45:21', user: 'admin@bec', action: 'DASHBOARD ACCESSED', details: 'Accessed admin dashboard and viewed statistics', ip: '103.45.12.1' },
  { id: 6, timestamp: '20/12/2025 15:30:55', user: 'officer@chittagong-5', action: 'VOTE SUBMITTED', details: 'Submitted votes for Agrabad Polling Center (CTG-PS-005)', ip: '103.45.13.22' },
  { id: 7, timestamp: '20/12/2025 15:12:09', user: 'law_enforcement@rajshahi', action: 'INCIDENT ACKNOWLEDGED', details: 'Acknowledged and responded to incident INC-003', ip: '103.45.14.45' },
  { id: 8, timestamp: '20/12/2025 14:55:44', user: 'admin@bec', action: 'PERMISSIONS MODIFIED', details: 'Updated permissions for law enforcement role', ip: '103.45.12.1' },
];

export const notifications = [
  { id: 'NOT-001', incidentId: 'INC-002', title: 'New High Priority Incident', message: 'Ballot box tampering attempt', time: '2 minutes ago', priority: 'HIGH', read: false },
  { id: 'NOT-002', incidentId: 'INC-004', title: 'New Medium Priority Incident', message: 'Crowd control issue', time: '15 minutes ago', priority: 'MEDIUM', read: false },
];
