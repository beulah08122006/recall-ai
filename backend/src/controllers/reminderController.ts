import type { Response } from 'express';
import mongoose from 'mongoose';
import { Reminder } from '../models/Reminder.ts';
import type { AuthenticatedRequest } from '../types/index.ts';

export async function getReminders(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const { status, priority, search } = req.query;

  const query: any = { userId };

  if (status && status !== 'all') {
    query.status = status;
  }

  if (priority) {
    query.priority = priority;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const s = search.trim();
    const regex = new RegExp(s, 'i');
    query.$or = [{ title: regex }, { description: regex }, { personName: regex }];
  }

  const reminders = await Reminder.find(query).sort({ date: 1, time: 1 });
  res.json({ success: true, reminders });
}

export async function getUpcoming(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const reminders = await Reminder.find({
    userId,
    status: { $ne: 'completed' },
  })
    .sort({ date: 1, time: 1 })
    .limit(10);

  res.json({ success: true, reminders });
}

export async function createReminder(req: AuthenticatedRequest, res: Response): Promise<void> {
  const reminder = await Reminder.create({
    ...req.body,
    userId: req.user!.userId,
  });

  res.status(201).json({ success: true, reminder });
}

export async function updateReminder(req: AuthenticatedRequest, res: Response): Promise<void> {
  const reminder = await Reminder.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    req.body,
    { new: true }
  );

  if (!reminder) {
    res.status(404).json({ success: false, error: 'Reminder not found' });
    return;
  }

  res.json({ success: true, reminder });
}

export async function toggleComplete(req: AuthenticatedRequest, res: Response): Promise<void> {
  const reminder = await Reminder.findOne({
    _id: req.params.id,
    userId: req.user!.userId,
  });

  if (!reminder) {
    res.status(404).json({ success: false, error: 'Reminder not found' });
    return;
  }

  reminder.status = reminder.status === 'completed' ? 'pending' : 'completed';
  await reminder.save();

  res.json({ success: true, reminder });
}

export async function deleteReminder(req: AuthenticatedRequest, res: Response): Promise<void> {
  const deleted = await Reminder.findOneAndDelete({
    _id: req.params.id,
    userId: req.user!.userId,
  });

  if (!deleted) {
    res.status(404).json({ success: false, error: 'Reminder not found' });
    return;
  }

  res.json({ success: true, message: 'Reminder deleted successfully' });
}
