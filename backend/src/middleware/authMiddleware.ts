import type { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.ts';
import type { AuthenticatedRequest } from '../types/index.ts';

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication token required',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please sign in again.',
    });
    return;
  }

  req.user = payload;
  next();
}
