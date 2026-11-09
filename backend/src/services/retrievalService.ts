import mongoose from 'mongoose';
import { Memory } from '../models/Memory.ts';
import { Item } from '../models/Item.ts';
import { Reminder } from '../models/Reminder.ts';
import { Routine } from '../models/Routine.ts';
import { Person } from '../models/Person.ts';

export interface RetrievedContext {
  memories: any[];
  items: any[];
  reminders: any[];
  routines: any[];
  people: any[];
  sources: { type: 'memory' | 'item' | 'reminder' | 'routine' | 'person'; id: string; title: string; detail?: string }[];
}

export async function retrieveUserContext(userIdStr: string, query: string): Promise<RetrievedContext> {
  const userId = new mongoose.Types.ObjectId(userIdStr);
  const qLower = query.toLowerCase().trim();
  const words = qLower.split(/\s+/).filter((w) => w.length > 2);

  const context: RetrievedContext = {
    memories: [],
    items: [],
    reminders: [],
    routines: [],
    people: [],
    sources: [],
  };

  // Determine intent categories
  const isAboutLending = /lend|lent|borrow|give|gave|held|return|overdue|item|take/i.test(qLower);
  const isAboutReminders = /remind|task|appointment|bill|due|tomorrow|today|schedule/i.test(qLower);
  const isAboutDeparture = /pack|leave|before|luggage|bring|bag|trip|commute|routine|checklist/i.test(qLower);
  const isAboutPeople = /who|person|contact|friend|colleague/i.test(qLower);

  // 1. Search Items (Borrowed & Lent)
  if (isAboutLending || words.length === 0) {
    const itemFilter: any = { userId };
    if (qLower.includes('overdue')) {
      itemFilter.status = 'overdue';
    } else if (qLower.includes('borrow')) {
      itemFilter.direction = 'borrowed';
    } else if (qLower.includes('lend') || qLower.includes('lent')) {
      itemFilter.direction = 'lent';
    }

    const items = await Item.find(itemFilter).sort({ updatedAt: -1 }).limit(10).lean();
    context.items = items;
    items.forEach((item) => {
      context.sources.push({
        type: 'item',
        id: (item as any)._id.toString(),
        title: `${item.itemName} (${item.direction === 'lent' ? 'Lent to' : 'Borrowed from'} ${item.personName})`,
        detail: `Status: ${item.status}, Date: ${item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}`,
      });
    });
  }

  // 2. Search Reminders
  if (isAboutReminders || words.length === 0) {
    const reminders = await Reminder.find({ userId, status: { $ne: 'completed' } })
      .sort({ date: 1 })
      .limit(8)
      .lean();
    context.reminders = reminders;
    reminders.forEach((r) => {
      context.sources.push({
        type: 'reminder',
        id: (r as any)._id.toString(),
        title: `${r.title} (${r.date})`,
        detail: `Priority: ${r.priority}, Status: ${r.status}`,
      });
    });
  }

  // 3. Search Routines
  if (isAboutDeparture || words.length === 0) {
    const routines = await Routine.find({ userId }).sort({ updatedAt: -1 }).limit(5).lean();
    context.routines = routines;
    routines.forEach((rt) => {
      context.sources.push({
        type: 'routine',
        id: (rt as any)._id.toString(),
        title: `Routine: ${rt.name}`,
        detail: `Items: ${rt.items.join(', ')}`,
      });
    });
  }

  // 4. Search Memories (Keyword match or recent)
  const memoryConditions: any[] = [{ userId }];
  if (words.length > 0) {
    const regexes = words.map((w) => new RegExp(w, 'i'));
    memoryConditions.push({
      $or: [
        { title: { $in: regexes } },
        { description: { $in: regexes } },
        { tags: { $in: regexes } },
        { personName: { $in: regexes } },
      ],
    });
  }

  const memories = await Memory.find({ $and: memoryConditions })
    .sort({ updatedAt: -1 })
    .limit(8)
    .lean();

  // If specific word search yielded few memories and question wasn't only about items/reminders, grab recent memories
  if (memories.length === 0 && !isAboutLending && !isAboutReminders && !isAboutDeparture) {
    const recents = await Memory.find({ userId }).sort({ updatedAt: -1 }).limit(5).lean();
    context.memories = recents;
    recents.forEach((m) => {
      context.sources.push({
        type: 'memory',
        id: (m as any)._id.toString(),
        title: m.title,
        detail: m.description.slice(0, 80),
      });
    });
  } else {
    context.memories = memories;
    memories.forEach((m) => {
      context.sources.push({
        type: 'memory',
        id: (m as any)._id.toString(),
        title: m.title,
        detail: m.description.slice(0, 80),
      });
    });
  }

  // 5. If question is about people or person name mentioned
  const people = await Person.find({ userId }).limit(10).lean();
  context.people = people;

  return context;
}

