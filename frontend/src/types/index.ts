export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  preferences?: {
    theme?: 'light' | 'system';
    reminderTime?: string;
    enableTips?: boolean;
  };
}

export type MemoryCategory =
  | 'Personal'
  | 'Important dates'
  | 'Notes'
  | 'Experiences'
  | 'Places'
  | 'Preferences'
  | 'Other';

export interface Memory {
  _id: string;
  title: string;
  description: string;
  category: MemoryCategory | string;
  tags: string[];
  personId?: string;
  personName?: string;
  relatedItem?: string;
  createdAt: string;
  updatedAt: string;
}

export type ItemDirection = 'borrowed' | 'lent';
export type ItemStatus = 'active' | 'returned' | 'overdue';

export interface Item {
  _id: string;
  itemName: string;
  description?: string;
  personId?: string;
  personName: string;
  direction: ItemDirection;
  date: string;
  expectedReturnDate?: string;
  status: ItemStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  _id: string;
  name: string;
  contact?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  linkedItemsCount?: number;
  linkedMemoriesCount?: number;
  linkedRemindersCount?: number;
}

export type ReminderPriority = 'low' | 'medium' | 'high';
export type ReminderStatus = 'pending' | 'completed' | 'overdue';

export interface Reminder {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  priority: ReminderPriority;
  status: ReminderStatus;
  personId?: string;
  personName?: string;
  relatedItem?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CarryItem {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  checked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Routine {
  _id: string;
  name: string;
  activity: string;
  destination?: string;
  items: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSource {
  type: 'memory' | 'item' | 'reminder' | 'person' | 'routine';
  id?: string;
  title: string;
  detail?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: ChatSource[];
  timestamp: string;
}

export interface InsightsData {
  totalMemories: number;
  activeBorrowed: number;
  activeLent: number;
  overdueItems: number;
  upcomingRemindersCount: number;
  completedRemindersCount: number;
  categoryDistribution: { category: string; count: number }[];
  lendingSummary: { personName: string; count: number; items: string[] }[];
  recentActivity: {
    type: 'memory' | 'item' | 'reminder' | 'carry';
    title: string;
    detail: string;
    timestamp: string;
  }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface NaturalLanguageExtraction {
  type: 'item' | 'reminder' | 'memory';
  confidence: number;
  rawText: string;
  itemData?: {
    itemName: string;
    direction: ItemDirection;
    personName: string;
    date?: string;
    expectedReturnDate?: string;
    notes?: string;
  };
  reminderData?: {
    title: string;
    date: string;
    time?: string;
    priority?: ReminderPriority;
    description?: string;
  };
  memoryData?: {
    title: string;
    description: string;
    category?: string;
    tags?: string[];
  };
}

export interface BriefingHighlight {
  type: 'reminder' | 'overdue' | 'routine' | 'lent';
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  priority: 'normal' | 'high';
}

export interface DailyBriefing {
  greeting: string;
  userName: string;
  summary: string;
  stats: {
    todayReminders: number;
    overdueItems: number;
    activeLent: number;
    activeBorrowed: number;
    routinesCount: number;
  };
  highlights: BriefingHighlight[];
  aiRecommendation: string;
}

export interface ContradictionCheckResult {
  hasConflict: boolean;
  conflictType?: string;
  similarityScore?: number;
  reason?: string;
  existingRecord?: {
    id: string;
    title: string;
    description: string;
    category?: string;
    date?: string;
  } | null;
  suggestion?: string;
}


