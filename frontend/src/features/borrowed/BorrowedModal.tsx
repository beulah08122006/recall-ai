import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Item, ItemDirection, ItemStatus, Person } from '../../types';
import { peopleService } from '../../services/peopleService';

export interface BorrowedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Item>) => Promise<void>;
  initialData?: Item | null;
  isLoading?: boolean;
}

export const BorrowedModal: React.FC<BorrowedModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [direction, setDirection] = useState<ItemDirection>('lent');
  const [personName, setPersonName] = useState('');
  const [personId, setPersonId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [status, setStatus] = useState<ItemStatus>('active');
  const [notes, setNotes] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [isNewPerson, setIsNewPerson] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [errors, setErrors] = useState<{ itemName?: string; person?: string }>({});

  useEffect(() => {
    if (isOpen) {
      peopleService.getPeople().then(setPeople).catch(console.error);
      if (initialData) {
        setItemName(initialData.itemName);
        setDescription(initialData.description || '');
        setDirection(initialData.direction);
        setPersonName(initialData.personName);
        setPersonId(initialData.personId || '');
        setDate(initialData.date ? initialData.date.split('T')[0] : '');
        setExpectedReturnDate(initialData.expectedReturnDate ? initialData.expectedReturnDate.split('T')[0] : '');
        setStatus(initialData.status);
        setNotes(initialData.notes || '');
        setIsNewPerson(false);
        setNewPersonName('');
      } else {
        setItemName('');
        setDescription('');
        setDirection('lent');
        setPersonName('');
        setPersonId('');
        setDate(new Date().toISOString().split('T')[0]);
        setExpectedReturnDate('');
        setStatus('active');
        setNotes('');
        setIsNewPerson(false);
        setNewPersonName('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handlePersonSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__new__') {
      setIsNewPerson(true);
      setPersonId('');
      setPersonName('');
    } else {
      setIsNewPerson(false);
      setPersonId(val);
      const found = people.find((p) => p._id === val);
      setPersonName(found ? found.name : '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { itemName?: string; person?: string } = {};

    if (!itemName.trim()) newErrors.itemName = 'Item name is required';

    let resolvedPersonName = personName;
    let resolvedPersonId = personId;

    if (isNewPerson) {
      if (!newPersonName.trim()) {
        newErrors.person = 'Person name is required';
      } else {
        resolvedPersonName = newPersonName.trim();
        try {
          const created = await peopleService.createPerson({ name: resolvedPersonName });
          resolvedPersonId = created._id;
        } catch (err) {
          console.error('Failed to auto-create person', err);
        }
      }
    } else if (!personName.trim()) {
      newErrors.person = 'Please select or add a person';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      itemName: itemName.trim(),
      description: description.trim() || undefined,
      direction,
      personName: resolvedPersonName,
      personId: resolvedPersonId || undefined,
      date,
      expectedReturnDate: expectedReturnDate || undefined,
      status,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Item' : 'Track Borrowed / Lent Item'}
      description="Keep an exact record of items and expected returns."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Direction Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#EBEFE4] rounded-lg">
          <button
            type="button"
            onClick={() => setDirection('lent')}
            className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              direction === 'lent'
                ? 'bg-white text-[#26332C] shadow-xs'
                : 'text-[#7C877D] hover:text-[#26332C]'
            }`}
          >
            I Lent Something (Outgoing)
          </button>
          <button
            type="button"
            onClick={() => setDirection('borrowed')}
            className={`py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              direction === 'borrowed'
                ? 'bg-white text-[#26332C] shadow-xs'
                : 'text-[#7C877D] hover:text-[#26332C]'
            }`}
          >
            I Borrowed Something (Incoming)
          </button>
        </div>

        <Input
          label="Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="e.g., Camping tent, Calculus textbook, Sony headphones"
          error={errors.itemName}
          required
        />

        {/* Person Selector */}
        {!isNewPerson ? (
          <div>
            <Select
              label={direction === 'lent' ? 'Lent To (Person)' : 'Borrowed From (Person)'}
              value={personId}
              onChange={handlePersonSelectChange}
              options={[
                { value: '', label: 'Select a person...' },
                ...people.map((p) => ({ value: p._id, label: p.name })),
                { value: '__new__', label: '+ Add a new person...' },
              ]}
              error={errors.person}
            />
          </div>
        ) : (
          <div className="space-y-1">
            <Input
              label={`New Person Name (${direction === 'lent' ? 'Recipient' : 'Owner'})`}
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              placeholder="e.g., Sarah Miller"
              error={errors.person}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setIsNewPerson(false)}
                  className="text-xs text-[#526F52] font-semibold hover:underline"
                >
                  Choose existing
                </button>
              }
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Transaction Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Input
            label="Expected Return Date (Optional)"
            type="date"
            value={expectedReturnDate}
            onChange={(e) => setExpectedReturnDate(e.target.value)}
          />
        </div>

        <Textarea
          label="Notes / Condition / Location"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Lent for the weekend trip, remember to check power cable on return"
          rows={3}
        />

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#D9DED2]">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Update Record' : 'Save Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

