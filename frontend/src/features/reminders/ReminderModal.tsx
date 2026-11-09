import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Reminder, ReminderPriority, Person } from '../../types';
import { peopleService } from '../../services/peopleService';

export interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Reminder>) => Promise<void>;
  initialData?: Reminder | null;
  isLoading?: boolean;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00');
  const [priority, setPriority] = useState<ReminderPriority>('medium');
  const [personId, setPersonId] = useState('');
  const [personName, setPersonName] = useState('');
  const [relatedItem, setRelatedItem] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [errors, setErrors] = useState<{ title?: string; date?: string }>({});

  useEffect(() => {
    if (isOpen) {
      peopleService.getPeople().then(setPeople).catch(console.error);
      if (initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || '');
        setDate(initialData.date ? initialData.date.split('T')[0] : '');
        setTime(initialData.time || '09:00');
        setPriority(initialData.priority || 'medium');
        setPersonId(initialData.personId || '');
        setPersonName(initialData.personName || '');
        setRelatedItem(initialData.relatedItem || '');
      } else {
        setTitle('');
        setDescription('');
        setDate(new Date().toISOString().split('T')[0]);
        setTime('09:00');
        setPriority('medium');
        setPersonId('');
        setPersonName('');
        setRelatedItem('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handlePersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setPersonId(pId);
    const found = people.find((p) => p._id === pId);
    setPersonName(found ? found.name : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; date?: string } = {};

    if (!title.trim()) newErrors.title = 'Title is required';
    if (!date) newErrors.date = 'Date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time: time || undefined,
      priority,
      personId: personId || undefined,
      personName: personName || undefined,
      relatedItem: relatedItem.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Reminder' : 'Create Reminder'}
      description="Set a timely notification for an event, follow-up, or task."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Reminder Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Pay apartment electricity bill"
          error={errors.title}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
            required
          />

          <Input
            label="Time (Optional)"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value as ReminderPriority)}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />

          <Select
            label="Related Person (Optional)"
            value={personId}
            onChange={handlePersonChange}
            options={[
              { value: '', label: 'None' },
              ...people.map((p) => ({ value: p._id, label: p.name })),
            ]}
          />
        </div>

        <Input
          label="Related Item (Optional)"
          value={relatedItem}
          onChange={(e) => setRelatedItem(e.target.value)}
          placeholder="e.g., Return car keys, Library book"
        />

        <Textarea
          label="Notes / Instructions (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any additional details or instructions..."
          rows={3}
        />

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#D9DED2]">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Update Reminder' : 'Set Reminder'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

