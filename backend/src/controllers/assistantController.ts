import type { Response } from 'express';
import mongoose from 'mongoose';
import {
  askAssistant,
  extractEntitiesFromNaturalLanguage,
  generateDailyBriefing,
  checkMemoryContradictions,
} from '../services/aiService.ts';
import { ChatMessage } from '../models/ChatMessage.ts';
import { Person } from '../models/Person.ts';
import type { AuthenticatedRequest } from '../types/index.ts';

export async function ask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { message } = req.body;

  // Save user message
  await ChatMessage.create({
    userId,
    sender: 'user',
    text: message,
  });

  // Query AI / retrieval
  const answer = await askAssistant(userId, message);

  // Save bot response
  await ChatMessage.create({
    userId,
    sender: 'assistant',
    text: answer.reply,
    sources: answer.sources,
  });

  res.json({
    success: true,
    reply: answer.reply,
    sources: answer.sources,
  });
}

export async function getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = new mongoose.Types.ObjectId(req.user!.userId);
  const rawMessages = await ChatMessage.find({ userId }).sort({ createdAt: 1 }).limit(50);

  const messages = rawMessages.map((m) => ({
    id: (m as any)._id.toString(),
    sender: m.sender,
    text: m.text,
    sources: m.sources,
    timestamp: m.createdAt.toISOString(),
  }));

  res.json({ success: true, messages });
}

export async function clearHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  await ChatMessage.deleteMany({ userId: req.user!.userId });
  res.json({ success: true, message: 'Chat history cleared' });
}

export async function extractEntity(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    res.status(400).json({ success: false, error: 'Text prompt is required' });
    return;
  }

  // Fetch user's known contacts to help extraction
  const people = await Person.find({ userId }).select('name');
  const peopleNames = people.map((p) => p.name);

  const extraction = await extractEntitiesFromNaturalLanguage(text, peopleNames);

  res.json({
    success: true,
    extraction,
  });
}

export async function getBriefing(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const briefing = await generateDailyBriefing(userId);
  res.json({ success: true, briefing });
}

export async function checkContradiction(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { title, description, category } = req.body;

  if (!title || !description) {
    res.status(400).json({ success: false, error: 'Title and description are required' });
    return;
  }

  const result = await checkMemoryContradictions(userId, { title, description, category });
  res.json({ success: true, result });
}
