import React, { useEffect, useState, useRef } from 'react';
import { assistantService } from '../../services/assistantService';
import { ChatMessage } from '../../types';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../hooks/useToast';
import {
  Sparkles,
  Send,
  Trash2,
  Brain,
  Handshake,
  Bell,
  Luggage,
  User,
  Bot,
  Loader2,
  Video,
  VideoOff,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What items did I lend to someone?',
  'Which items are currently overdue?',
  'What reminders do I have coming up?',
  'What should I pack or take before leaving?',
  'What did I save about my personal notes or IDs?',
];

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [videoActive, setVideoActive] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const toast = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        const history = await assistantService.getHistory();
        if (history && history.length > 0) {
          setMessages(history);
        } else {
          // Welcome greeting message
          setMessages([
            {
              id: 'welcome',
              sender: 'assistant',
              text: "Hello! I'm your Recall AI memory assistant. I have direct access to your saved memories, borrowed & lent items, reminders, and departure routines. Ask me anything about what you've stored!",
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (err: any) {
        console.error('Failed to load chat history', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await assistantService.ask(query.trim());
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        sources: response.sources,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      toast.error('Assistant error', err.response?.data?.error || 'Failed to retrieve response.');
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an error while retrieving your records. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await assistantService.clearHistory();
      setMessages([
        {
          id: 'welcome-cleared',
          sender: 'assistant',
          text: 'Conversation history cleared. How can I help you today?',
          timestamp: new Date().toISOString(),
        },
      ]);
      toast.info('Chat history cleared');
    } catch (err: any) {
      toast.error('Failed to clear history', err.message);
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'memory':
        return <Brain className="w-3 h-3 text-[#526F52]" />;
      case 'item':
        return <Handshake className="w-3 h-3 text-[#62896A]" />;
      case 'reminder':
        return <Bell className="w-3 h-3 text-[#C58B52]" />;
      case 'routine':
        return <Luggage className="w-3 h-3 text-[#526F52]" />;
      default:
        return <User className="w-3 h-3 text-[#7C877D]" />;
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-6.5rem)] md:h-[calc(100vh-4rem)] max-w-4xl mx-auto rounded-2xl overflow-hidden border border-[#D9DED2] shadow-sm p-4 sm:p-6 bg-white/80 backdrop-blur-md animate-in fade-in duration-150">
      {/* Background Video */}
      {videoActive && (
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            src="/recall-ai.mp4"
            className="w-full h-full object-cover opacity-25 filter blur-[0.4px] transition-opacity duration-700"
          />
          {/* Subtle dual gradient overlay to guarantee crisp text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#E8E8D8]/85 via-[#E8E8D8]/65 to-[#E8E8D8]/90" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D9DED2] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#526F52] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#26332C] tracking-tight flex items-center gap-2">
              <span>Recall AI Assistant</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#526F52]/10 text-[#526F52]">
                Video Ambient
              </span>
            </h1>
            <p className="text-xs text-[#7C877D]">Context-aware search across your personal data</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setVideoActive(!videoActive)}
            className="p-1.5 rounded-lg text-[#7C877D] hover:text-[#526F52] hover:bg-white/80 transition-colors cursor-pointer"
            title={videoActive ? 'Hide Background Video' : 'Show Background Video'}
            aria-label="Toggle background video"
          >
            {videoActive ? <Video className="w-4 h-4 text-[#526F52]" /> : <VideoOff className="w-4 h-4" />}
          </button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4 text-[#7C877D]" />}
            onClick={handleClearHistory}
          >
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Suggested Chips */}
      <div className="py-3 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 border-b border-[#D9DED2]">
        <span className="text-[11px] font-semibold text-[#7C877D] uppercase tracking-wider whitespace-nowrap mr-1">
          Suggestions:
        </span>
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 text-[#26332C] border border-[#D9DED2] hover:bg-white hover:border-[#526F52]/40 shadow-2xs transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {historyLoading ? (
          <div className="flex items-center justify-center h-full text-xs text-[#7C877D]">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#526F52]" />
            Loading conversation...
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-white/90 border border-[#D9DED2] text-[#526F52] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-[#526F52] text-white rounded-tr-xs shadow-xs'
                        : 'bg-white/95 text-[#26332C] border border-[#D9DED2] rounded-tl-xs shadow-2xs backdrop-blur-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Sources / Citations - Explainable Personal AI */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="p-3 bg-white/95 backdrop-blur-xs border border-[#D9DED2] rounded-xl text-xs space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#7C877D] uppercase tracking-wider block">
                          Retrieved Personal Records (Explainable AI Citations):
                        </span>
                        <span className="text-[10px] font-semibold text-[#3D6645] bg-[#62896A]/15 border border-[#62896A]/30 px-1.5 py-0.5 rounded">
                          Directly Supported
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, i) => (
                          <div
                            key={i}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EBEFE4] border border-[#D9DED2] text-[11px] text-[#26332C]"
                          >
                            {getSourceIcon(src.type)}
                            <span className="font-semibold">{src.title}</span>
                            {src.detail && (
                              <span className="text-[#7C877D] text-[10px] border-l border-[#D9DED2] pl-1.5">
                                {src.detail}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-[#7C877D] block px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#526F52] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs uppercase shadow-xs">
                    You
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-white/90 border border-[#D9DED2] text-[#526F52] flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white/95 border border-[#D9DED2] rounded-2xl rounded-tl-xs p-4 flex items-center gap-2 text-xs text-[#7C877D] shadow-2xs backdrop-blur-xs">
              <Loader2 className="w-4 h-4 animate-spin text-[#526F52]" />
              Searching your personal records...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-3 border-t border-[#D9DED2] shrink-0"
      >
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xs rounded-xl border border-[#D9DED2] p-2 focus-within:border-[#526F52] focus-within:ring-2 focus-within:ring-[#526F52]/20 shadow-xs transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about memories, borrowed items, or departure checklists..."
            className="flex-1 px-3 py-2 text-sm text-[#26332C] placeholder-[#9EA79F] bg-transparent outline-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!input.trim() || isLoading}
            isLoading={isLoading}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};
