import React, { useEffect, useState } from 'react';
import { routineService } from '../../services/routineService';
import { reminderService } from '../../services/reminderService';
import { Routine, Reminder } from '../../types';
import { RoutineModal } from './RoutineModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import {
  Luggage,
  Check,
  Plus,
  Trash2,
  Edit2,
  RotateCcw,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const DEFAULT_PRESETS = [
  {
    name: 'College / University',
    activity: 'Classes',
    destination: 'Campus',
    items: ['Student ID card', 'Laptop & charger', 'Notebook & pens', 'Water bottle', 'Earbuds'],
  },
  {
    name: 'Work / Office Commute',
    activity: 'Work',
    destination: 'Office',
    items: ['Work badge / Keycard', 'Laptop & power brick', 'House keys', 'Wallet', 'Transit card', 'Mug'],
  },
  {
    name: 'Gym & Fitness',
    activity: 'Workout',
    destination: 'Gym',
    items: ['Workout shoes', 'Gym lock', 'Water bottle', 'Sweat towel', 'Post-workout snack', 'Earphones'],
  },
  {
    name: 'Flight / Travel',
    activity: 'Travel',
    destination: 'Airport',
    items: ['Passport / National ID', 'Boarding pass', 'Phone charger & power bank', 'Prescription medication', 'Neck pillow'],
  },
];

export const BeforeYouLeavePage: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [activeItems, setActiveItems] = useState<{ id: string; name: string; checked: boolean }[]>([]);
  const [customItem, setCustomItem] = useState('');
  const [relevantReminders, setRelevantReminders] = useState<Reminder[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const fetchRoutinesAndReminders = async () => {
    try {
      setLoading(true);
      const [routinesData, remindersData] = await Promise.all([
        routineService.getRoutines(),
        reminderService.getUpcoming(),
      ]);
      setRoutines(routinesData);

      // Check for reminders due today
      const today = new Date().toISOString().split('T')[0];
      const todayReminders = remindersData.filter(
        (r) => r.status === 'pending' && r.date && r.date.split('T')[0] === today
      );
      setRelevantReminders(todayReminders);

      if (routinesData.length > 0) {
        selectRoutine(routinesData[0]);
      } else {
        // Auto-seed default first preset in state for immediate use
        const starter = DEFAULT_PRESETS[0];
        setActiveItems(
          starter.items.map((it, idx) => ({ id: `starter-${idx}`, name: it, checked: false }))
        );
      }
    } catch (err: any) {
      toast.error('Failed to load routines', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutinesAndReminders();
  }, []);

  const selectRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setActiveItems(
      routine.items.map((name, idx) => ({
        id: `routine-item-${idx}`,
        name,
        checked: false,
      }))
    );
  };

  const handleApplyPreset = (preset: typeof DEFAULT_PRESETS[0]) => {
    setSelectedRoutine(null);
    setActiveItems(
      preset.items.map((name, idx) => ({
        id: `preset-${idx}`,
        name,
        checked: false,
      }))
    );
    toast.info('Preset loaded', `Loaded "${preset.name}" checklist.`);
  };

  const handleToggleItem = (id: string) => {
    setActiveItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItem.trim()) return;
    const newItem = {
      id: `custom-${Date.now()}`,
      name: customItem.trim(),
      checked: false,
    };
    setActiveItems((prev) => [...prev, newItem]);
    setCustomItem('');
    toast.success('Item added to today’s list', newItem.name);
  };

  const handleResetChecklist = () => {
    setActiveItems((prev) => prev.map((item) => ({ ...item, checked: false })));
    toast.info('Checklist reset', 'Ready for departure.');
  };

  const handleSaveAsRoutine = async () => {
    const routineName = prompt('Enter a name for this routine:');
    if (!routineName || !routineName.trim()) return;

    try {
      setSubmitting(true);
      const created = await routineService.createRoutine({
        name: routineName.trim(),
        activity: selectedRoutine?.activity || 'General',
        destination: selectedRoutine?.destination || undefined,
        items: activeItems.map((i) => i.name),
      });
      setRoutines((prev) => [created, ...prev]);
      setSelectedRoutine(created);
      toast.success('Routine saved', `"${created.name}" is now saved to your routines.`);
    } catch (err: any) {
      toast.error('Failed to save routine', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateOrUpdateRoutine = async (data: Partial<Routine>) => {
    try {
      setSubmitting(true);
      if (editingRoutine) {
        const updated = await routineService.updateRoutine(editingRoutine._id, data);
        setRoutines((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
        if (selectedRoutine?._id === updated._id) {
          selectRoutine(updated);
        }
        toast.success('Routine updated', 'Saved changes.');
      } else {
        const created = await routineService.createRoutine(data as any);
        setRoutines((prev) => [created, ...prev]);
        selectRoutine(created);
        toast.success('Routine created', `Saved "${created.name}".`);
      }
      setModalOpen(false);
      setEditingRoutine(null);
    } catch (err: any) {
      toast.error('Failed to save', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoutine = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await routineService.deleteRoutine(deletingId);
      setRoutines((prev) => prev.filter((r) => r._id !== deletingId));
      if (selectedRoutine?._id === deletingId) {
        setSelectedRoutine(null);
      }
      toast.success('Routine deleted', 'Removed from routines.');
    } catch (err: any) {
      toast.error('Failed to delete', err.message);
    } finally {
      setSubmitting(false);
      setDeletingId(null);
    }
  };

  const checkedCount = activeItems.filter((i) => i.checked).length;
  const totalCount = activeItems.length;
  const isAllChecked = totalCount > 0 && checkedCount === totalCount;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DED2]">
        <div>
          <h1 className="text-2xl font-bold text-[#26332C] tracking-tight">Before You Leave</h1>
          <p className="text-sm text-[#7C877D] mt-0.5">
            Smart departure checklists tailored to where you are heading.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={handleResetChecklist}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingRoutine(null);
              setModalOpen(true);
            }}
          >
            New Routine
          </Button>
        </div>
      </div>

      {/* Relevant Reminders Due Today Alert */}
      {relevantReminders.length > 0 && (
        <div className="p-4 rounded-xl bg-[#C58B52]/10 border border-[#C58B52]/25 text-[#26332C]">
          <div className="flex items-center gap-2 font-semibold text-xs text-[#C58B52] uppercase tracking-wider mb-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>Reminder for Today</span>
          </div>
          <div className="space-y-1">
            {relevantReminders.map((r) => (
              <p key={r._id} className="text-sm text-[#26332C] font-medium">
                • {r.title} {r.time ? `at ${r.time}` : ''}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Routine Selectors / Preset Chips */}
      <div>
        <label className="block text-xs font-semibold text-[#26332C] mb-2 uppercase tracking-wider">
          Select Departure Context
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {routines.map((routine) => (
            <button
              key={routine._id}
              onClick={() => selectRoutine(routine)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedRoutine?._id === routine._id
                  ? 'bg-[#526F52] text-white shadow-xs'
                  : 'bg-white text-[#26332C] border border-[#D9DED2] hover:bg-[#EBEFE4]'
              }`}
            >
              {routine.name}
            </button>
          ))}

          {/* Quick presets */}
          {DEFAULT_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap bg-[#EBEFE4] text-[#7C877D] hover:bg-[#DFE4D6] hover:text-[#26332C] transition-colors cursor-pointer"
            >
              + {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Checklist Card */}
      <div className="bg-white rounded-2xl border border-[#D9DED2] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#D9DED2]">
          <div>
            <h2 className="text-lg font-bold text-[#26332C]">
              {selectedRoutine ? selectedRoutine.name : 'Departure Checklist'}
            </h2>
            <div className="flex items-center gap-3 text-xs text-[#7C877D] mt-1">
              {selectedRoutine?.destination && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#526F52]" />
                  {selectedRoutine.destination}
                </span>
              )}
              <span>
                {checkedCount} of {totalCount} packed
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedRoutine && (
              <>
                <button
                  onClick={() => {
                    setEditingRoutine(selectedRoutine);
                    setModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-[#7C877D] hover:text-[#526F52] hover:bg-[#EBEFE4] cursor-pointer"
                  title="Edit routine"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingId(selectedRoutine._id)}
                  className="p-1.5 rounded-lg text-[#7C877D] hover:text-[#D9534F] hover:bg-[#EBEFE4] cursor-pointer"
                  title="Delete routine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            {!selectedRoutine && totalCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleSaveAsRoutine}>
                Save as Routine
              </Button>
            )}
          </div>
        </div>

        {/* Status Indicator */}
        {isAllChecked && totalCount > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-[#62896A]/10 border border-[#62896A]/25 flex items-center gap-2 text-xs font-semibold text-[#62896A]">
            <Check className="w-4 h-4" />
            <span>You&apos;re all set! Everything on your checklist is ready. Safe travels!</span>
          </div>
        )}

        {/* Checklist items */}
        <div className="space-y-2 mb-6">
          {activeItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleItem(item.id)}
              className={`p-3 rounded-xl border transition-colors flex items-center justify-between cursor-pointer select-none ${
                item.checked
                  ? 'bg-[#F8F9F5] border-[#D9DED2]'
                  : 'bg-white border-[#D9DED2] hover:border-[#526F52]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    item.checked
                      ? 'bg-[#62896A] border-[#62896A] text-white'
                      : 'border-[#C8CEC1] hover:border-[#526F52]'
                  }`}
                >
                  {item.checked && <Check className="w-3.5 h-3.5" />}
                </div>
                <span
                  className={`text-sm font-medium ${
                    item.checked ? 'line-through text-[#7C877D]' : 'text-[#26332C]'
                  }`}
                >
                  {item.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add one-off item for this trip */}
        <form onSubmit={handleAddCustomItem} className="flex gap-2">
          <Input
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            placeholder="Add an extra item needed today..."
            className="flex-1"
          />
          <Button type="submit" variant="secondary" size="md">
            Add to List
          </Button>
        </form>
      </div>

      {/* Modal */}
      <RoutineModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRoutine(null);
        }}
        onSubmit={handleCreateOrUpdateRoutine}
        initialData={editingRoutine}
        isLoading={submitting}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteRoutine}
        title="Delete Routine"
        message="Are you sure you want to remove this departure routine?"
        confirmLabel="Delete"
        isDestructive
        isLoading={submitting}
      />
    </div>
  );
};

