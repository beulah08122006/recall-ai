import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Handshake,
  Bell,
  Luggage,
  Sparkles,
  ArrowRight,
  Plus,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { memoryService } from '../../services/memoryService';
import { itemService } from '../../services/itemService';
import { reminderService } from '../../services/reminderService';
import { routineService } from '../../services/routineService';
import { Memory, Item, Reminder, Routine } from '../../types';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { DailyBriefingCard } from '../../components/assistant/DailyBriefingCard';
import { QuickAiEntryModal } from '../../components/assistant/QuickAiEntryModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [quickEntryOpen, setQuickEntryOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [memoriesRes, itemsRes, remindersRes, routinesRes] = await Promise.allSettled([
        memoryService.getMemories(),
        itemService.getItems(),
        reminderService.getUpcoming(),
        routineService.getRoutines(),
      ]);

      if (memoriesRes.status === 'fulfilled') setMemories(memoriesRes.value);
      if (itemsRes.status === 'fulfilled') setItems(itemsRes.value);
      if (remindersRes.status === 'fulfilled') setReminders(remindersRes.value);
      if (routinesRes.status === 'fulfilled') setRoutines(routinesRes.value);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);


  if (loading) {
    return <LoadingState message="Loading your personal memory space..." />;
  }

  // Real calculations
  const borrowedItems = items.filter((i) => i.direction === 'borrowed' && i.status !== 'returned');
  const lentItems = items.filter((i) => i.direction === 'lent' && i.status !== 'returned');
  const overdueItems = items.filter((i) => i.status === 'overdue');
  const pendingReminders = reminders.filter((r) => r.status === 'pending');

  const greetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#D9DED2]">
        <div>
          <h1 className="text-2xl font-bold text-[#26332C] tracking-tight">
            {greetingTime()}, {user?.name || 'Friend'}
          </h1>
          <p className="text-sm text-[#7C877D] mt-1">
            Here is what you need to remember and track today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setQuickEntryOpen(true)}
            leftIcon={<Sparkles className="w-4 h-4 text-[#C4D5B0]" />}
            className="bg-[#183C36] hover:bg-[#204942] text-white border-0 shadow-xs"
          >
            ✨ Quick AI Entry
          </Button>
          <Link to="/assistant">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4 text-[#526F52]" />}
            >
              Ask AI Assistant
            </Button>
          </Link>
          <Link to="/memories">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add Memory
            </Button>
          </Link>
        </div>
      </div>

      {/* Daily Personal Briefing: Your Day at a Glance */}
      <DailyBriefingCard />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#D9DED2]">
          <div className="flex items-center justify-between text-[#7C877D] mb-2">
            <span className="text-xs font-medium">Total Memories</span>
            <Brain className="w-4 h-4 text-[#526F52]" />
          </div>
          <div className="text-2xl font-bold text-[#26332C]">{memories.length}</div>
          <p className="text-[11px] text-[#7C877D] mt-1">Saved personal notes & facts</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#D9DED2]">
          <div className="flex items-center justify-between text-[#7C877D] mb-2">
            <span className="text-xs font-medium">Borrowed Items</span>
            <Handshake className="w-4 h-4 text-[#526F52]" />
          </div>
          <div className="text-2xl font-bold text-[#26332C]">{borrowedItems.length}</div>
          <p className="text-[11px] text-[#7C877D] mt-1">Things you borrowed</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#D9DED2]">
          <div className="flex items-center justify-between text-[#7C877D] mb-2">
            <span className="text-xs font-medium">Lent Items</span>
            <Handshake className="w-4 h-4 text-[#62896A]" />
          </div>
          <div className="text-2xl font-bold text-[#26332C]">{lentItems.length}</div>
          <p className="text-[11px] text-[#7C877D] mt-1">
            {overdueItems.length > 0 ? (
              <span className="text-[#D9534F] font-semibold">{overdueItems.length} overdue</span>
            ) : (
              'Things you lent out'
            )}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#D9DED2]">
          <div className="flex items-center justify-between text-[#7C877D] mb-2">
            <span className="text-xs font-medium">Upcoming Reminders</span>
            <Bell className="w-4 h-4 text-[#C58B52]" />
          </div>
          <div className="text-2xl font-bold text-[#26332C]">{pendingReminders.length}</div>
          <p className="text-[11px] text-[#7C877D] mt-1">Upcoming tasks & alerts</p>
        </div>
      </div>

      {/* Main Grid: Left (Memories & Reminders) & Right (Borrowed/Lent & Before You Leave) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Memories Section */}
          <div className="bg-white rounded-xl border border-[#D9DED2] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#526F52]" />
                <h3 className="text-sm font-semibold text-[#26332C]">Recent Memories</h3>
              </div>
              <Link
                to="/memories"
                className="text-xs font-semibold text-[#526F52] hover:underline flex items-center gap-1"
              >
                View all ({memories.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {memories.length === 0 ? (
              <EmptyState
                icon={<Brain className="w-5 h-5" />}
                title="No memories recorded yet"
                description="Save key facts, passport numbers, WiFi passwords, gift ideas, or places you visited."
                actionLabel="Create First Memory"
                onAction={() => (window.location.href = '/memories')}
              />
            ) : (
              <div className="space-y-3">
                {memories.slice(0, 4).map((memory) => (
                  <div
                    key={memory._id}
                    className="p-3.5 rounded-lg border border-[#D9DED2] hover:border-[#526F52]/40 hover:bg-[#F4F6EE]/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-[#26332C]">{memory.title}</h4>
                        <p className="text-xs text-[#7C877D] mt-1 line-clamp-2 leading-relaxed">
                          {memory.description}
                        </p>
                      </div>
                      {memory.category && (
                        <Badge variant="neutral" size="sm" className="shrink-0">
                          {memory.category}
                        </Badge>
                      )}
                    </div>
                    {memory.tags && memory.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {memory.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] text-[#7C877D] bg-[#EBEFE4] px-1.5 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Reminders Section */}
          <div className="bg-white rounded-xl border border-[#D9DED2] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#C58B52]" />
                <h3 className="text-sm font-semibold text-[#26332C]">Upcoming Reminders</h3>
              </div>
              <Link
                to="/reminders"
                className="text-xs font-semibold text-[#526F52] hover:underline flex items-center gap-1"
              >
                View all ({reminders.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {reminders.length === 0 ? (
              <EmptyState
                icon={<Bell className="w-5 h-5" />}
                title="No upcoming reminders"
                description="Set reminders for bills, doctor appointments, or things to follow up on."
                actionLabel="Add Reminder"
                onAction={() => (window.location.href = '/reminders')}
              />
            ) : (
              <div className="space-y-2.5">
                {reminders.slice(0, 4).map((reminder) => (
                  <div
                    key={reminder._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#D9DED2]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          reminder.priority === 'high'
                            ? 'bg-[#D9534F]'
                            : reminder.priority === 'medium'
                            ? 'bg-[#C58B52]'
                            : 'bg-[#526F52]'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#26332C] truncate">
                          {reminder.title}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-[#7C877D] mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {reminder.date}
                          </span>
                          {reminder.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {reminder.time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        reminder.priority === 'high'
                          ? 'danger'
                          : reminder.priority === 'medium'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {reminder.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col wide) */}
        <div className="space-y-6">
          {/* Before You Leave Checklist Entry Point */}
          <div className="bg-white rounded-xl border border-[#D9DED2] p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Luggage className="w-4 h-4 text-[#526F52]" />
                <h3 className="text-sm font-semibold text-[#26332C]">Before You Leave</h3>
              </div>
              <Link to="/before-you-leave" className="text-xs font-semibold text-[#526F52] hover:underline">
                Routines
              </Link>
            </div>
            <p className="text-xs text-[#7C877D] mb-4 leading-relaxed">
              Never forget your charger, keys, or ID. Select your destination or routine before heading out.
            </p>

            {routines.length > 0 ? (
              <div className="space-y-2 mb-4">
                {routines.slice(0, 3).map((r) => (
                  <Link
                    key={r._id}
                    to="/before-you-leave"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-[#D9DED2] hover:bg-[#F4F6EE] transition-colors"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#26332C] block">{r.name}</span>
                      <span className="text-[11px] text-[#7C877D]">{r.items.length} checklist items</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7C877D]" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-3 mb-4 rounded-lg bg-[#F4F6EE] border border-[#D9DED2] text-xs text-[#7C877D]">
                No routines configured yet. Set up college, gym, or office routines.
              </div>
            )}

            <Link to="/before-you-leave">
              <Button variant="outline" size="sm" className="w-full">
                Open Checklist
              </Button>
            </Link>
          </div>

          {/* Borrowed & Lent Active Summary */}
          <div className="bg-white rounded-xl border border-[#D9DED2] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Handshake className="w-4 h-4 text-[#62896A]" />
                <h3 className="text-sm font-semibold text-[#26332C]">Active Items</h3>
              </div>
              <Link to="/borrowed" className="text-xs font-semibold text-[#526F52] hover:underline">
                Manage
              </Link>
            </div>

            {items.filter((i) => i.status !== 'returned').length === 0 ? (
              <p className="text-xs text-[#7C877D] py-4 text-center">
                All borrowed and lent items have been returned.
              </p>
            ) : (
              <div className="space-y-3">
                {items
                  .filter((i) => i.status !== 'returned')
                  .slice(0, 4)
                  .map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-lg border border-[#D9DED2] flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#26332C]">{item.itemName}</p>
                        <p className="text-[11px] text-[#7C877D]">
                          {item.direction === 'lent' ? `Lent to ${item.personName}` : `Borrowed from ${item.personName}`}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.status === 'overdue'
                            ? 'danger'
                            : item.direction === 'lent'
                            ? 'accent'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {item.status === 'overdue' ? 'Overdue' : item.direction}
                      </Badge>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Universal Quick AI Entry Modal */}
      <QuickAiEntryModal
        isOpen={quickEntryOpen}
        onClose={() => setQuickEntryOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
};

