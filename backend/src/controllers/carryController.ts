import type { Response } from 'express';
import mongoose from 'mongoose';
import { CarryListItem } from '../models/CarryListItem.ts';
import type { AuthenticatedRequest } from '../types/index.ts';

export async function getCarryItems(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const items = await CarryListItem.find({ userId }).sort({ createdAt: -1 });
  res.json({ success: true, items });
}

export async function createCarryItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  const item = await CarryListItem.create({
    ...req.body,
    userId: req.user!.userId,
  });

  res.status(201).json({ success: true, item });
}

export async function updateCarryItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  const item = await CarryListItem.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    req.body,
    { new: true }
  );

  if (!item) {
    res.status(404).json({ success: false, error: 'Carry item not found' });
    return;
  }

  res.json({ success: true, item });
}

export async function toggleCarryChecked(req: AuthenticatedRequest, res: Response): Promise<void> {
  const item = await CarryListItem.findOne({
    _id: req.params.id,
    userId: req.user!.userId,
  });

  if (!item) {
    res.status(404).json({ success: false, error: 'Carry item not found' });
    return;
  }

  item.checked = !item.checked;
  await item.save();

  res.json({ success: true, item });
}

export async function deleteCarryItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  const deleted = await CarryListItem.findOneAndDelete({
    _id: req.params.id,
    userId: req.user!.userId,
  });

  if (!deleted) {
    res.status(404).json({ success: false, error: 'Carry item not found' });
    return;
  }

  res.json({ success: true, message: 'Carry item deleted' });
}

export async function clearCompletedCarry(req: AuthenticatedRequest, res: Response): Promise<void> {
  await CarryListItem.deleteMany({
    userId: req.user!.userId,
    checked: true,
  });

  res.json({ success: true, message: 'Completed carry items cleared' });
}
