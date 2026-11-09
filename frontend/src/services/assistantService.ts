import { api } from './api';
import {
  ChatMessage,
  NaturalLanguageExtraction,
  DailyBriefing,
  ContradictionCheckResult,
} from '../types';

export const assistantService = {
  async ask(message: string): Promise<{ reply: string; sources?: any[] }> {
    const res = await api.post('/assistant/ask', { message });
    return res.data;
  },

  async getHistory(): Promise<ChatMessage[]> {
    const res = await api.get('/assistant/history');
    return res.data.messages;
  },

  async clearHistory(): Promise<void> {
    await api.delete('/assistant/history');
  },

  async extract(text: string): Promise<NaturalLanguageExtraction> {
    const res = await api.post('/assistant/extract', { text });
    return res.data.extraction;
  },

  async getBriefing(): Promise<DailyBriefing> {
    const res = await api.get('/assistant/briefing');
    return res.data.briefing;
  },

  async checkConflict(
    title: string,
    description: string
  ): Promise<ContradictionCheckResult> {
    const res = await api.post('/assistant/check-contradiction', {
      title,
      description,
    });
    return res.data.result;
  },
};


