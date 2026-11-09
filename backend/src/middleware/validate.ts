import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validate(schema: z.ZodType<any>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const firstError = err.issues[0]?.message || 'Invalid input data';
        res.status(400).json({
          success: false,
          error: firstError,
          details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: 'Validation failed',
      });
    }
  };
}
