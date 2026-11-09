import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Routine } from '../../types';
import { X, Plus } from 'lucide-react';

export interface RoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Routine>) => Promise<void>;
  initialData?: Routine | null;
  isLoading?: boolean;
}

export const RoutineModal: React.FC<RoutineModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [activity, setActivity] = useState('');
  const [destination, setDestination] = useState('');
  const [itemInput, setItemInput] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ name?: string; items?: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setActivity(initialData.activity);
        setDestination(initialData.destination || '');
        setItems(initialData.items || []);
        setNotes(initialData.notes || '');
      } else {
        setName('');
        setActivity('Work');
        setDestination('');
        setItems(['Laptop', 'Charger', 'House Keys', 'Wallet']);
        setNotes('');
      }
      setItemInput('');
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleAddItem = () => {
    if (itemInput.trim()) {
      if (!items.includes(itemInput.trim())) {
        setItems([...items, itemInput.trim()]);
      }
      setItemInput('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; items?: string } = {};

    if (!name.trim()) newErrors.name = 'Routine name is required';
    if (items.length === 0) newErrors.items = 'Please add at least one item to this routine';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      name: name.trim(),
      activity: activity.trim() || 'General',
      destination: destination.trim() || undefined,
      items,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Routine' : 'Create Departure Routine'}
      description="Save a reusable checklist for specific destinations or activities."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Routine Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Daily Office Commute, Gym Workout, Flight Travel"
          error={errors.name}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Activity Type"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="e.g., Work, Sports, Travel"
          />

          <Input
            label="Destination (Optional)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g., Downtown Office, Terminal 2"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#26332C] mb-1.5 uppercase tracking-wider">
            Items to Pack / Check
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={itemInput}
              onChange={(e) => setItemInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
              placeholder="Add item (press Enter)..."
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleAddItem}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add
            </Button>
          </div>

          {errors.items && <p className="text-xs text-[#D9534F] mb-2">{errors.items}</p>}

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-[#EBEFE4]/60 rounded-lg border border-[#D9DED2]">
            {items.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-xs bg-white text-[#26332C] border border-[#D9DED2] px-2.5 py-1 rounded-md"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="text-[#7C877D] hover:text-[#D9534F] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <Textarea
          label="Routine Notes (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Lock the back patio door, unplug the iron"
          rows={2}
        />

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#D9DED2]">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Create Routine'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

