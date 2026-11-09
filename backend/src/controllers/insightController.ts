import type { Response } from 'express';
import mongoose from 'mongoose';
import { Memory } from '../models/Memory.ts';
import { Item } from '../models/Item.ts';
import { Reminder } from '../models/Reminder.ts';
import { CarryListItem } from '../models/CarryListItem.ts';
import type { AuthenticatedRequest } from '../types/index.ts';

export async function getInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const now = new Date();

  const [
    totalMemories,
    activeBorrowed,
    activeLent,
    overdueItems,
    upcomingRemindersCount,
    completedRemindersCount,
    categoryAggr,
    lendingAggr,
    recentMemories,
    recentItems,
    recentReminders,
  ] = await Promise.all([
    Memory.countDocuments({ userId }),
    Item.countDocuments({ userId, direction: 'borrowed', status: { $ne: 'returned' } }),
    Item.countDocuments({ userId, direction: 'lent', status: { $ne: 'returned' } }),
    Item.countDocuments({
      userId,
      status: { $ne: 'returned' },
      expectedReturnDate: { $lt: now },
    }),
    Reminder.countDocuments({ userId, status: { $ne: 'completed' } }),
    Reminder.countDocuments({ userId, status: 'completed' }),
    Memory.aggregate([
      { $match: { userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    Item.aggregate([
      { $match: { userId, direction: 'lent', status: { $ne: 'returned' } } },
      {
        $group: {
          _id: '$personName',
          count: { $sum: 1 },
          items: { $push: '$itemName' },
        },
      },
      { $sort: { count: -1 } },
    ]),
    Memory.find({ userId }).sort({ createdAt: -1 }).limit(3).lean(),
    Item.find({ userId }).sort({ createdAt: -1 }).limit(3).lean(),
    Reminder.find({ userId }).sort({ createdAt: -1 }).limit(3).lean(),
  ]);

  const categoryDistribution = categoryAggr.map((c) => ({
    category: c._id || 'Uncategorized',
    count: c.count,
  }));

  const lendingSummary = lendingAggr.map((l) => ({
    personName: l._id || 'Unknown',
    count: l.count,
    items: l.items || [],
  }));

  // Combine and sort recent activity
  const combinedActivities: any[] = [];
  recentMemories.forEach((m) => {
    combinedActivities.push({
      type: 'memory',
      title: `Memory: ${m.title}`,
      detail: m.category,
      timestamp: (m as any).createdAt,
    });
  });

  recentItems.forEach((it) => {
    combinedActivities.push({
      type: 'item',
      title: `${it.direction === 'lent' ? 'Lent' : 'Borrowed'}: ${it.itemName}`,
      detail: `With ${it.personName}`,
      timestamp: (it as any).createdAt,
    });
  });

  recentReminders.forEach((r) => {
    combinedActivities.push({
      type: 'reminder',
      title: `Reminder: ${r.title}`,
      detail: `Date: ${r.date}`,
      timestamp: (r as any).createdAt,
    });
  });

  combinedActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({
    success: true,
    totalMemories,
    activeBorrowed,
    activeLent,
    overdueItems,
    upcomingRemindersCount,
    completedRemindersCount,
    categoryDistribution,
    lendingSummary,
    recentActivity: combinedActivities.slice(0, 8),
  });
}
