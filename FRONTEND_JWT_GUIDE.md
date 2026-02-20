# Frontend JWT Integration Guide

## Overview
This guide shows how to update the frontend to work with the new JWT authentication system.

---

## 1. Update Login Handler

**File:** `app/login/page.tsx`

**Current behavior:** Stores user object in localStorage  
**New behavior:** Store JWT token and use it for API calls

### Update the login submit handler:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role: selectedRole }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        setError(data.error);
        return;
      }
      
      // Handle other errors
      throw new Error(data.error || 'Login failed');
    }

    if (data.success) {
      // ✨ NEW: Store JWT token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on role
      const redirectMap: { [key: string]: string } = {
        police: '/dashboard/police',
        admin: '/dashboard/admin',
        officer: '/dashboard/officer',
      };
      
      router.push(redirectMap[selectedRole] || '/');
    }
  } catch (err: any) {
    setError(err.message || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

---

## 2. Create API Helper Function

**Create new file:** `lib/apiClient.ts`

```typescript
/**
 * API Client with JWT Authentication
 */

export class APIClient {
  private static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  static async fetch(url: string, options: RequestInit = {}) {
    const headers = {
      ...this.getHeaders(),
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle authentication errors
    if (response.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }

    if (response.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }

    return response;
  }

  static async get(url: string) {
    return this.fetch(url, { method: 'GET' });
  }

  static async post(url: string, data: any) {
    return this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async patch(url: string, data: any) {
    return this.fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  static async delete(url: string) {
    return this.fetch(url, { method: 'DELETE' });
  }
}
```

---

## 3. Update API Calls Throughout Application

### Example: Fetching Votes

**Before:**
```typescript
const response = await fetch('/api/votes?pollingCenterId=123');
const data = await response.json();
```

**After:**
```typescript
import { APIClient } from '@/lib/apiClient';

const response = await APIClient.get('/api/votes?pollingCenterId=123');
const data = await response.json();
```

### Example: Submitting Votes

**Before:**
```typescript
const response = await fetch('/api/votes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(voteData),
});
```

**After:**
```typescript
import { APIClient } from '@/lib/apiClient';

const response = await APIClient.post('/api/votes', voteData);
```

### Example: Updating User

**Before:**
```typescript
const response = await fetch('/api/users', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, ...updates }),
});
```

**After:**
```typescript
import { APIClient } from '@/lib/apiClient';

const response = await APIClient.patch('/api/users', { userId, ...updates });
```

---

## 4. Update Logout Handler

Add proper logout functionality that clears the JWT token:

```typescript
const handleLogout = () => {
  // Clear authentication
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirect to login
  router.push('/login');
};
```

---

## 5. Files That Need Updates

Search for these patterns and update to use APIClient:

### Pattern 1: fetch('/api/
```typescript
// FIND:
fetch('/api/votes'
fetch('/api/users'
fetch('/api/incidents'
fetch('/api/polling-centers'
fetch('/api/political-parties'
fetch('/api/audit-logs'

// REPLACE WITH:
APIClient.get('/api/votes'
// or
APIClient.post('/api/votes', data)
// etc.
```

### Likely files to update:
- `app/dashboard/admin/page.tsx`
- `app/dashboard/officer/page.tsx`
- `app/dashboard/police/page.tsx`
- `app/dashboard/admin/user-management/page.tsx`
- `app/dashboard/admin/system-logs/page.tsx`
- `app/dashboard/admin/incidents/page.tsx`
- `app/dashboard/police/incidents/page.tsx`
- Any other dashboard pages making API calls

---

## 6. Handle Rate Limiting Errors

Update login error handling to show rate limiting messages:

```typescript
try {
  const response = await fetch('/api/auth/login', { /* ... */ });
  const data = await response.json();

  if (response.status === 429) {
    // Rate limited
    if (data.blockedFor) {
      setError(`Too many failed attempts. Please try again in ${data.blockedFor} minute(s).`);
    } else if (data.attemptsLeft !== undefined) {
      setError(`${data.error} (${data.attemptsLeft} attempts remaining)`);
    } else {
      setError(data.error);
    }
    return;
  }

  if (!response.ok) {
    throw new Error(data.error);
  }

  // Success handling...
} catch (err) {
  setError(err.message);
}
```

---

## 7. Test Checklist

After implementing JWT authentication:

- [ ] Login successfully and verify token is stored
- [ ] Make API calls and verify Authorization header is included
- [ ] Test expired token (manually delete token, try API call)
- [ ] Test unauthorized access (officer accessing admin endpoints)
- [ ] Test rate limiting (5 failed login attempts)
- [ ] Test logout functionality
- [ ] Verify redirect to login on 401 errors
- [ ] Test all dashboard pages with authentication

---

## 8. Common Issues and Solutions

### Issue: "Unauthorized - Invalid or missing token"
**Solution:** Ensure token is stored in localStorage and APIClient is used for all API calls

### Issue: "Forbidden - Insufficient permissions"
**Solution:** User role doesn't have permission for this endpoint. Check role-based access matrix.

### Issue: Rate limiting blocks legitimate users
**Solution:** Wait 15 minutes or implement admin override functionality

### Issue: Token expires too quickly
**Solution:** Current expiry is 7 days. Can be adjusted in `lib/jwt.ts`

---

## 9. Quick Migration Script

Run this in browser console on any dashboard page to check if token exists:

```javascript
// Check if token is present
const token = localStorage.getItem('token');
if (token) {
  console.log('✅ Token found:', token.substring(0, 20) + '...');
  
  // Decode token (without verification)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Token payload:', payload);
    console.log('Expires:', new Date(payload.exp * 1000));
  } catch (e) {
    console.error('Invalid token format');
  }
} else {
  console.log('❌ No token found - need to login');
}
```

---

## 10. API Response Examples

### Successful Login
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "username": "officer1",
    "name": "Officer Rahman",
    "role": "Officer",
    // ... other fields
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Rate Limited (Too Many Attempts)
```json
{
  "error": "Too many failed login attempts. Please try again in 12 minute(s).",
  "blockedFor": 12
}
```

### Unauthorized API Access
```json
{
  "error": "Unauthorized - Invalid or missing token"
}
```

### Forbidden API Access
```json
{
  "error": "Forbidden - Insufficient permissions. Admin access required."
}
```

---

## Summary

1. ✅ Store JWT token from login response
2. ✅ Create APIClient helper to add Authorization header
3. ✅ Update all fetch calls to use APIClient
4. ✅ Handle 401/403 errors appropriately
5. ✅ Clear token on logout
6. ✅ Test thoroughly before deployment

**Estimated time:** 1-2 hours for complete frontend integration
