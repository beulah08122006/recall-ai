import React, { useEffect, useState } from 'react';
import { insightService } from '../../services/insightService';
import { InsightsData } from '../../types';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../hooks/useToast';
import {
  BarChart3,
  Brain,
  Handshake,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const res = await insightService.getInsights();
        setData(res);
      } catch (err: any) {
        toast.error('Failed to load insights', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return <LoadingState message="Analyzing your personal records..." />;
  }

  if (!data) {
    return (
      <EmptyState
        icon={<BarChart3 className="w-6 h-6" />}
        title="No Insights Available"
        description="Add memories, items, and reminders to see intelligent personal summaries."
      />
    );
  }

  const totalItemsTracked = data.activeBorrowed + data.activeLent;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9DED2]">
        <h1 className="text-2xl font-bold text-[#26332C] tracking-tight">System Insights</h1>
        <p className="text-sm text-[#7C877D] mt-0.5">
          Real-time metrics and summaries calculated from your stored personal data.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#D9DED2] p-5">
          <div className="flex items-center justify-between text-[#7C877D] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Memories</span>
            <Brain className="w-4 h-4 text-[#526F52]" />
          </div>
          <div className="text-2xl font-bold text-[#26332C]">{data.totalMemories}</div>
          <p className="text-xs text-[#7C877D] mt-1">Total knowledge records</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D9DED2] p-5">
          <div className="flex items-center justify-between text-[#7C877D] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Items</span>
            <Handshake className="w-4 h-4 text-[#62896A]" />
          </div>
          <div className="text-2xl font-bold text-[#26332C]">{totalItemsTracked}</div>
          <p className="text-xs text-[#7C877D] mt-1">
            {data.activeLent} lent • {data.activeBorrowed} borrowed
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#D9DED2] p-5">
          <div className="flex items-center justify-between text-[#7C877D] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Alerts</span>
            <AlertTriangle className="w-4 h-4 text-[#C58B52]" />
          </div>
          <div
            className={`text-2xl font-bold ${
              data.overdueItems > 0 ? 'text-[#C58B52]' : 'text-[#26332C]'
            }`}
          >
            {data.overdueItems}
          </div>
          <p className="text-xs text-[#7C877D] mt-1">Items past expected return date</p>
        </div>

        <div className="bg-white rounded-xl border border-[#D9DED2] p-5">
          <div className="flex items-center justify-between text-[#7C877D] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Reminder Completion</span>
            <CheckCircle2 className="w-4 h-4 text-[#62896A]" />
          </div>
          <div className="text-2xl font-bold text-[#26332C]">
            {data.completedRemindersCount}
          </div>
          <p className="text-xs text-[#7C877D] mt-1">
            {data.upcomingRemindersCount} pending upcoming
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-[#D9DED2] p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#26332C] mb-1">Memory Categories</h3>
          <p className="text-xs text-[#7C877D] mb-4">Distribution of stored knowledge topics</p>

          {data.categoryDistribution.length === 0 ? (
            <p className="text-xs text-[#7C877D] py-6 text-center italic">
              No categorized memories found.
            </p>
          ) : (
            <div className="space-y-3">
              {data.categoryDistribution.map((cat) => {
                const pct =
                  data.totalMemories > 0
                    ? Math.round((cat.count / data.totalMemories) * 100)
                    : 0;
                return (
                  <div key={cat.category}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-[#26332C]">{cat.category}</span>
                      <span className="text-[#7C877D]">
                        {cat.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#EBEFE4] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#526F52] h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lending By Person */}
        <div className="bg-white rounded-2xl border border-[#D9DED2] p-6 shadow-xs">
          <h3 className="text-base font-bold text-[#26332C] mb-1">Item Lending Distribution</h3>
          <p className="text-xs text-[#7C877D] mb-4">People holding items you lent out</p>

          {!data.lendingSummary || data.lendingSummary.length === 0 ? (
            <p className="text-xs text-[#7C877D] py-6 text-center italic">
              No items currently lent to anyone.
            </p>
          ) : (
            <div className="space-y-3">
              {data.lendingSummary.map((person) => (
                <div
                  key={person.personName}
                  className="p-3 rounded-xl border border-[#D9DED2] flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-[#26332C]">
                      {person.personName}
                    </h4>
                    <p className="text-xs text-[#7C877D] mt-0.5">
                      Items: {person.items.join(', ')}
                    </p>
                  </div>
                  <Badge variant="accent" size="sm">
                    {person.count} item{person.count > 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Log */}
      <div className="bg-white rounded-2xl border border-[#D9DED2] p-6 shadow-xs">
        <h3 className="text-base font-bold text-[#26332C] mb-1">Recent Activity Feed</h3>
        <p className="text-xs text-[#7C877D] mb-4">Chronological log of additions and changes</p>

        {!data.recentActivity || data.recentActivity.length === 0 ? (
          <p className="text-xs text-[#7C877D] py-6 text-center italic">
            No recent activity recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-[#D9DED2]">
            {data.recentActivity.map((act, index) => (
              <div key={index} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EBEFE4]/60 border border-[#D9DED2] flex items-center justify-center text-[#526F52]">
                    {act.type === 'memory' && <Brain className="w-4 h-4" />}
                    {act.type === 'item' && <Handshake className="w-4 h-4 text-[#62896A]" />}
                    {act.type === 'reminder' && <Bell className="w-4 h-4 text-[#C58B52]" />}
                    {act.type === 'carry' && <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-semibold text-[#26332C] block">{act.title}</span>
                    <span className="text-[#7C877D]">{act.detail}</span>
                  </div>
                </div>
                <span className="text-[#7C877D]">
                  {new Date(act.timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

