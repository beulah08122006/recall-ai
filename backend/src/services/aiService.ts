import { config } from '../config/env.ts';
import { retrieveUserContext } from './retrievalService.ts';
import type { RetrievedContext } from './retrievalService.ts';
import { Memory } from '../models/Memory.ts';
import { Item } from '../models/Item.ts';
import { Reminder } from '../models/Reminder.ts';
import { Routine } from '../models/Routine.ts';
import { User } from '../models/User.ts';

export interface AssistantAnswer {
  reply: string;
  sources: { type: string; id: string; title: string; detail?: string }[];
}

export interface ExtractedEntity {
  type: 'item' | 'reminder' | 'memory';
  confidence: number;
  rawText: string;
  itemData?: {
    itemName: string;
    direction: 'lent' | 'borrowed';
    personName: string;
    date: string;
    expectedReturnDate?: string;
    notes?: string;
  };
  reminderData?: {
    title: string;
    date: string;
    time?: string;
    priority: 'low' | 'medium' | 'high';
    description?: string;
    personName?: string;
  };
  memoryData?: {
    title: string;
    description: string;
    category: string;
    tags: string[];
    personName?: string;
    relatedItem?: string;
  };
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
  highlights: {
    type: 'reminder' | 'overdue' | 'routine' | 'memory';
    title: string;
    description: string;
    actionLabel?: string;
    actionUrl?: string;
    priority?: 'high' | 'medium' | 'normal';
  }[];
  aiRecommendation: string;
}

export interface ContradictionResult {
  hasConflict: boolean;
  conflictType?: 'date_change' | 'value_update' | 'duplicate_record';
  similarityScore: number;
  existingRecord?: {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
  };
  suggestion: string;
}

function parseRelativeDate(text: string): { dateStr: string; timeStr?: string } {
  const now = new Date();
  const lower = text.toLowerCase();
  const target = new Date();

  if (lower.includes('yesterday')) {
    target.setDate(now.getDate() - 1);
  } else if (lower.includes('tomorrow')) {
    target.setDate(now.getDate() + 1);
  } else {
    // Check "in X days"
    const inDaysMatch = lower.match(/in\s+(\d+|one|two|three|four|five|six|seven)\s+days?/);
    if (inDaysMatch) {
      const wordMap: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7 };
      const num = parseInt(inDaysMatch[1], 10) || wordMap[inDaysMatch[1]] || 1;
      target.setDate(now.getDate() + num);
    } else {
      // Check day of week (e.g. "next monday", "friday")
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (let i = 0; i < days.length; i++) {
        if (lower.includes(days[i])) {
          const currentDay = now.getDay();
          let diff = (i - currentDay + 7) % 7;
          if (diff === 0) diff = 7;
          if (lower.includes('next ' + days[i])) diff += 7;
          target.setDate(now.getDate() + diff);
          break;
        }
      }
    }
  }

  let timeStr: string | undefined;
  const timeMatch = lower.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i) || lower.match(/at\s+(\d{1,2})(?::(\d{2}))?/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3]?.toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  return {
    dateStr: target.toISOString().split('T')[0],
    timeStr,
  };
}

/**
 * Universal Natural Language Entry Extraction Engine
 */
export async function extractEntitiesFromNaturalLanguage(
  input: string,
  userPeopleNames: string[] = []
): Promise<ExtractedEntity> {
  const trimmed = input.trim();

  // Try Gemini AI if configured
  if (config.geminiApiKey && config.geminiApiKey.trim() !== '') {
    try {
      const prompt = `You are a personal productivity entity parser.
Given the user input: "${trimmed}"
Known contacts: ${JSON.stringify(userPeopleNames)}
Today's date is: ${new Date().toISOString().split('T')[0]}

Determine if the input is:
1. "item": Lending or borrowing a physical item (contains words like lent, borrowed, gave to, took from).
2. "reminder": A task, bill, deadline, or appointment scheduled for a date/time.
3. "memory": A fact, password, note, credential, code, or personal experience to remember.

Return strictly valid JSON with this exact schema:
{
  "type": "item" | "reminder" | "memory",
  "confidence": number between 0.8 and 1.0,
  "itemData": {
    "itemName": string,
    "direction": "lent" | "borrowed",
    "personName": string,
    "date": "YYYY-MM-DD",
    "expectedReturnDate": "YYYY-MM-DD" or null,
    "notes": string
  } or null,
  "reminderData": {
    "title": string,
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "priority": "low" | "medium" | "high",
    "description": string,
    "personName": string
  } or null,
  "memoryData": {
    "title": string,
    "description": string,
    "category": "Personal" | "Important dates" | "Notes" | "Experiences" | "Places" | "Preferences" | "Other",
    "tags": string[],
    "personName": string
  } or null
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const jsonStr = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          return {
            type: parsed.type,
            confidence: parsed.confidence || 0.95,
            rawText: trimmed,
            itemData: parsed.itemData || undefined,
            reminderData: parsed.reminderData || undefined,
            memoryData: parsed.memoryData || undefined,
          };
        }
      }
    } catch (err) {
      console.warn('[AI Service] Gemini extraction failed, falling back to local NLP parser:', err);
    }
  }

  // High-fidelity local deterministic NLP parser
  const lower = trimmed.toLowerCase();
  const today = new Date().toISOString().split('T')[0];

  // 1. Detect Item Lending / Borrowing
  const isLent = /\b(lent|lend|gave|giving|loaned)\b/i.test(lower);
  const isBorrowed = /\b(borrowed|borrow|got|taking|took)\b/i.test(lower);

  if (isLent || isBorrowed) {
    const direction = isBorrowed ? 'borrowed' : 'lent';
    
    // Extract Person: "to [Name]" or "from [Name]" or match known contacts
    let personName = 'Friend';
    const toFromMatch = trimmed.match(/(?:to|from|with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    if (toFromMatch) {
      personName = toFromMatch[1];
    } else {
      const knownMatch = userPeopleNames.find((p) => lower.includes(p.toLowerCase()));
      if (knownMatch) personName = knownMatch;
    }

    // Extract item name
    let itemName = 'Item';
    const itemMatch = trimmed.match(/(?:lent|lend|gave|borrowed|borrow|loaned)\s+(?:my\s+|the\s+|a\s+|an\s+)?([a-zA-Z0-9\s\-]+?)(?=\s+(?:to|from|until|before|yesterday|tomorrow|on|next|$))/i);
    if (itemMatch && itemMatch[1].trim()) {
      itemName = itemMatch[1].trim();
    } else {
      // Fallback: look after "my"
      const myMatch = trimmed.match(/my\s+([a-zA-Z0-9\s\-]+?)(?=\s+(?:to|from|until|$))/i);
      if (myMatch) itemName = myMatch[1].trim();
    }

    // Capitalize item name
    itemName = itemName.charAt(0).toUpperCase() + itemName.slice(1);

    // Extract Dates
    const parsedDates = parseRelativeDate(trimmed);
    const returnMatch = trimmed.match(/(?:until|return|due|back|by)\s+([a-zA-Z0-9\s]+?)(?=[.,]|$)/i);
    const expectedReturnDate = returnMatch ? parseRelativeDate(returnMatch[1]).dateStr : undefined;

    return {
      type: 'item',
      confidence: 0.92,
      rawText: trimmed,
      itemData: {
        itemName,
        direction,
        personName,
        date: parsedDates.dateStr || today,
        expectedReturnDate: expectedReturnDate || undefined,
        notes: trimmed,
      },
    };
  }

  // 2. Detect Reminders / Appointments
  const isReminder = /\b(remind|reminder|appointment|meeting|call|pay|due|submit|flight|interview|doctor|dentist)\b/i.test(lower);
  if (isReminder) {
    const dates = parseRelativeDate(trimmed);
    let title = trimmed.replace(/^(remind me to|reminder to|remember to|remind me)\s+/i, '');
    title = title.charAt(0).toUpperCase() + title.slice(1);

    // Priority
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (/\b(urgent|important|asap|critical|doctor|flight|interview)\b/i.test(lower)) {
      priority = 'high';
    }

    return {
      type: 'reminder',
      confidence: 0.9,
      rawText: trimmed,
      reminderData: {
        title,
        date: dates.dateStr,
        time: dates.timeStr || '09:00',
        priority,
        description: trimmed,
      },
    };
  }

  // 3. Fallback: Treat as a structured Knowledge Memory
  const tags: string[] = [];
  if (/\b(wifi|password|pin|code|credential)\b/i.test(lower)) tags.push('passwords', 'tech');
  if (/\b(passport|visa|id|license|document)\b/i.test(lower)) tags.push('documents', 'id');
  if (/\b(travel|flight|trip|hotel|airport)\b/i.test(lower)) tags.push('travel');
  if (/\b(work|office|project|client|server)\b/i.test(lower)) tags.push('work');
  if (/\b(home|apartment|address|locker|bike)\b/i.test(lower)) tags.push('home');

  let category = 'Personal';
  if (tags.includes('travel')) category = 'Places';
  else if (tags.includes('work')) category = 'Notes';
  else if (/\b(favorite|favourite|like|order|preference)\b/i.test(lower)) category = 'Preferences';
  else if (/\b(birthday|anniversary|date|expire)\b/i.test(lower)) category = 'Important dates';

  let title = trimmed.slice(0, 50);
  if (trimmed.length > 50) title = title.slice(0, title.lastIndexOf(' ')) + '...';
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return {
    type: 'memory',
    confidence: 0.88,
    rawText: trimmed,
    memoryData: {
      title,
      description: trimmed,
      category,
      tags: tags.length > 0 ? tags : ['personal'],
    },
  };
}

/**
 * Contradiction and Duplicate Detection Engine
 */
export async function checkMemoryContradictions(
  userId: string,
  newMemory: { title: string; description: string; category?: string }
): Promise<ContradictionResult> {
  const existingMemories = await Memory.find({ userId }).select('title description category createdAt');

  const newWords = new Set(
    `${newMemory.title} ${newMemory.description}`
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3)
  );

  let bestMatch: any = null;
  let maxScore = 0;
  let conflictType: 'duplicate_record' | 'value_update' = 'value_update';

  const newTitleWords = new Set(
    newMemory.title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );

  for (const mem of existingMemories) {
    const memWords = new Set(
      `${mem.title} ${mem.description}`
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );

    // Calculate Jaccard similarity intersection over union for full text
    let common = 0;
    for (const w of newWords) {
      if (memWords.has(w)) common++;
    }
    const union = new Set([...newWords, ...memWords]).size;
    const fullScore = union > 0 ? common / union : 0;

    // Calculate title overlap specifically
    const memTitleWords = new Set(
      mem.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );
    let titleCommon = 0;
    for (const tw of newTitleWords) {
      if (memTitleWords.has(tw)) titleCommon++;
    }
    const titleUnion = new Set([...newTitleWords, ...memTitleWords]).size;
    const titleScore = titleUnion > 0 ? titleCommon / titleUnion : 0;

    // Weighted composite score (title match carries strong weight)
    const compositeScore = Math.max(fullScore, titleScore * 0.85);

    if (compositeScore > maxScore) {
      maxScore = compositeScore;
      bestMatch = mem;
      if (titleScore >= 0.8 && fullScore >= 0.75) {
        conflictType = 'duplicate_record';
      } else {
        conflictType = 'value_update';
      }
    }
  }

  // If overlap is significant (title match >= 40% or composite >= 28%)
  if (bestMatch && maxScore >= 0.28) {
    const isExactDuplicate = conflictType === 'duplicate_record';
    return {
      hasConflict: true,
      conflictType,
      similarityScore: Math.round(maxScore * 100),
      existingRecord: {
        id: (bestMatch as any)._id.toString(),
        title: bestMatch.title,
        description: bestMatch.description,
        category: bestMatch.category,
        date: bestMatch.createdAt?.toISOString().split('T')[0] || '',
      },
      suggestion: isExactDuplicate
        ? `You already have an identical memory saved titled "${bestMatch.title}".`
        : `This appears to update or conflict with your existing memory "${bestMatch.title}". Would you like to update the existing record?`,
    };
  }

  return {
    hasConflict: false,
    similarityScore: Math.round(maxScore * 100),
    suggestion: 'No conflicts detected with existing memories.',
  };
}

/**
 * Daily Personal Briefing Synthesis
 */
export async function generateDailyBriefing(userId: string): Promise<DailyBriefing> {
  const user = await User.findById(userId).select('name');
  const userName = user?.name || 'Friend';

  const todayStr = new Date().toISOString().split('T')[0];

  const [reminders, items, routines] = await Promise.all([
    Reminder.find({ userId, status: 'pending' }),
    Item.find({ userId }),
    Routine.find({ userId }),
  ]);

  const todayReminders = reminders.filter((r) => r.date && r.date.split('T')[0] === todayStr);
  const overdueItems = items.filter((i) => i.status === 'overdue' || (i.status !== 'returned' && i.expectedReturnDate && i.expectedReturnDate.toISOString().split('T')[0] < todayStr));
  const activeLent = items.filter((i) => i.direction === 'lent' && i.status !== 'returned');
  const activeBorrowed = items.filter((i) => i.direction === 'borrowed' && i.status !== 'returned');

  const highlights: DailyBriefing['highlights'] = [];

  if (todayReminders.length > 0) {
    highlights.push({
      type: 'reminder',
      title: `${todayReminders.length} reminder${todayReminders.length > 1 ? 's' : ''} scheduled for today`,
      description: todayReminders.map((r) => `${r.title}${r.time ? ` at ${r.time}` : ''}`).join(' • '),
      actionLabel: 'View Reminders',
      actionUrl: '/reminders',
      priority: 'high',
    });
  }

  if (overdueItems.length > 0) {
    const firstOverdue = overdueItems[0];
    highlights.push({
      type: 'overdue',
      title: `${overdueItems.length} item${overdueItems.length > 1 ? 's' : ''} require attention`,
      description: `${firstOverdue.itemName} (${firstOverdue.direction === 'lent' ? `lent to ${firstOverdue.personName}` : `borrowed from ${firstOverdue.personName}`}) is past due date.`,
      actionLabel: 'Check Items',
      actionUrl: '/borrowed',
      priority: 'high',
    });
  }

  if (routines.length > 0) {
    const firstRoutine = routines[0];
    highlights.push({
      type: 'routine',
      title: `Departure Routine: ${firstRoutine.name}`,
      description: `${firstRoutine.items.length} essentials to verify before leaving.`,
      actionLabel: 'Open Checklist',
      actionUrl: '/before-you-leave',
      priority: 'normal',
    });
  }

  // Synthesize contextual AI recommendation
  let aiRecommendation = 'Everything is in order today. Keep tracking your memories and stay productive!';
  if (overdueItems.length > 0) {
    const it = overdueItems[0];
    aiRecommendation = it.direction === 'lent'
      ? `AI Suggestion: Send a polite check-in message to ${it.personName} about your ${it.itemName}.`
      : `AI Suggestion: Remember to return the ${it.itemName} to ${it.personName} soon.`;
  } else if (todayReminders.length > 0) {
    aiRecommendation = `AI Suggestion: You have ${todayReminders.length} reminder(s) today. Check your carry list before leaving for your tasks.`;
  }

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return {
    greeting: `${timeGreeting}, ${userName}`,
    userName,
    summary: `You have ${todayReminders.length} task(s) today, ${overdueItems.length} overdue item(s), and ${activeLent.length + activeBorrowed.length} active items in circulation.`,
    stats: {
      todayReminders: todayReminders.length,
      overdueItems: overdueItems.length,
      activeLent: activeLent.length,
      activeBorrowed: activeBorrowed.length,
      routinesCount: routines.length,
    },
    highlights,
    aiRecommendation,
  };
}

function synthesizeFallbackAnswer(query: string, ctx: RetrievedContext): string {
  const q = query.toLowerCase();

  // 1. Overdue query
  if (q.includes('overdue')) {
    const overdueItems = ctx.items.filter((i) => i.status === 'overdue');
    if (overdueItems.length === 0) {
      return "Good news! You don't have any overdue items in your tracking list right now.";
    }
    const lines = overdueItems.map(
      (it) => `• **${it.itemName}** — ${it.direction === 'lent' ? 'Lent to' : 'Borrowed from'} ${it.personName}${it.expectedReturnDate ? ` (was due ${new Date(it.expectedReturnDate).toLocaleDateString()})` : ''}`
    );
    return `You have **${overdueItems.length} overdue item(s)** that need attention:\n\n${lines.join('\n')}`;
  }

  // 2. Lent items query
  if (q.includes('lent') || (q.includes('lend') && !q.includes('borrow'))) {
    const lentItems = ctx.items.filter((i) => i.direction === 'lent' && i.status !== 'returned');
    if (lentItems.length === 0) {
      return "According to your records, you haven't lent out any active items at the moment.";
    }
    const lines = lentItems.map(
      (it) => `• **${it.itemName}** with **${it.personName}**${it.expectedReturnDate ? ` (expected return: ${new Date(it.expectedReturnDate).toLocaleDateString()})` : ''}`
    );
    return `Here are the items you currently have lent out:\n\n${lines.join('\n')}`;
  }

  // 3. Borrowed items query
  if (q.includes('borrow')) {
    const borrowed = ctx.items.filter((i) => i.direction === 'borrowed' && i.status !== 'returned');
    if (borrowed.length === 0) {
      return "You haven't recorded borrowing any items from others currently.";
    }
    const lines = borrowed.map(
      (it) => `• **${it.itemName}** borrowed from **${it.personName}**${it.expectedReturnDate ? ` (due: ${new Date(it.expectedReturnDate).toLocaleDateString()})` : ''}`
    );
    return `Here are the items you have borrowed:\n\n${lines.join('\n')}`;
  }

  // 4. Reminders / Tasks query
  if (q.includes('remind') || q.includes('tomorrow') || q.includes('upcoming') || q.includes('task')) {
    if (ctx.reminders.length === 0) {
      return "You have no upcoming or pending reminders scheduled.";
    }
    const lines = ctx.reminders.map(
      (r) => `• **${r.title}** on **${r.date}**${r.time ? ` at ${r.time}` : ''} [Priority: ${r.priority}]`
    );
    return `Here are your upcoming reminders:\n\n${lines.join('\n')}`;
  }

  // 5. Departure / Packing query
  if (q.includes('pack') || q.includes('leave') || q.includes('bring') || q.includes('routine') || q.includes('college') || q.includes('office') || q.includes('trip')) {
    if (ctx.routines.length > 0) {
      const rt = ctx.routines[0];
      return `For **${rt.name}** (${rt.activity || 'departure'}), make sure you have:\n\n${rt.items.map((i: string) => `• [ ] ${i}`).join('\n')}${rt.notes ? `\n\n*Note: ${rt.notes}*` : ''}`;
    }
  }

  // 6. Direct memory matches
  if (ctx.memories.length > 0) {
    const topMatches = ctx.memories.slice(0, 3);
    const lines = topMatches.map((m) => `### ${m.title}\n${m.description}\n*Category: ${m.category}*`);
    return `Here is what I found in your saved memories:\n\n${lines.join('\n\n')}`;
  }

  // Default fallback when nothing matches
  return `I searched your personal memory records, items, and reminders, but couldn't find specific information matching "${query}".\n\nYou can add this information as a new Memory or Item in Recall AI so I can remember it for you next time!`;
}

export async function askAssistant(userId: string, query: string): Promise<AssistantAnswer> {
  const context = await retrieveUserContext(userId, query);

  // If Gemini API Key is configured, use Gemini
  if (config.geminiApiKey && config.geminiApiKey.trim() !== '') {
    try {
      const prompt = `You are Recall AI's intelligent personal memory assistant.
Answer the user's question accurately using ONLY the retrieved records below.
Rules:
- Be warm, concise, and helpful.
- If information is not in the records, state clearly that it is not recorded in their Recall AI database.
- Do NOT fabricate facts, return dates, or items.
- Format with clean Markdown (bullet points, bold text).

---
USER RECORDS CONTEXT:
Memories: ${JSON.stringify(context.memories)}
Items (Borrowed/Lent): ${JSON.stringify(context.items)}
Reminders: ${JSON.stringify(context.reminders)}
Departure Routines: ${JSON.stringify(context.routines)}
People: ${JSON.stringify(context.people)}
---

USER QUESTION: "${query}"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 600,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return {
            reply: text.trim(),
            sources: context.sources,
          };
        }
      } else {
        console.warn(`[AI Service] Gemini API returned status ${response.status}`);
      }
    } catch (apiError) {
      console.warn('[AI Service] Gemini API call failed, falling back to local retrieval synthesis:', apiError);
    }
  }

  // High-fidelity local retrieval synthesis using real database records
  const reply = synthesizeFallbackAnswer(query, context);

  return {
    reply,
    sources: context.sources,
  };
}
