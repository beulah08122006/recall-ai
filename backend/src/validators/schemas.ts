import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'system']).optional(),
      reminderTime: z.string().optional(),
      enableTips: z.boolean().optional(),
    })
    .optional(),
});

export const MemorySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().default('Personal'),
  tags: z.array(z.string()).default([]),
  personId: z.string().optional(),
  personName: z.string().optional(),
  relatedItem: z.string().optional(),
});

export const ItemSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  personName: z.string().min(1, 'Person name is required'),
  personId: z.string().optional(),
  direction: z.enum(['borrowed', 'lent']),
  date: z.string().default(() => new Date().toISOString()),
  expectedReturnDate: z.string().optional(),
  status: z.enum(['active', 'returned', 'overdue']).default('active'),
  notes: z.string().optional(),
});

export const PersonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact: z.string().optional(),
  notes: z.string().optional(),
});

export const ReminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  status: z.enum(['pending', 'completed', 'overdue']).default('pending'),
  personId: z.string().optional(),
  personName: z.string().optional(),
  relatedItem: z.string().optional(),
});

export const CarryItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  category: z.string().default('Everyday Essentials'),
  checked: z.boolean().default(false),
});

export const RoutineSchema = z.object({
  name: z.string().min(1, 'Routine name is required'),
  activity: z.string().default('General'),
  destination: z.string().optional(),
  items: z.array(z.string()).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

export const ChatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

