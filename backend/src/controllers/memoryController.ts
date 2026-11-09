import type { Response } from 'express';
import mongoose from 'mongoose';
import { Memory } from '../models/Memory.ts';
import type { AuthenticatedRequest } from '../types/index.ts';

export async function getMemories(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const { category, tag, search } = req.query;

  const query: any = { userId };

  if (category && category !== 'All') {
    query.category = category;
  }

  if (tag) {
    query.tags = tag;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const s = search.trim();
    const regex = new RegExp(s, 'i');
    query.$or = [{ title: regex }, { description: regex }, { tags: regex }, { personName: regex }];
  }

  const memories = await Memory.find(query).sort({ createdAt: -1 });
  res.json({ success: true, memories });
}

export async function getMemory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const memory = await Memory.findOne({
    _id: req.params.id,
    userId: req.user!.userId,
  });

  if (!memory) {
    res.status(404).json({ success: false, error: 'Memory not found' });
    return;
  }

  res.json({ success: true, memory });
}

export async function createMemory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const memory = await Memory.create({
    ...req.body,
    userId: req.user!.userId,
  });

  res.status(201).json({ success: true, memory });
}

export async function updateMemory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const memory = await Memory.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    req.body,
    { new: true }
  );

  if (!memory) {
    res.status(404).json({ success: false, error: 'Memory not found' });
    return;
  }

  res.json({ success: true, memory });
}

export async function deleteMemory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const deleted = await Memory.findOneAndDelete({
    _id: req.params.id,
    userId: req.user!.userId,
  });

  if (!deleted) {
    res.status(404).json({ success: false, error: 'Memory not found' });
    return;
  }

  res.json({ success: true, message: 'Memory deleted successfully' });
}
