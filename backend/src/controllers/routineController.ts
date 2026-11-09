import type { Response } from 'express';
import mongoose from 'mongoose';
import { Routine } from '../models/Routine.ts';
import type { AuthenticatedRequest } from '../types/index.ts';

export async function getRoutines(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const routines = await Routine.find({ userId }).sort({ createdAt: -1 });
  res.json({ success: true, routines });
}

export async function createRoutine(req: AuthenticatedRequest, res: Response): Promise<void> {
  const routine = await Routine.create({
    ...req.body,
    userId: req.user!.userId,
  });

  res.status(201).json({ success: true, routine });
}

export async function updateRoutine(req: AuthenticatedRequest, res: Response): Promise<void> {
  const routine = await Routine.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    req.body,
    { new: true }
  );

  if (!routine) {
    res.status(404).json({ success: false, error: 'Routine not found' });
    return;
  }

  res.json({ success: true, routine });
}

export async function deleteRoutine(req: AuthenticatedRequest, res: Response): Promise<void> {
  const deleted = await Routine.findOneAndDelete({
    _id: req.params.id,
    userId: req.user!.userId,
  });

  if (!deleted) {
    res.status(404).json({ success: false, error: 'Routine not found' });
    return;
  }

  res.json({ success: true, message: 'Routine deleted' });
}
