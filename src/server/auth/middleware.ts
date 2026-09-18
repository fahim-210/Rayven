import { Request, Response, NextFunction } from 'express';
import { authStore } from './store.ts';
import { ServerUser, SessionRecord } from './types.ts';

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: ServerUser;
  sessionRecord?: SessionRecord;
}

export function extractSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 2. Check HTTP cookie
  if (!token && req.cookies && req.cookies.rayven_session) {
    token = req.cookies.rayven_session;
  }

  if (token) {
    const session = authStore.getSession(token);
    if (session) {
      const user = authStore.getUserById(session.userId);
      if (user && user.isActive) {
        req.user = user;
        req.sessionRecord = session;
      }
    }
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.sessionRecord) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in.',
      code: 'UNAUTHORIZED',
    });
  }

  if (!req.user.isActive) {
    return res.status(403).json({
      error: 'Your account has been deactivated. Please contact support.',
      code: 'ACCOUNT_DEACTIVATED',
    });
  }

  next();
}

/**
 * Strictly protects all /admin operations.
 * Customers are strictly blocked with 403 Forbidden!
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.sessionRecord) {
    return res.status(401).json({
      error: 'Administrative sign-in required.',
      code: 'UNAUTHORIZED',
    });
  }

  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      error: 'Access Denied: Customers and unauthorized accounts cannot access administrative resources.',
      code: 'FORBIDDEN_CUSTOMER_ACCESS',
    });
  }

  next();
}

export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      error: 'Access Denied: Super Administrator privileges required.',
      code: 'FORBIDDEN_SUPER_ADMIN_REQUIRED',
    });
  }

  next();
}

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const permissions = req.user.adminProfile?.permissions || [];
    if (!permissions.includes(permission)) {
      return res.status(403).json({
        error: `Forbidden: Missing required privilege '${permission}'.`,
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    next();
  };
}
