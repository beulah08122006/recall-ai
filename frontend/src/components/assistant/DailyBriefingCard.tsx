import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  AlertCircle,
  Luggage,
  Clock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Handshake,
} from 'lucide-react';
import { assistantService } from '../../services/assistantService';
import { DailyBriefing, BriefingHighlight } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const DailyBriefingCard: React.FC = () => {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBriefing = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await assistantService.getBriefing();
      setBriefing(data);
    } catch (err) {
      console.error('Failed to fetch daily briefing', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-[#D9DED2] p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-44 bg-[#E8E8D8] rounded" />
          <div className="h-4 w-20 bg-[#E8E8D8] rounded" />
        </div>
        <div className="space-y-3">
          <div className="h-4 w-3/4 bg-[#E8E8D8] rounded" />
          <div className="h-16 w-full bg-[#E8E8D8]/50 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!briefing) return null;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-[#D9DED2] shadow-xs overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-[#D9DED2] bg-[#F7F8F3] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#526F52] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#26332C] tracking-tight">Your Day at a Glance</h2>
              <span className="text-[11px] font-semibold text-[#526F52] px-2 py-0.5 rounded-full bg-[#C4D5B0]/40 border border-[#C4D5B0]">
                Daily AI Briefing
              </span>
            </div>
            <p className="text-xs text-[#7C877D] mt-0.5">{todayFormatted} • {briefing.greeting}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchBriefing(true)}
            disabled={refreshing}
            className="p-1.5 rounded-md text-[#7C877D] hover:text-[#26332C] hover:bg-[#E8E8D8] transition-colors cursor-pointer"
            title="Refresh briefing"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/assistant">
            <Button variant="outline" size="sm" className="text-xs py-1 px-2.5 h-auto">
              Open Assistant
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Executive summary banner */}
        <div className="p-3.5 rounded-lg bg-[#F4F6EE] border border-[#D9DED2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[#526F52] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-[#26332C] leading-snug">
                {briefing.summary}
              </p>
              <p className="text-[11px] text-[#7C877D] mt-0.5">
                Automatically consolidated from your reminders, lent items, and departure routines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {briefing.stats.overdueItems > 0 && (
              <Badge variant="danger" size="sm">
                {briefing.stats.overdueItems} Overdue
              </Badge>
            )}
            {briefing.stats.todayReminders > 0 && (
              <Badge variant="warning" size="sm">
                {briefing.stats.todayReminders} Due Today
              </Badge>
            )}
            {briefing.stats.overdueItems === 0 && briefing.stats.todayReminders === 0 && (
              <Badge variant="success" size="sm">
                All Clear
              </Badge>
            )}
          </div>
        </div>

        {/* Highlights List */}
        {briefing.highlights && briefing.highlights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {briefing.highlights.map((highlight, idx) => {
              const isOverdue = highlight.type === 'overdue';
              const isRoutine = highlight.type === 'routine';
              const isReminder = highlight.type === 'reminder';

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-all ${
                    isOverdue
                      ? 'bg-[#FDF6F5] border-[#E8B4B2]'
                      : 'bg-white border-[#D9DED2] hover:border-[#526F52]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {isOverdue && <AlertCircle className="w-4 h-4 text-[#D9534F] shrink-0" />}
                      {isRoutine && <Luggage className="w-4 h-4 text-[#526F52] shrink-0" />}
                      {isReminder && <Calendar className="w-4 h-4 text-[#C58B52] shrink-0" />}
                      <span className="text-xs font-semibold text-[#26332C]">
                        {highlight.title}
                      </span>
                    </div>
                    {highlight.priority === 'high' && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#D9534F]/15 text-[#B53B37]">
                        Priority
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#7C877D] leading-relaxed mb-2.5">
                    {highlight.description}
                  </p>

                  {highlight.actionUrl && (
                    <Link
                      to={highlight.actionUrl}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#526F52] hover:text-[#183C36] hover:underline"
                    >
                      <span>{highlight.actionLabel || 'View details'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* AI Intelligent Recommendation */}
        {briefing.aiRecommendation && (
          <div className="p-3.5 rounded-lg bg-[#EBF2E8] border border-[#C4D5B0] flex items-start gap-3">
            <div className="p-1.5 rounded-md bg-[#526F52] text-white shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-[#183C36] tracking-wide uppercase mr-2">
                Contextual AI Suggestion
              </span>
              <p className="text-xs text-[#26332C] mt-1 leading-relaxed">
                {briefing.aiRecommendation.replace(/^AI Suggestion:\s*/i, '')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

