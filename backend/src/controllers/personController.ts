import type { Response } from 'express';
import mongoose from 'mongoose';
import { Person } from '../models/Person.ts';
import { Item } from '../models/Item.ts';
import { Memory } from '../models/Memory.ts';
import { Reminder } from '../models/Reminder.ts';
import type { AuthenticatedRequest } from '../types/index.ts';

export async function getPeople(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const { search } = req.query;

  const query: any = { userId };
  if (search && typeof search === 'string' && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: regex }, { contact: regex }, { notes: regex }];
  }

  const people = await Person.find(query).sort({ name: 1 });
  res.json({ success: true, people });
}

export async function getPersonDetail(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const person = await Person.findOne({ _id: req.params.id, userId });

  if (!person) {
    res.status(404).json({ success: false, error: 'Person not found' });
    return;
  }

  // Fetch linked records by personId or personName
  const [items, memories, reminders] = await Promise.all([
    Item.find({
      userId,
      $or: [{ personId: person._id }, { personName: person.name }],
    }).sort({ createdAt: -1 }),
    Memory.find({
      userId,
      $or: [{ personId: person._id }, { personName: person.name }],
    }).sort({ createdAt: -1 }),
    Reminder.find({
      userId,
      $or: [{ personId: person._id }, { personName: person.name }],
    }).sort({ createdAt: -1 }),
  ]);

  res.json({
    success: true,
    _id: person._id,
    name: person.name,
    contact: person.contact,
    notes: person.notes,
    createdAt: person.createdAt,
    updatedAt: person.updatedAt,
    items,
    memories,
    reminders,
  });
}

export async function createPerson(req: AuthenticatedRequest, res: Response): Promise<void> {
  const person = await Person.create({
    ...req.body,
    userId: req.user!.userId,
  });

  res.status(201).json({ success: true, person });
}

export async function updatePerson(req: AuthenticatedRequest, res: Response): Promise<void> {
  const person = await Person.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.userId },
    req.body,
    { new: true }
  );

  if (!person) {
    res.status(404).json({ success: false, error: 'Person not found' });
    return;
  }

  res.json({ success: true, person });
}

export async function deletePerson(req: AuthenticatedRequest, res: Response): Promise<void> {
  const deleted = await Person.findOneAndDelete({
    _id: req.params.id,
    userId: req.user!.userId,
  });

  if (!deleted) {
    res.status(404).json({ success: false, error: 'Person not found' });
    return;
  }

  res.json({ success: true, message: 'Person removed successfully' });
}
