import { Request, Response, NextFunction } from 'express';
import { getAdminAuth, isAdminConfigured } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Not a 401: the caller's token may be perfectly good. This deployment
  // simply cannot check it, and saying "unauthorized" would send them off
  // re-authenticating against a wall.
  if (!isAdminConfigured) {
    return res
      .status(503)
      .json({ error: 'Accounts are not configured in this environment.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
