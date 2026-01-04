// Audit Log Utility for tracking all user actions
export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ip: string;
}

// Get client IP (simplified - in production use proper IP detection)
function getClientIP(): string {
  // In a real app, you'd get this from the server or a service
  return '103.45.12.' + Math.floor(Math.random() * 255);
}

// Format timestamp
function formatTimestamp(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

// Generate unique ID
function generateLogId(): string {
  return `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get all logs from localStorage
export function getAuditLogs(): AuditLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('auditLogs');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading audit logs:', error);
    return [];
  }
}

// Add a new log entry
export function addAuditLog(action: string, details: string, user?: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Get current user if not provided
    let username = user;
    if (!username) {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        username = userData.username || userData.email || 'Unknown';
      } else {
        username = 'System';
      }
    }

    const logs = getAuditLogs();
    const newLog: AuditLog = {
      id: generateLogId(),
      timestamp: formatTimestamp(),
      user: username,
      action: action,
      details: details,
      ip: getClientIP(),
    };

    // Add to beginning of array (newest first)
    logs.unshift(newLog);

    // Keep only last 1000 logs to prevent excessive storage
    const trimmedLogs = logs.slice(0, 1000);

    localStorage.setItem('auditLogs', JSON.stringify(trimmedLogs));

    // Dispatch custom event so other components can listen
    window.dispatchEvent(new CustomEvent('auditLogUpdated', { detail: newLog }));
  } catch (error) {
    console.error('Error adding audit log:', error);
  }
}

// Clear all logs (admin only)
export function clearAuditLogs(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auditLogs');
  window.dispatchEvent(new CustomEvent('auditLogUpdated'));
}

// Predefined action types for consistency
export const AuditActions = {
  // Authentication
  USER_LOGIN: 'USER LOGIN',
  USER_LOGOUT: 'USER LOGOUT',
  LOGIN_FAILED: 'LOGIN FAILED',
  
  // User Management
  USER_CREATED: 'USER CREATED',
  USER_UPDATED: 'USER UPDATED',
  USER_DELETED: 'USER DELETED',
  USER_APPROVED: 'USER APPROVED',
  USER_REJECTED: 'USER REJECTED',
  
  // Voting
  VOTE_SUBMITTED: 'VOTE SUBMITTED',
  VOTE_UPDATED: 'VOTE UPDATED',
  VOTE_VIEWED: 'VOTE VIEWED',
  
  // Incidents
  INCIDENT_REPORTED: 'INCIDENT REPORTED',
  INCIDENT_VIEWED: 'INCIDENT VIEWED',
  INCIDENT_ACKNOWLEDGED: 'INCIDENT ACKNOWLEDGED',
  INCIDENT_UPDATED: 'INCIDENT UPDATED',
  
  // Dashboard
  DASHBOARD_ACCESSED: 'DASHBOARD ACCESSED',
  REPORT_GENERATED: 'REPORT GENERATED',
  DATA_EXPORTED: 'DATA EXPORTED',
  
  // Security
  PERMISSIONS_MODIFIED: 'PERMISSIONS MODIFIED',
  SETTINGS_CHANGED: 'SETTINGS CHANGED',
  PASSWORD_CHANGED: 'PASSWORD CHANGED',
  
  // Profile
  PROFILE_VIEWED: 'PROFILE VIEWED',
  PROFILE_UPDATED: 'PROFILE UPDATED',
};
