import type { Request } from 'express';

export interface AuthUser {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export type MemoryCategory =
  | 'Personal'
  | 'Important dates'
  | 'Notes'
  | 'Experiences'
  | 'Places'
  | 'Preferences'
  | 'Other';

export type ItemDirection = 'borrowed' | 'lent';
export type ItemStatus = 'active' | 'returned' | 'overdue';

export type ReminderPriority = 'low' | 'medium' | 'high';
export type ReminderStatus = 'pending' | 'completed' | 'overdue';

