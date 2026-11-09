import React, { useEffect, useState, useMemo } from 'react';
import { carryService } from '../../services/carryService';
import { CarryItem } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../hooks/useToast';
import {
  CheckSquare,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const PRESET_CATEGORIES = [
  'Everyday Essentials',
  'Tech & Work',
  'Documents & ID',
  'Fitness & Gym',
  'Travel & Outdoor',
  'Other',
];

export const CarryListPage: React.FC = () => {
  const [items, setItems] = useState<CarryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newCategory, setNewCategory] = useState('Everyday Essentials');
  const [adding, setAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const toast = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await carryService.getItems();
      setItems(data);
    } catch (err: any) {
      toast.error('Failed to load carry items', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    try {
      setAdding(true);
      const created = await carryService.createItem({
        name: newItemName.trim(),
        category: newCategory,
      });
      setItems((prev) => [...prev, created]);
      setNewItemName('');
      toast.success('Added to checklist', created.name);
    } catch (err: any) {
      toast.error('Failed to add item', err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await carryService.toggleChecked(id);
      setItems((prev) => prev.map((item) => (item._id === id ? updated : item)));
    } catch (err: any) {
      toast.error('Failed to update status', err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await carryService.deleteItem(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
      toast.success('Removed', 'Item deleted from checklist');
    } catch (err: any) {
      toast.error('Failed to delete item', err.message);
    }
  };

  const handleClearCompleted = async () => {
    try {
      await carryService.clearCompleted();
      setItems((prev) => prev.filter((item) => !item.checked));
      toast.success('Cleared', 'Completed items removed');
    } catch (err: any) {
      toast.error('Failed to clear completed items', err.message);
    }
  };

  const handleResetChecks = async () => {
    try {
      // Uncheck all items
      const unchecked = await Promise.all(
        items.filter((i) => i.checked).map((i) => carryService.toggleChecked(i._id))
      );
      setItems((prev) =>
        prev.map((it) => {
          const match = unchecked.find((u) => u._id === it._id);
          return match || it;
        })
      );
      toast.info('Checklist reset', 'Ready for your next trip or commute');
    } catch (err: any) {
      toast.error('Failed to reset', err.message);
    }
  };

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter((i) => (i.category || 'Other') === selectedCategory);
  }, [items, selectedCategory]);

  const checkedCount = items.filter((i) => i.checked).length;
  const progressPercent = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DED2]">
        <div>
          <h1 className="text-2xl font-bold text-[#26332C] tracking-tight">Carry List</h1>
          <p className="text-sm text-[#7C877D] mt-0.5">
            Your pocket checklist for everyday items, gear, and essentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {checkedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleResetChecks}
            >
              Reset All
            </Button>
          )}
          {checkedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-[#D9534F]" />}
              onClick={handleClearCompleted}
            >
              Clear Checked
            </Button>
          )}
        </div>
      </div>

      {/* Progress Card */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl border border-[#D9DED2] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <span className="text-xs font-semibold text-[#26332C]">Checklist Progress</span>
            <div className="text-sm text-[#7C877D] mt-0.5">
              {checkedCount} of {items.length} items packed ({progressPercent}%)
            </div>
          </div>
          <div className="w-full sm:w-64 bg-[#EBEFE4] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#526F52] h-full transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Add Bar */}
      <form onSubmit={handleAddItem} className="bg-white rounded-xl border border-[#D9DED2] p-4 flex flex-col sm:flex-row gap-3">
        <Input
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add an item (e.g., House keys, Laptop charger, Sunglasses)..."
          className="flex-1"
          required
        />
        <div className="w-full sm:w-56 shrink-0">
          <Select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            options={PRESET_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={adding}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Add Item
        </Button>
      </form>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['All', ...PRESET_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#526F52] text-white shadow-xs'
                : 'bg-white text-[#7C877D] border border-[#D9DED2] hover:bg-[#EBEFE4] hover:text-[#26332C]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading your carry list..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-6 h-6" />}
          title={selectedCategory === 'All' ? 'Your Carry List is empty' : `No items in ${selectedCategory}`}
          description="Add items above that you need to take along before stepping out."
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#D9DED2] divide-y divide-[#D9DED2] overflow-hidden">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className={`p-3.5 flex items-center justify-between transition-colors ${
                item.checked ? 'bg-[#F8F9F5]' : 'hover:bg-[#F4F6EE]'
              }`}
            >
              <div
                onClick={() => handleToggle(item._id)}
                className="flex items-center gap-3.5 flex-1 cursor-pointer select-none"
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                    item.checked
                      ? 'bg-[#526F52] border-[#526F52] text-white'
                      : 'border-[#C8CEC1] hover:border-[#526F52]'
                  }`}
                >
                  {item.checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>

                <div className="min-w-0">
                  <span
                    className={`text-sm font-medium ${
                      item.checked ? 'line-through text-[#7C877D]' : 'text-[#26332C]'
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.category && (
                    <span className="text-[11px] text-[#7C877D] block mt-0.5">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDelete(item._id)}
                className="p-1.5 rounded text-[#7C877D] hover:text-[#D9534F] hover:bg-[#EBEFE4] transition-colors cursor-pointer shrink-0"
                aria-label="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

