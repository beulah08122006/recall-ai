import type { Response } from 'express';
import mongoose from 'mongoose';
import { Item } from '../models/Item.ts';
import type { AuthenticatedRequest } from '../types/index.ts';

function checkAndUpdateOverdue(items: any[]): any[] {
  const now = new Date();
  return items.map((item) => {
    const doc = item.toObject ? item.toObject() : { ...item };
    if (doc.status !== 'returned' && doc.expectedReturnDate) {
      const returnDate = new Date(doc.expectedReturnDate);
      if (returnDate < now) {
        doc.status = 'overdue';
      }
    }
    return doc;
  });
}

export async function getItems(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const { direction, status, search } = req.query;

  const query: any = { userId };

  if (direction) {
    query.direction = direction;
  }

  if (status && status !== 'all') {
    if (status === 'overdue') {
      query.status = { $ne: 'returned' };
      query.expectedReturnDate = { $lt: new Date() };
    } else {
      query.status = status;
    }
  }

  if (search && typeof search === 'string' && search.trim()) {
    const s = search.trim();
    const regex = new RegExp(s, 'i');
    query.$or = [{ itemName: regex }, { personName: regex }, { notes: regex }];
  }

  const rawItems = await Item.find(query).sort({ date: -1, createdAt: -1 });
  const items = checkAndUpdateOverdue(rawItems);

  res.json({ success: true, items });
}

export async function getItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  const item = await Item.findOne({
    _id: req.params.id,
    userId: req.user!.userId,
  });

  if (!item) {
    res.status(404).json({ success: false, error: 'Item not found' });
    return;
  }

  const processed = checkAndUpdateOverdue([item])[0];
  res.json({ success: true, item: processed });
}

export async function createItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  const item = await Item.create({
    ...req.body,
    userId: req.user!.userId,
  });

  const processed = checkAndUpdateOverdue([item])[0];
  res.status(201).json({ success: true, item: processed });
}

export async function updateItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  const item = await Item.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    req.body,
    { new: true }
  );

  if (!item) {
    res.status(404).json({ success: false, error: 'Item not found' });
    return;
  }

  const processed = checkAndUpdateOverdue([item])[0];
  res.json({ success: true, item: processed });
}

export async function markReturned(req: AuthenticatedRequest, res: Response): Promise<void> {
  const item = await Item.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    { status: 'returned' },
    { new: true }
  );

  if (!item) {
    res.status(404).json({ success: false, error: 'Item not found' });
    return;
  }

  res.json({ success: true, item });
}

export async function deleteItem(req: AuthenticatedRequest, res: Response): Promise<void> {
  const deleted = await Item.findOneAndDelete({
    _id: req.params.id,
    userId: req.user!.userId,
  });

  if (!deleted) {
    res.status(404).json({ success: false, error: 'Item not found' });
    return;
  }

  res.json({ success: true, message: 'Item record deleted successfully' });
}
