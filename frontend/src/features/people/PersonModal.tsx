import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Person } from '../../types';

export interface PersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Person>) => Promise<void>;
  initialData?: Person | null;
  isLoading?: boolean;
}

export const PersonModal: React.FC<PersonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setContact(initialData.contact || '');
        setNotes(initialData.notes || '');
      } else {
        setName('');
        setContact('');
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    await onSubmit({
      name: name.trim(),
      contact: contact.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Contact / Person' : 'Add Person'}
      description="Save a person to link items, memories, and reminders."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Sarah Miller"
          error={error}
          required
        />

        <Input
          label="Contact Details (Optional)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Phone, email, or social handle"
        />

        <Textarea
          label="Notes / Relationship (Optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., College roommate, lives on 5th Ave"
          rows={3}
        />

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#D9DED2]">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Update Person' : 'Save Person'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

