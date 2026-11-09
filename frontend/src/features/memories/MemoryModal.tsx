import React, { useEffect, useState } from 'react';
import { AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Memory, MemoryCategory, Person, ContradictionCheckResult } from '../../types';
import { peopleService } from '../../services/peopleService';
import { assistantService } from '../../services/assistantService';

export interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Memory>) => Promise<void>;
  initialData?: Memory | null;
  isLoading?: boolean;
}


const CATEGORIES: { value: MemoryCategory; label: string }[] = [
  { value: 'Personal', label: 'Personal' },
  { value: 'Important dates', label: 'Important dates' },
  { value: 'Notes', label: 'Notes' },
  { value: 'Experiences', label: 'Experiences' },
  { value: 'Places', label: 'Places' },
  { value: 'Preferences', label: 'Preferences' },
  { value: 'Other', label: 'Other' },
];

export const MemoryModal: React.FC<MemoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Personal');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [personId, setPersonId] = useState('');
  const [personName, setPersonName] = useState('');
  const [relatedItem, setRelatedItem] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const [conflict, setConflict] = useState<ContradictionCheckResult | null>(null);
  const [checkingConflict, setCheckingConflict] = useState(false);

  useEffect(() => {
    if (isOpen) {
      peopleService.getPeople().then(setPeople).catch(console.error);
      setConflict(null);
      if (initialData) {

        setTitle(initialData.title);
        setDescription(initialData.description);
        setCategory(initialData.category || 'Personal');
        setTags(initialData.tags || []);
        setPersonId(initialData.personId || '');
        setPersonName(initialData.personName || '');
        setRelatedItem(initialData.relatedItem || '');
      } else {
        setTitle('');
        setDescription('');
        setCategory('Personal');
        setTags([]);
        setTagInput('');
        setPersonId('');
        setPersonName('');
        setRelatedItem('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handlePersonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setPersonId(pId);
    const found = people.find((p) => p._id === pId);
    setPersonName(found ? found.name : '');
  };

  const handleCheckConflict = async () => {
    // Only check if creating a new memory or title/desc changed
    if (!title.trim() && !description.trim()) return;
    try {
      setCheckingConflict(true);
      const res = await assistantService.checkConflict(title.trim(), description.trim());
      if (res && res.hasConflict) {
        // If initialData exists and conflict is with the same memory, ignore
        if (initialData && res.existingRecord && res.existingRecord.id === initialData._id) {
          setConflict(null);
        } else {
          setConflict(res);
        }
      } else {
        setConflict(null);
      }
    } catch (err) {
      console.warn('Conflict check failed', err);
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; description?: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      tags,
      personId: personId || undefined,
      personName: personName || undefined,
      relatedItem: relatedItem.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Memory' : 'Create Memory'}
      description="Record important personal knowledge, notes, or facts."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleCheckConflict}
          placeholder="e.g., Mom's Passport Number or WiFi in Berlin flat"
          error={errors.title}
          required
        />

        <Textarea
          label="Description / Content"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleCheckConflict}
          placeholder="Enter the full details, context, code, or memory..."
          rows={4}
          error={errors.description}
          required
        />

        {/* Contradiction / Duplicate Detection Alert Banner */}
        {conflict && (
          <div className="p-3.5 rounded-lg bg-[#FDF6E2] border border-[#C58B52]/40 text-[#26332C] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#9E642A]">
                <AlertTriangle className="w-4 h-4 text-[#C58B52]" />
                <span>Memory Contradiction / Duplicate Detected</span>
              </div>
              <button
                type="button"
                onClick={() => setConflict(null)}
                className="text-xs text-[#7C877D] hover:text-[#26332C] cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs text-[#7C877D] leading-snug">
              {conflict.suggestion}
            </p>
            {conflict.existingRecord && (
              <div className="p-2.5 rounded bg-white/70 border border-[#D9DED2] text-xs">
                <span className="font-semibold text-[#26332C]">Existing Record: </span>
                <span className="text-[#26332C] font-medium">{conflict.existingRecord.title}</span>
                <p className="text-[#7C877D] text-[11px] mt-0.5 whitespace-pre-wrap">{conflict.existingRecord.description}</p>
              </div>
            )}
            <p className="text-[11px] font-medium text-[#9E642A]">
              💡 {conflict.suggestion || 'Review to prevent duplicate or conflicting information.'}
            </p>
          </div>
        )}


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={CATEGORIES}
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
          placeholder="e.g., Blue suitcase, Spare car key"
        />

        <div>
          <label className="block text-xs font-semibold text-[#26332C] mb-1.5 uppercase tracking-wider">
            Tags (Press Enter or Comma)
          </label>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type tag and press enter (e.g., travel, medical, finance)"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs bg-[#EBEFE4] text-[#26332C] px-2 py-1 rounded-md"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[#7C877D] hover:text-[#D9534F] cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#D9DED2]">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Create Memory'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

