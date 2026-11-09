import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Handshake,
  Bell,
  Brain,
  Calendar,
  Clock,
  User,
  Tag,
  RefreshCw,
  Send,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { assistantService } from '../../services/assistantService';
import { itemService } from '../../services/itemService';
import { reminderService } from '../../services/reminderService';
import { memoryService } from '../../services/memoryService';
import {
  NaturalLanguageExtraction,
  ItemDirection,
  ReminderPriority,
  MemoryCategory,
  ContradictionCheckResult,
} from '../../types';

export interface QuickAiEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (type: 'item' | 'reminder' | 'memory', created: any) => void;
}

const SAMPLE_PROMPTS = [
  'I lent my charger to Arun until Friday',
  'I borrowed DSLR camera from Sarah until next Monday',
  'Remind me to call Mom tomorrow at 6pm',
  'WiFi password for the guest room is RecallGuest2026',
];

export const QuickAiEntryModal: React.FC<QuickAiEntryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [inputText, setInputText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extraction, setExtraction] = useState<NaturalLanguageExtraction | null>(null);
  const [selectedType, setSelectedType] = useState<'item' | 'reminder' | 'memory'>('item');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [contradiction, setContradiction] = useState<ContradictionCheckResult | null>(null);

  // Editable item fields
  const [itemName, setItemName] = useState('');
  const [direction, setDirection] = useState<ItemDirection>('lent');
  const [personName, setPersonName] = useState('');
  const [itemDate, setItemDate] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [itemNotes, setItemNotes] = useState('');

  // Editable reminder fields
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [reminderPriority, setReminderPriority] = useState<ReminderPriority>('medium');
  const [reminderDescription, setReminderDescription] = useState('');

  // Editable memory fields
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryDescription, setMemoryDescription] = useState('');
  const [memoryCategory, setMemoryCategory] = useState<string>('Personal');
  const [memoryTags, setMemoryTags] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setInputText('');
      setExtraction(null);
      setSaveSuccess(null);
      setContradiction(null);
    }
  }, [isOpen]);

  const handleExtract = async (textToExtract?: string) => {
    const text = (textToExtract || inputText).trim();
    if (!text) return;

    try {
      setIsExtracting(true);
      setSaveSuccess(null);
      setContradiction(null);

      const result = await assistantService.extract(text);
      setExtraction(result);
      setSelectedType(result.type);

      const todayIso = new Date().toISOString().split('T')[0];

      if (result.type === 'item' && result.itemData) {
        setItemName(result.itemData.itemName || '');
        setDirection(result.itemData.direction || 'lent');
        setPersonName(result.itemData.personName || '');
        setItemDate(result.itemData.date || todayIso);
        setExpectedReturnDate(result.itemData.expectedReturnDate || '');
        setItemNotes(result.itemData.notes || text);
      } else if (result.type === 'reminder' && result.reminderData) {
        setReminderTitle(result.reminderData.title || text);
        setReminderDate(result.reminderData.date || todayIso);
        setReminderTime(result.reminderData.time || '09:00');
        setReminderPriority(result.reminderData.priority || 'medium');
        setReminderDescription(result.reminderData.description || text);
      } else if (result.type === 'memory' && result.memoryData) {
        setMemoryTitle(result.memoryData.title || text);
        setMemoryDescription(result.memoryData.description || text);
        setMemoryCategory(result.memoryData.category || 'Personal');
        setMemoryTags((result.memoryData.tags || []).join(', '));

        // Check for contradiction or existing duplicate
        try {
          const conflictRes = await assistantService.checkConflict(
            result.memoryData.title,
            result.memoryData.description
          );
          if (conflictRes.hasConflict) {
            setContradiction(conflictRes);
          }
        } catch (e) {
          console.warn('Contradiction check bypassed:', e);
        }
      }
    } catch (err) {
      console.error('Extraction failed', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInputText(prompt);
    handleExtract(prompt);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let createdResult: any = null;

      if (selectedType === 'item') {
        if (!itemName.trim() || !personName.trim()) {
          alert('Please enter both the item name and person name.');
          setIsSaving(false);
          return;
        }

        createdResult = await itemService.createItem({
          itemName: itemName.trim(),
          direction,
          personName: personName.trim(),
          date: itemDate || new Date().toISOString().split('T')[0],
          expectedReturnDate: expectedReturnDate || undefined,
          status: 'active',
          notes: itemNotes.trim() || undefined,
        });

        setSaveSuccess(`Successfully recorded ${direction === 'lent' ? 'lent' : 'borrowed'} item: "${itemName}" with ${personName}!`);
      } else if (selectedType === 'reminder') {
        if (!reminderTitle.trim() || !reminderDate.trim()) {
          alert('Please provide a title and date for the reminder.');
          setIsSaving(false);
          return;
        }

        createdResult = await reminderService.createReminder({
          title: reminderTitle.trim(),
          date: reminderDate,
          time: reminderTime || undefined,
          priority: reminderPriority,
          status: 'pending',
          description: reminderDescription.trim() || undefined,
        });

        setSaveSuccess(`Successfully scheduled reminder: "${reminderTitle}"!`);
      } else if (selectedType === 'memory') {
        if (!memoryTitle.trim() || !memoryDescription.trim()) {
          alert('Please provide both title and description for the memory.');
          setIsSaving(false);
          return;
        }

        const tagsArray = memoryTags
          .split(',')
          .map((t) => t.trim().replace(/^#/, ''))
          .filter(Boolean);

        createdResult = await memoryService.createMemory({
          title: memoryTitle.trim(),
          description: memoryDescription.trim(),
          category: memoryCategory,
          tags: tagsArray,
        });

        setSaveSuccess(`Successfully stored memory: "${memoryTitle}"!`);
      }

      if (onSuccess && createdResult) {
        onSuccess(selectedType, createdResult);
      }
    } catch (err: any) {
      console.error('Failed to save entity', err);
      alert(err?.response?.data?.message || 'Failed to save entity.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Universal AI Quick Entry"
      description="Speak or type naturally. Recall AI automatically extracts the entity, dates, people, and details for your confirmation."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Input Bar */}
        <div>
          <label className="block text-xs font-semibold text-[#26332C] mb-1.5 uppercase tracking-wider">
            What do you want Recall AI to remember?
          </label>
          <div className="relative">
            <Textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleExtract();
                }
              }}
              placeholder="e.g., 'I lent my charger to Arun until Friday' or 'Remind me to call Mom tomorrow at 6pm'..."
              className="pr-24"
            />
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleExtract()}
                isLoading={isExtracting}
                disabled={!inputText.trim()}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-white" />}
              >
                Extract
              </Button>
            </div>
          </div>
          <p className="text-[11px] text-[#7C877D] mt-1.5 flex items-center justify-between">
            <span>Press Ctrl+Enter to extract</span>
            <span>Supports items, reminders, and personal knowledge</span>
          </p>
        </div>

        {/* Quick Sample Chips */}
        {!extraction && !saveSuccess && (
          <div>
            <span className="text-[11px] font-semibold text-[#7C877D] uppercase tracking-wider block mb-2">
              Try an example:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePromptClick(prompt)}
                  className="text-xs bg-[#F4F6EE] hover:bg-[#EBEFE4] text-[#26332C] border border-[#D9DED2] px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Success Confirmation Banner */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-[#EBF2E8] border border-[#62896A]/40 text-[#26332C] space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-[#3D6645] font-semibold text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#62896A]" />
              <span>{saveSuccess}</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#62896A]/20">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setInputText('');
                  setExtraction(null);
                  setSaveSuccess(null);
                }}
              >
                Add Another Entry
              </Button>
              <Button variant="primary" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Extraction Preview Card */}
        {extraction && !saveSuccess && (
          <div className="bg-[#FAFBF7] rounded-xl border border-[#D9DED2] p-4 space-y-4">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#D9DED2]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#26332C] uppercase tracking-wider">
                  Detected Entity:
                </span>
                <div className="flex rounded-lg bg-[#EBEFE4] p-0.5 border border-[#D9DED2]">
                  <button
                    type="button"
                    onClick={() => setSelectedType('item')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      selectedType === 'item'
                        ? 'bg-[#526F52] text-white shadow-xs'
                        : 'text-[#7C877D] hover:text-[#26332C]'
                    }`}
                  >
                    Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('reminder')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      selectedType === 'reminder'
                        ? 'bg-[#526F52] text-white shadow-xs'
                        : 'text-[#7C877D] hover:text-[#26332C]'
                    }`}
                  >
                    Reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('memory')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      selectedType === 'memory'
                        ? 'bg-[#526F52] text-white shadow-xs'
                        : 'text-[#7C877D] hover:text-[#26332C]'
                    }`}
                  >
                    Memory
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#7C877D]">
                  Confidence: {Math.round((extraction.confidence || 0.9) * 100)}%
                </span>
                <Badge variant="accent" size="sm">
                  Extracted via NLP
                </Badge>
              </div>
            </div>

            {/* Contradiction / Duplicate Alert if found */}
            {contradiction && (
              <div className="p-3 rounded-lg bg-[#FDF6E2] border border-[#C58B52]/40 text-[#26332C]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#9E642A] mb-1">
                  <AlertTriangle className="w-4 h-4 text-[#C58B52]" />
                  <span>Potential Contradiction / Similar Memory Found</span>
                </div>
                <p className="text-xs text-[#7C877D] leading-snug">
                  {contradiction.suggestion || contradiction.reason}
                </p>
                {contradiction.existingRecord && (
                  <p className="text-xs font-medium text-[#26332C] mt-1 italic">
                    Existing Record: "{contradiction.existingRecord.title}" — {contradiction.existingRecord.description}
                  </p>
                )}
                <p className="text-[11px] text-[#9E642A] mt-1.5 font-medium">
                  💡 Review the details below before saving to avoid duplicate records.
                </p>
              </div>
            )}

            {/* Conditional Entity Form */}
            {selectedType === 'item' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Item Name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g., Charger, Book, Jacket"
                    required
                  />
                  <div>
                    <label className="block text-xs font-semibold text-[#26332C] mb-1.5 uppercase tracking-wider">
                      Direction
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDirection('lent')}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-colors ${
                          direction === 'lent'
                            ? 'bg-[#526F52] text-white border-[#526F52]'
                            : 'bg-white text-[#26332C] border-[#D9DED2] hover:bg-[#F4F6EE]'
                        }`}
                      >
                        Lent to someone
                      </button>
                      <button
                        type="button"
                        onClick={() => setDirection('borrowed')}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-colors ${
                          direction === 'borrowed'
                            ? 'bg-[#526F52] text-white border-[#526F52]'
                            : 'bg-white text-[#26332C] border-[#D9DED2] hover:bg-[#F4F6EE]'
                        }`}
                      >
                        Borrowed from someone
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label={direction === 'lent' ? 'Lent To (Person)' : 'Borrowed From (Person)'}
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="e.g., Arun, Sarah"
                    required
                  />
                  <Input
                    type="date"
                    label="Date"
                    value={itemDate}
                    onChange={(e) => setItemDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    label="Expected Return (Optional)"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                  />
                </div>

                <Input
                  label="Context / Notes"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="Additional context or notes..."
                />
              </div>
            )}

            {selectedType === 'reminder' && (
              <div className="space-y-3">
                <Input
                  label="Reminder Title"
                  value={reminderTitle}
                  onChange={(e) => setReminderTitle(e.target.value)}
                  placeholder="e.g., Call Mom, Pick up dry cleaning"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    type="date"
                    label="Date"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    required
                  />
                  <Input
                    type="time"
                    label="Time (Optional)"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                  />
                  <Select
                    label="Priority"
                    value={reminderPriority}
                    onChange={(e) => setReminderPriority(e.target.value as ReminderPriority)}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                    ]}
                  />
                </div>

                <Textarea
                  label="Notes / Context"
                  value={reminderDescription}
                  onChange={(e) => setReminderDescription(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            {selectedType === 'memory' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Memory Title"
                    value={memoryTitle}
                    onChange={(e) => setMemoryTitle(e.target.value)}
                    placeholder="e.g., WiFi password, Passport number"
                    required
                  />
                  <Select
                    label="Category"
                    value={memoryCategory}
                    onChange={(e) => setMemoryCategory(e.target.value)}
                    options={[
                      { value: 'Personal', label: 'Personal' },
                      { value: 'Important dates', label: 'Important dates' },
                      { value: 'Notes', label: 'Notes' },
                      { value: 'Experiences', label: 'Experiences' },
                      { value: 'Places', label: 'Places' },
                      { value: 'Preferences', label: 'Preferences' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                </div>

                <Textarea
                  label="Details / Description"
                  value={memoryDescription}
                  onChange={(e) => setMemoryDescription(e.target.value)}
                  rows={3}
                  required
                />

                <Input
                  label="Tags (Comma separated)"
                  value={memoryTags}
                  onChange={(e) => setMemoryTags(e.target.value)}
                  placeholder="e.g., wifi, tech, home"
                />
              </div>
            )}

            {/* Confirmation actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#D9DED2]">
              <span className="text-xs text-[#7C877D]">
                Confirm details before persisting to Recall AI.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setExtraction(null);
                    setContradiction(null);
                  }}
                  disabled={isSaving}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  isLoading={isSaving}
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                >
                  Confirm & Save {selectedType === 'item' ? 'Item' : selectedType === 'reminder' ? 'Reminder' : 'Memory'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
