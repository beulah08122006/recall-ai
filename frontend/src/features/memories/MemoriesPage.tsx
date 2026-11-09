import React, { useEffect, useState, useMemo } from 'react';
import { memoryService } from '../../services/memoryService';
import { Memory } from '../../types';
import { MemoryCard } from './MemoryCard';
import { MemoryModal } from './MemoryModal';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import { Plus, Brain } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Personal',
  'Important dates',
  'Notes',
  'Experiences',
  'Places',
  'Preferences',
  'Other',
];

export const MemoriesPage: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const data = await memoryService.getMemories();
      setMemories(data);
    } catch (err: any) {
      toast.error('Failed to load memories', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const filteredMemories = useMemo(() => {
    return memories.filter((mem) => {
      const matchesSearch =
        search === '' ||
        mem.title.toLowerCase().includes(search.toLowerCase()) ||
        mem.description.toLowerCase().includes(search.toLowerCase()) ||
        (mem.tags && mem.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) ||
        (mem.personName && mem.personName.toLowerCase().includes(search.toLowerCase()));

      const matchesCat =
        selectedCategory === 'All' || mem.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [memories, search, selectedCategory]);

  const handleCreateOrUpdate = async (data: Partial<Memory>) => {
    try {
      setSubmitting(true);
      if (editingMemory) {
        const updated = await memoryService.updateMemory(editingMemory._id, data);
        setMemories((prev) => prev.map((m) => (m._id === updated._id ? updated : m)));
        toast.success('Memory updated', 'Your changes have been saved.');
      } else {
        const created = await memoryService.createMemory(data);
        setMemories((prev) => [created, ...prev]);
        toast.success('Memory saved', 'Stored securely in your memory vault.');
      }
      setModalOpen(false);
      setEditingMemory(null);
    } catch (err: any) {
      toast.error('Failed to save memory', err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await memoryService.deleteMemory(deletingId);
      setMemories((prev) => prev.filter((m) => m._id !== deletingId));
      toast.success('Memory deleted', 'Record removed successfully.');
    } catch (err: any) {
      toast.error('Failed to delete', err.message);
    } finally {
      setSubmitting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DED2]">
        <div>
          <h1 className="text-2xl font-bold text-[#26332C] tracking-tight">Memories</h1>
          <p className="text-sm text-[#7C877D] mt-0.5">
            Store, search, and recall everything that matters to you.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingMemory(null);
            setModalOpen(true);
          }}
        >
          Add Memory
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by keywords, tags, or names..."
          className="w-full md:max-w-md"
        />

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
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
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Retrieving your memories..." />
      ) : filteredMemories.length === 0 ? (
        <EmptyState
          icon={<Brain className="w-6 h-6" />}
          title={search ? 'No matching memories found' : 'Your memory vault is empty'}
          description={
            search
              ? 'Try adjusting your search query or switching categories.'
              : 'Add your first memory to keep track of important personal information, dates, and experiences.'
          }
          actionLabel={search ? 'Clear Search' : 'Add Memory'}
          onAction={() => {
            if (search) {
              setSearch('');
              setSelectedCategory('All');
            } else {
              setEditingMemory(null);
              setModalOpen(true);
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemories.map((mem) => (
            <MemoryCard
              key={mem._id}
              memory={mem}
              onEdit={(m) => {
                setEditingMemory(m);
                setModalOpen(true);
              }}
              onDelete={(id) => setDeletingId(id)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <MemoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingMemory(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingMemory}
        isLoading={submitting}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Memory"
        message="Are you sure you want to permanently delete this memory? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive
        isLoading={submitting}
      />
    </div>
  );
};

