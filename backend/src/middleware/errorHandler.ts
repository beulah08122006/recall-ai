import type { Request, Response, NextFunction } from 'express';
import { config } from '../config/env.ts';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Unhandled Error]', err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'An unexpected internal error occurred';

  res.status(status).json({
    success: false,
    error: message,
    ...(config.isProduction ? {} : { stack: err.stack }),
  });
}
