import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    username: string;
    role: string;
    email: string;
  };
}

/**
 * Middleware to verify JWT token and authenticate requests
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options?: { roles?: string[] }
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.get('authorization');
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required. Please login to continue.' },
          { status: 401 }
        );
      }

      // Verify token
      const payload = verifyToken(token);

      if (!payload) {
        return NextResponse.json(
          { error: 'Invalid or expired token. Please login again.' },
          { status: 401 }
        );
      }

      // Check role authorization if specified
      if (options?.roles && !options.roles.includes(payload.role)) {
        return NextResponse.json(
          { error: 'Unauthorized. You do not have permission to access this resource.' },
          { status: 403 }
        );
      }

      // Attach user info to request
      const authReq = req as AuthenticatedRequest;
      authReq.user = {
        userId: payload.userId,
        username: payload.username,
        role: payload.role,
        email: payload.email,
      };

      // Call the actual handler
      return await handler(authReq);
    } catch (error: any) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware for admin-only routes
 */
export function withAdminAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(handler, { roles: ['Admin'] });
}

/**
 * Middleware for officer-only routes
 */
export function withOfficerAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(handler, { roles: ['Officer'] });
}

/**
 * Middleware for police-only routes
 */
export function withPoliceAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return withAuth(handler, { roles: ['Police'] });
}
