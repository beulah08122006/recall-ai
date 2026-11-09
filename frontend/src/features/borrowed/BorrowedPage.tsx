import React, { useEffect, useState, useMemo } from 'react';
import { itemService } from '../../services/itemService';
import { Item, ItemDirection, ItemStatus } from '../../types';
import { BorrowedModal } from './BorrowedModal';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import {
  Handshake,
  Plus,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';

type TabType = 'all' | 'lent' | 'borrowed' | 'overdue' | 'returned';

export const BorrowedPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await itemService.getItems();
      setItems(data);
    } catch (err: any) {
      toast.error('Failed to load items', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        search === '' ||
        item.itemName.toLowerCase().includes(search.toLowerCase()) ||
        item.personName.toLowerCase().includes(search.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeTab === 'all') return item.status !== 'returned';
      if (activeTab === 'lent') return item.direction === 'lent' && item.status !== 'returned';
      if (activeTab === 'borrowed') return item.direction === 'borrowed' && item.status !== 'returned';
      if (activeTab === 'overdue') return item.status === 'overdue';
      if (activeTab === 'returned') return item.status === 'returned';

      return true;
    });
  }, [items, search, activeTab]);

  const handleCreateOrUpdate = async (data: Partial<Item>) => {
    try {
      setSubmitting(true);
      if (editingItem) {
        const updated = await itemService.updateItem(editingItem._id, data);
        setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
        toast.success('Item updated', 'Changes have been saved.');
      } else {
        const created = await itemService.createItem(data);
        setItems((prev) => [created, ...prev]);
        toast.success('Item recorded', 'Tracking started for this item.');
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      toast.error('Failed to save item', err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkReturned = async (id: string) => {
    try {
      const updated = await itemService.markReturned(id);
      setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
      toast.success('Marked as returned', 'Item status updated to returned.');
    } catch (err: any) {
      toast.error('Failed to update status', err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await itemService.deleteItem(deletingId);
      setItems((prev) => prev.filter((i) => i._id !== deletingId));
      toast.success('Item removed', 'Item record deleted.');
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
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const overdueCount = items.filter((i) => i.status === 'overdue').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D9DED2]">
        <div>
          <h1 className="text-2xl font-bold text-[#26332C] tracking-tight">Borrowed & Lent</h1>
          <p className="text-sm text-[#7C877D] mt-0.5">
            Keep track of what you lent to friends and what you borrowed.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
        >
          Track Item
        </Button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by item name or person..."
          className="w-full md:max-w-md"
        />

        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#D9DED2] rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#526F52] text-white shadow-xs'
                : 'text-[#7C877D] hover:text-[#26332C]'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('lent')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'lent'
                ? 'bg-[#526F52] text-white shadow-xs'
                : 'text-[#7C877D] hover:text-[#26332C]'
            }`}
          >
            Lent Out
          </button>
          <button
            onClick={() => setActiveTab('borrowed')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'borrowed'
                ? 'bg-[#526F52] text-white shadow-xs'
                : 'text-[#7C877D] hover:text-[#26332C]'
            }`}
          >
            Borrowed
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
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
            onClick={() => setActiveTab('returned')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'returned'
                ? 'bg-[#62896A] text-white shadow-xs'
                : 'text-[#7C877D] hover:text-[#26332C]'
            }`}
          >
            Returned
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading your items..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Handshake className="w-6 h-6" />}
          title={search ? 'No items found' : 'No items in this view'}
          description={
            search
              ? 'Try modifying your search query.'
              : activeTab === 'overdue'
              ? 'Great news! You have zero overdue items.'
              : 'Start logging items you lend to family or borrow from colleagues.'
          }
          actionLabel={search ? 'Clear Search' : 'Track New Item'}
          onAction={() => {
            if (search) setSearch('');
            else {
              setEditingItem(null);
              setModalOpen(true);
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isOverdue = item.status === 'overdue';
            const isReturned = item.status === 'returned';

            return (
              <div
                key={item._id}
                className={`bg-white rounded-xl border p-5 transition-all flex flex-col justify-between ${
                  isOverdue
                    ? 'border-[#C58B52]/40 bg-[#FFFDF9]'
                    : isReturned
                    ? 'border-[#D9DED2] opacity-80'
                    : 'border-[#D9DED2] hover:border-[#526F52]/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-[#26332C] leading-snug">
                        {item.itemName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-[#7C877D] mt-1">
                        <User className="w-3.5 h-3.5 text-[#526F52]" />
                        <span>
                          {item.direction === 'lent' ? 'Lent to' : 'Borrowed from'}{' '}
                          <strong className="text-[#26332C] font-semibold">{item.personName}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge
                        variant={item.direction === 'lent' ? 'accent' : 'warning'}
                        size="sm"
                      >
                        {item.direction === 'lent' ? 'Outgoing' : 'Incoming'}
                      </Badge>
                      {isOverdue && (
                        <Badge variant="warning" size="sm">
                          Overdue
                        </Badge>
                      )}
                      {isReturned && (
                        <Badge variant="success" size="sm">
                          Returned
                        </Badge>
                      )}
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-[#7C877D] mt-3 p-2.5 rounded-lg bg-[#EBEFE4]/60 leading-relaxed">
                      {item.notes}
                    </p>
                  )}

                  {/* Dates */}
                  <div className="mt-4 pt-3 border-t border-[#D9DED2] space-y-1.5 text-xs text-[#7C877D]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Date:
                      </span>
                      <span className="font-medium text-[#26332C]">{formatDate(item.date)}</span>
                    </div>

                    {item.expectedReturnDate && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Return By:
                        </span>
                        <span
                          className={`font-semibold ${
                            isOverdue ? 'text-[#C58B52]' : 'text-[#26332C]'
                          }`}
                        >
                          {formatDate(item.expectedReturnDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#D9DED2]">
                  {!isReturned ? (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Check className="w-3.5 h-3.5 text-[#62896A]" />}
                      onClick={() => handleMarkReturned(item._id)}
                    >
                      Mark Returned
                    </Button>
                  ) : (
                    <span className="text-xs text-[#62896A] font-medium flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setModalOpen(true);
                      }}
                      className="p-1 rounded text-[#7C877D] hover:text-[#526F52] hover:bg-[#EBEFE4] cursor-pointer"
                      aria-label="Edit item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(item._id)}
                      className="p-1 rounded text-[#7C877D] hover:text-[#D9534F] hover:bg-[#EBEFE4] cursor-pointer"
                      aria-label="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <BorrowedModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingItem}
        isLoading={submitting}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Item Record"
        message="Are you sure you want to permanently remove this item tracking record?"
        confirmLabel="Delete"
        isDestructive
        isLoading={submitting}
      />
    </div>
  );
};

