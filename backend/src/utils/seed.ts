import mongoose from 'mongoose';
import { config } from '../config/env.ts';
import { connectDB } from '../config/db.ts';
import { User } from '../models/User.ts';
import { Memory } from '../models/Memory.ts';
import { Person } from '../models/Person.ts';
import { Item } from '../models/Item.ts';
import { Reminder } from '../models/Reminder.ts';
import { CarryListItem } from '../models/CarryListItem.ts';
import { Routine } from '../models/Routine.ts';
import { ChatMessage } from '../models/ChatMessage.ts';
import { hashPassword } from './password.ts';

export async function seedDemoData(force = false) {
  const demoEmail = 'demo@recall.ai';
  let user = await User.findOne({ email: demoEmail });

  if (user && !force) {
    return;
  }

  console.log('[Seed] Initializing demo account for showcase...');

  if (user) {
    console.log('[Seed] Refreshing existing demo data for clean demonstration...');
    user.name = 'Beulah';
    await user.save();
    const userId = user._id;
    await Promise.all([
      Memory.deleteMany({ userId }),
      Person.deleteMany({ userId }),
      Item.deleteMany({ userId }),
      Reminder.deleteMany({ userId }),
      CarryListItem.deleteMany({ userId }),
      Routine.deleteMany({ userId }),
      ChatMessage.deleteMany({ userId }),
    ]);
  } else {
    console.log('[Seed] Creating demo user...');
    user = await User.create({
      name: 'Beulah',
      email: demoEmail,
      passwordHash: hashPassword('RecallDemo2026!'),
      preferences: {
        theme: 'light',
        reminderTime: '08:30',
        enableTips: true,
      },
    });
  }

  const userId = user._id;

  // 1. People
  console.log('[Seed] Creating contacts...');
  const [marcus, sophia, david] = await Promise.all([
    Person.create({
      userId,
      name: 'Marcus Vance',
      contact: '+1 555-0142 • marcus@vance.io',
      notes: 'Colleague on the engineering architecture team',
    }),
    Person.create({
      userId,
      name: 'Sophia Chen',
      contact: 'sophia.chen@designlab.org',
      notes: 'Close friend from university & hiking buddy',
    }),
    Person.create({
      userId,
      name: 'David Miller',
      contact: '+1 555-8831',
      notes: 'Apartment building manager / neighbor',
    }),
  ]);

  // 2. Memories
  console.log('[Seed] Creating memories...');
  await Promise.all([
    Memory.create({
      userId,
      title: 'Home WiFi & Router Credentials',
      description: 'Network SSID: AuroraSky-5G\nPassword: SkyHigh2026!\nRouter Admin: 192.168.1.1 (admin / AuroraKey#2)',
      category: 'Personal',
      tags: ['wifi', 'home', 'passwords', 'internet'],
    }),
    Memory.create({
      userId,
      title: 'International Passport & Visa Details',
      description: 'Passport Number: US-984412088\nExpiration Date: October 14, 2031\nSchengen Visa expires December 2026.',
      category: 'Important dates',
      tags: ['travel', 'passport', 'id', 'documents'],
    }),
    Memory.create({
      userId,
      title: 'Apartment Bike Locker Combination',
      description: 'Basement locker #42 code: 7 - 3 - 9 - 1. Turn clockwise twice past zero before input.',
      category: 'Personal',
      tags: ['bike', 'storage', 'codes'],
    }),
    Memory.create({
      userId,
      title: 'Favourite Cafe Order in Kyoto',
      description: 'Weekenders Coffee: Hand-drip Ethiopian Guji medium roast with oat milk and honey roll cake.',
      category: 'Preferences',
      tags: ['coffee', 'travel', 'japan'],
    }),
    Memory.create({
      userId,
      title: 'Project Architecture Server IP',
      description: 'Staging cluster bastion host: 10.142.8.204 (access via SSH key id_ed25519_recall).',
      category: 'Notes',
      tags: ['work', 'servers', 'dev'],
      personId: marcus._id,
      personName: marcus.name,
    }),
  ]);

  // 3. Borrowed and Lent Items
  console.log('[Seed] Creating borrowed and lent items...');
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  await Promise.all([
    Item.create({
      userId,
      itemName: 'Sony WH-1000XM5 Headphones',
      direction: 'lent',
      personName: 'Marcus Vance',
      personId: marcus._id,
      date: new Date(now - 14 * day),
      expectedReturnDate: new Date(now - 2 * day), // Overdue
      status: 'overdue',
      notes: 'Lent for his red-eye conference flight to Berlin.',
    }),
    Item.create({
      userId,
      itemName: 'Camping 4-Person Waterproof Tent',
      direction: 'lent',
      personName: 'Sophia Chen',
      personId: sophia._id,
      date: new Date(now - 5 * day),
      expectedReturnDate: new Date(now + 7 * day),
      status: 'active',
      notes: 'Remember to check ground stakes and rainfly upon return.',
    }),
    Item.create({
      userId,
      itemName: 'Bosch Cordless Power Drill Set',
      direction: 'borrowed',
      personName: 'David Miller',
      personId: david._id,
      date: new Date(now - 3 * day),
      expectedReturnDate: new Date(now + 2 * day),
      status: 'active',
      notes: 'Borrowed to mount shelving units in study.',
    }),
    Item.create({
      userId,
      itemName: 'Calculus & Linear Algebra Textbook',
      direction: 'borrowed',
      personName: 'Sophia Chen',
      personId: sophia._id,
      date: new Date(now - 30 * day),
      expectedReturnDate: new Date(now - 10 * day),
      status: 'returned',
      notes: 'Returned with thanks after semester finals.',
    }),
  ]);

  // 4. Reminders
  console.log('[Seed] Creating reminders...');
  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeekStr = new Date(now + 7 * day).toISOString().split('T')[0];

  await Promise.all([
    Reminder.create({
      userId,
      title: 'Pick up dry cleaning before 6 PM',
      description: 'Ticket #4092 at 4th Street Cleaners',
      date: todayStr,
      time: '17:30',
      priority: 'high',
      status: 'pending',
    }),
    Reminder.create({
      userId,
      title: 'Follow up with Marcus regarding headphones',
      description: 'Check if conference wrapped up smoothly',
      date: todayStr,
      time: '14:00',
      priority: 'medium',
      status: 'pending',
      personId: marcus._id,
      personName: marcus.name,
      relatedItem: 'Sony WH-1000XM5 Headphones',
    }),
    Reminder.create({
      userId,
      title: 'Quarterly Cloud Billing Review',
      description: 'Audit production AWS and GCP reservation quotas',
      date: nextWeekStr,
      time: '10:00',
      priority: 'low',
      status: 'pending',
    }),
  ]);

  // 5. Carry List
  console.log('[Seed] Creating carry list...');
  await Promise.all([
    CarryListItem.create({
      userId,
      name: 'Apartment & Mailbox Keys',
      category: 'Everyday Essentials',
      checked: true,
    }),
    CarryListItem.create({
      userId,
      name: 'Metro Transit Card',
      category: 'Everyday Essentials',
      checked: true,
    }),
    CarryListItem.create({
      userId,
      name: 'MacBook Pro & 96W Charger',
      category: 'Tech & Work',
      checked: false,
    }),
    CarryListItem.create({
      userId,
      name: 'Noise Cancelling Earbuds',
      category: 'Tech & Work',
      checked: false,
    }),
    CarryListItem.create({
      userId,
      name: 'Gym RFID Band & Locker Padlock',
      category: 'Fitness & Gym',
      checked: false,
    }),
  ]);

  // 6. Departure Routines
  console.log('[Seed] Creating departure routines...');
  await Promise.all([
    Routine.create({
      userId,
      name: 'Daily Office Commute',
      activity: 'Work',
      destination: 'Downtown Engineering Studio',
      items: [
        'Security Access Badge',
        'MacBook Pro & 96W Charger',
        'House Keys',
        'Transit Pass',
        'Hydration Flask',
        'Sunglasses',
      ],
      notes: 'Double check balcony sliding door is locked.',
    }),
    Routine.create({
      userId,
      name: 'Gym & Crossfit Session',
      activity: 'Fitness',
      destination: 'Equinox 5th Ave',
      items: [
        'Training Sneakers',
        'Locker Padlock',
        'Water Bottle',
        'Microfiber Towel',
        'Post-workout Whey Protein Bar',
        'AirPods Pro',
      ],
      notes: 'Don’t forget heart rate monitor strap.',
    }),
    Routine.create({
      userId,
      name: 'Airport / International Flight',
      activity: 'Travel',
      destination: 'Terminal 4 Gate B',
      items: [
        'Valid Passport & Boarding Pass',
        'Universal Travel Adapter',
        'Power Bank (20,000 mAh)',
        'Prescription Eye Drops',
        'Noise Isolating Headphones',
        'Cash & Travel Credit Card',
      ],
      notes: 'Ensure 3-1-1 liquids bag is packed at top of carry-on.',
    }),
  ]);

  // 7. Chat Message History
  console.log('[Seed] Creating starter AI chat history...');
  await ChatMessage.create({
    userId,
    sender: 'user',
    text: 'What items have I lent to people right now?',
  });
  await ChatMessage.create({
    userId,
    sender: 'assistant',
    text: 'Here are the items you currently have lent out:\n\n• **Sony WH-1000XM5 Headphones** with **Marcus Vance** (expected return was 2 days ago — marked as **overdue**)\n• **Camping 4-Person Waterproof Tent** with **Sophia Chen** (due in 7 days)',
    sources: [
      {
        type: 'item',
        title: 'Sony WH-1000XM5 Headphones',
        detail: 'Lent to Marcus Vance',
      },
      {
        type: 'item',
        title: 'Camping 4-Person Waterproof Tent',
        detail: 'Lent to Sophia Chen',
      },
    ],
  });

  console.log('\n===============================================');
  console.log('🎉 Recall AI Demo Database Seeded Successfully!');
  console.log('📧 Demo Login: demo@recall.ai');
  console.log('🔑 Password:   RecallDemo2026!');
  console.log('===============================================\n');
}

// Allow standalone CLI execution: node --experimental-strip-types src/utils/seed.ts
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('seed.ts')) {
  connectDB()
    .then(() => seedDemoData(true))
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error] Failed to seed database:', err);
      process.exit(1);
    });
}

