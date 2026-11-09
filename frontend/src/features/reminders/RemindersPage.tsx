import React, { useEffect, useState, useMemo } from 'react';
import { reminderService } from '../../services/reminderService';
import { Reminder, ReminderPriority, ReminderStatus } from '../../types';
import { ReminderModal } from './ReminderModal';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import {
  Bell,
  Plus,
  Calendar,
  Clock,
  User,
  Package,
  Check,
  CheckCircle2,
  Edit2,
  Trash2,
} from 'lucide-react';

type ReminderTab = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export const RemindersPage: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ReminderTab>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await reminderService.getReminders();
      setReminders(data);
    } catch (err: any) {
      toast.error('Failed to load reminders', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredReminders = useMemo(() => {
    return reminders.filter((r) => {
      const matchesSearch =
        search === '' ||
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(search.toLowerCase())) ||
        (r.personName && r.personName.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      const rDate = r.date ? r.date.split('T')[0] : '';

      if (activeTab === 'all') return r.status !== 'completed';
      if (activeTab === 'today') return r.status !== 'completed' && rDate === todayStr;
      if (activeTab === 'upcoming') return r.status === 'pending' && rDate >= todayStr;
      if (activeTab === 'overdue') return r.status === 'overdue' || (r.status === 'pending' && rDate < todayStr);
      if (activeTab === 'completed') return r.status === 'completed';

      return true;
    });
  }, [reminders, search, activeTab, todayStr]);

  const handleCreateOrUpdate = async (data: Partial<Reminder>) => {
    try {
      setSubmitting(true);
      if (editingReminder) {
        const updated = await reminderService.updateReminder(editingReminder._id, data);
        setReminders((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
        toast.success('Reminder updated', 'Saved successfully.');
      } else {
        const created = await reminderService.createReminder(data);
        setReminders((prev) => [created, ...prev]);
        toast.success('Reminder scheduled', 'You will be notified on schedule.');
      }
      setModalOpen(false);
      setEditingReminder(null);
    } catch (err: any) {
      toast.error('Failed to save reminder', err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (id: string) => {
    try {
      const updated = await reminderService.toggleComplete(id);
      setReminders((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      if (updated.status === 'completed') {
        toast.success('Completed!', 'Reminder marked as done.');
      } else {
        toast.info('Reopened', 'Reminder marked as active.');
      }
    } catch (err: any) {
      toast.error('Failed to update status', err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await reminderService.deleteReminder(deletingId);
      setReminders((prev) => prev.filter((r) => r._id !== deletingId));
      toast.success('Deleted', 'Reminder removed.');
    } catch (err: any) {
      toast.error('Failed to delete', err.message);
    } finally {
      setSubmitting(false);
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const overdueCount = reminders.filter(
    (r) => r.status === 'overdue' || (r.status === 'pending' && r.date && r.date.split('T')[0] < todayStr)
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DED2]">
        <div>
          <h1 className="text-2xl font-bold text-[#26332C] tracking-tight">Reminders</h1>
          <p className="text-sm text-[#7C877D] mt-0.5">
            Never miss an appointment, bill due date, or follow-up item.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingReminder(null);
            setModalOpen(true);
          }}
        >
          Add Reminder
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search reminders..."
          className="w-full md:max-w-md"
        />

        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#D9DED2] rounded-lg overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#526F52] text-white shadow-xs'
                : 'text-[#7C877D] hover:text-[#26332C]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'today'
                ? 'bg-[#526F52] text-white shadow-xs'
                : 'text-[#7C877D] hover:text-[#26332C]'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'bg-[#526F52] text-white shadow-xs'
                : 'text-[#7C877D] hover:text-[#26332C]'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'overdue'
                ? 'bg-[#C58B52] text-white shadow-xs'
                : 'text-[#7C877D] hover:text-[#C58B52]'
            }`}
          >
            Overdue
            {overdueCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'overdue' ? 'bg-white text-[#C58B52]' : 'bg-[#C58B52]/10 text-[#C58B52]'}`}>
                {overdueCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'completed'
                ? 'bg-[#62896A] text-white shadow-xs'
                : 'text-[#7C877D] hover:text-[#26332C]'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading reminders..." />
      ) : filteredReminders.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title={search ? 'No reminders match your search' : 'No reminders in this list'}
          description={
            search
              ? 'Try using different search terms.'
              : activeTab === 'overdue'
              ? 'Excellent! No overdue reminders right now.'
              : 'Add reminders to stay organized and punctual throughout your week.'
          }
          actionLabel={search ? 'Clear Search' : 'Add Reminder'}
          onAction={() => {
            if (search) setSearch('');
            else {
              setEditingReminder(null);
              setModalOpen(true);
            }
          }}
        />
      ) : (
        <div className="space-y-2.5">
          {filteredReminders.map((reminder) => {
            const isCompleted = reminder.status === 'completed';
            const isOverdue =
              reminder.status === 'overdue' ||
              (!isCompleted && reminder.date && reminder.date.split('T')[0] < todayStr);

            return (
              <div
                key={reminder._id}
                className={`bg-white rounded-xl border p-4 transition-all flex items-start sm:items-center justify-between gap-4 ${
                  isOverdue
                    ? 'border-[#C58B52]/40 bg-[#FFFDF9]'
                    : isCompleted
                    ? 'border-[#D9DED2] opacity-75'
                    : 'border-[#D9DED2] hover:border-[#526F52]/30'
                }`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => handleToggleComplete(reminder._id)}
                    className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isCompleted
                        ? 'bg-[#62896A] border-[#62896A] text-white'
                        : 'border-[#C8CEC1] hover:border-[#526F52]'
                    }`}
                    aria-label="Toggle completed"
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-semibold truncate ${
                          isCompleted
                            ? 'line-through text-[#7C877D]'
                            : isOverdue
                            ? 'text-[#C58B52]'
                            : 'text-[#26332C]'
                        }`}
                      >
                        {reminder.title}
                      </h3>
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
                      {isOverdue && (
                        <Badge variant="warning" size="sm">
                          Overdue
                        </Badge>
                      )}
                    </div>

                    {reminder.description && (
                      <p className="text-xs text-[#7C877D] mt-0.5 line-clamp-1">
                        {reminder.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#7C877D] mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(reminder.date)}
                      </span>

                      {reminder.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {reminder.time}
                        </span>
                      )}

                      {reminder.personName && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-[#526F52]" />
                          {reminder.personName}
                        </span>
                      )}

                      {reminder.relatedItem && (
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-[#62896A]" />
                          {reminder.relatedItem}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingReminder(reminder);
                      setModalOpen(true);
                    }}
                    className="p-1.5 rounded text-[#7C877D] hover:text-[#526F52] hover:bg-[#EBEFE4] cursor-pointer"
                    aria-label="Edit reminder"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(reminder._id)}
                    className="p-1.5 rounded text-[#7C877D] hover:text-[#D9534F] hover:bg-[#EBEFE4] cursor-pointer"
                    aria-label="Delete reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <ReminderModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingReminder(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingReminder}
        isLoading={submitting}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder?"
        confirmLabel="Delete"
        isDestructive
        isLoading={submitting}
      />
    </div>
  );
};

