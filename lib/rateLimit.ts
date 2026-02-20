/**
 * In-memory rate limiting for login attempts
 * Tracks failed login attempts by username and IP address
 */

interface LoginAttempt {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

// In-memory storage (resets on server restart)
const loginAttempts = new Map<string, LoginAttempt>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Check if user/IP is rate limited
 */
export function isRateLimited(identifier: string): boolean {
  const attempt = loginAttempts.get(identifier);
  
  if (!attempt) {
    return false;
  }
  
  const now = Date.now();
  
  // Check if still blocked
  if (attempt.blockedUntil && now < attempt.blockedUntil) {
    return true;
  }
  
  // Reset if window expired
  if (now - attempt.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(identifier);
    return false;
  }
  
  return false;
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(identifier: string): {
  blocked: boolean;
  attemptsLeft: number;
  blockedUntil?: Date;
} {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);
  
  if (!attempt) {
    // First attempt
    loginAttempts.set(identifier, {
      count: 1,
      firstAttempt: now,
    });
    return { blocked: false, attemptsLeft: MAX_ATTEMPTS - 1 };
  }
  
  // Reset if window expired
  if (now - attempt.firstAttempt > WINDOW_MS) {
    loginAttempts.set(identifier, {
      count: 1,
      firstAttempt: now,
    });
    return { blocked: false, attemptsLeft: MAX_ATTEMPTS - 1 };
  }
  
  // Increment count
  attempt.count++;
  
  // Block if max attempts reached
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.blockedUntil = now + BLOCK_DURATION_MS;
    loginAttempts.set(identifier, attempt);
    return {
      blocked: true,
      attemptsLeft: 0,
      blockedUntil: new Date(attempt.blockedUntil),
    };
  }
  
  loginAttempts.set(identifier, attempt);
  return { blocked: false, attemptsLeft: MAX_ATTEMPTS - attempt.count };
}

/**
 * Clear failed attempts on successful login
 */
export function clearFailedAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

/**
 * Get time remaining until unblock
 */
export function getBlockedTimeRemaining(identifier: string): number {
  const attempt = loginAttempts.get(identifier);
  
  if (!attempt || !attempt.blockedUntil) {
    return 0;
  }
  
  const remaining = attempt.blockedUntil - Date.now();
  return remaining > 0 ? remaining : 0;
}

/**
 * Clean up old entries (run periodically)
 */
export function cleanupOldAttempts(): void {
  const now = Date.now();
  
  for (const [identifier, attempt] of loginAttempts.entries()) {
    // Remove if window expired and not blocked
    if (now - attempt.firstAttempt > WINDOW_MS && (!attempt.blockedUntil || now > attempt.blockedUntil)) {
      loginAttempts.delete(identifier);
    }
  }
}

// Cleanup old attempts every 5 minutes
setInterval(cleanupOldAttempts, 5 * 60 * 1000);
