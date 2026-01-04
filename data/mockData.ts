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
  nidDocument?: string;
}

// Default users include the ultimate BEC admin account
const defaultUsers: SystemUser[] = [
  {
    id: 'USR-001',
    username: 'admin',
    password: 'admin123',
    name: 'BEC Admin',
    email: 'admin@bec.gov.bd',
    role: 'Admin',
    status: 'Active',
    location: 'BEC HQ',
    joinedDate: new Date().toISOString().split('T')[0],
    lastActive: 'Just now',
  },
];

// Known demo users to purge from older localStorage state (keep the real admin)
const DEMO_USER_EMAILS = new Set([
  'tanvir.ahmed@bec.gov.bd',
  'kamal.hossain@bec.gov.bd',
  'rahim.khan@police.gov.bd',
  'fatima.begum@bec.gov.bd',
  'mohammad.ali@police.gov.bd',
  'shamima.rahman@bec.gov.bd',
  'nazrul.islam@bec.gov.bd',
  'jasim.uddin@police.gov.bd',
]);

const DEMO_USER_USERNAMES = new Set(['officer', 'police']);

const ensureAdminPresent = (users: SystemUser[]): SystemUser[] => {
  const hasAdmin = users.some((u) => u.username.toLowerCase() === 'admin' && u.role === 'Admin');
  if (hasAdmin) return users;
  // Insert the default admin at the front for visibility
  return [defaultUsers[0], ...users];
};

const purgeDemoUsers = (users: SystemUser[]): SystemUser[] => {
  const filtered = users.filter(
    (u) => !DEMO_USER_EMAILS.has(u.email.toLowerCase()) && !DEMO_USER_USERNAMES.has(u.username.toLowerCase())
  );

  // If everything was demo, return an empty array
  return filtered;
};

const USERS_STORAGE_KEY = 'amarvote_users';

// Get users from localStorage or return defaults
export const getUsers = (): SystemUser[] => {
  if (typeof window === 'undefined') return defaultUsers;

  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) {
      const parsed: SystemUser[] = JSON.parse(stored);
      const sanitized = ensureAdminPresent(purgeDemoUsers(parsed));

      // Write back if demo users were removed
      if (sanitized.length !== parsed.length) {
        saveUsers(sanitized);
      }

      return sanitized;
    }
  } catch (e) {
    console.error('Error loading users:', e);
  }

  // Initialize empty store
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
  nidDocument?: string;
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
    thana: userData.thana,
    nidDocument: userData.nidDocument
  });
};

// Legacy exports kept for compatibility but empty to prevent demo seeding
export const incidents: any[] = [];
export const logs: any[] = [];
export const notifications: any[] = [];
