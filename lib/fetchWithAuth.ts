/**
 * Utility function to make authenticated API requests
 * Automatically includes JWT token from localStorage
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  // Add Authorization header
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
}
