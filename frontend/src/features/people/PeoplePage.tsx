import React, { useEffect, useState, useMemo } from 'react';
import { peopleService, PersonDetail } from '../../services/peopleService';
import { Person } from '../../types';
import { PersonModal } from './PersonModal';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Brain,
  Handshake,
  Bell,
  Edit2,
  Trash2,
  ArrowRight,
} from 'lucide-react';

export const PeoplePage: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Detail modal state
  const [detailPerson, setDetailPerson] = useState<PersonDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const toast = useToast();

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const data = await peopleService.getPeople();
      setPeople(data);
    } catch (err: any) {
      toast.error('Failed to load contacts', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const filteredPeople = useMemo(() => {
    return people.filter((p) => {
      return (
        search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.contact && p.contact.toLowerCase().includes(search.toLowerCase())) ||
        (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [people, search]);

  const handleCreateOrUpdate = async (data: Partial<Person>) => {
    try {
      setSubmitting(true);
      if (editingPerson) {
        const updated = await peopleService.updatePerson(editingPerson._id, data);
        setPeople((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
        toast.success('Person updated', 'Changes have been saved.');
      } else {
        const created = await peopleService.createPerson(data as any);
        setPeople((prev) => [created, ...prev]);
        toast.success('Person added', 'New contact added to your network.');
      }
      setModalOpen(false);
      setEditingPerson(null);
    } catch (err: any) {
      toast.error('Failed to save person', err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const detail = await peopleService.getPersonDetail(id);
      setDetailPerson(detail);
    } catch (err: any) {
      toast.error('Failed to load person records', err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      setSubmitting(true);
      await peopleService.deletePerson(deletingId);
      setPeople((prev) => prev.filter((p) => p._id !== deletingId));
      if (detailPerson && detailPerson._id === deletingId) {
        setDetailPerson(null);
      }
      toast.success('Deleted', 'Person record removed.');
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
          <h1 className="text-2xl font-bold text-[#26332C] tracking-tight">People</h1>
          <p className="text-sm text-[#7C877D] mt-0.5">
            Manage contacts and see all linked memories, items, and reminders in one place.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setEditingPerson(null);
            setModalOpen(true);
          }}
        >
          Add Person
        </Button>
      </div>

      {/* Search */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search people by name, phone, or notes..."
        className="w-full md:max-w-md"
      />

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading people..." />
      ) : filteredPeople.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6" />}
          title={search ? 'No contacts match your query' : 'No people added yet'}
          description={
            search
              ? 'Try searching with a different name or note.'
              : 'Add people to track who you lend things to, share memories with, or need to contact.'
          }
          actionLabel={search ? 'Clear Search' : 'Add Person'}
          onAction={() => {
            if (search) setSearch('');
            else {
              setEditingPerson(null);
              setModalOpen(true);
            }
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person) => (
            <div
              key={person._id}
              className="bg-white rounded-xl border border-[#D9DED2] p-5 hover:border-[#526F52]/40 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#526F52]/10 text-[#526F52] flex items-center justify-center font-bold text-sm uppercase">
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#26332C]">{person.name}</h3>
                      {person.contact && (
                        <p className="text-xs text-[#7C877D] mt-0.5">{person.contact}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingPerson(person);
                        setModalOpen(true);
                      }}
                      className="p-1 rounded text-[#7C877D] hover:text-[#526F52] hover:bg-[#EBEFE4] cursor-pointer"
                      aria-label="Edit person"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(person._id)}
                      className="p-1 rounded text-[#7C877D] hover:text-[#D9534F] hover:bg-[#EBEFE4] cursor-pointer"
                      aria-label="Delete person"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {person.notes && (
                  <p className="text-xs text-[#7C877D] mb-4 bg-[#EBEFE4]/60 p-2.5 rounded-lg line-clamp-2">
                    {person.notes}
                  </p>
                )}
              </div>

              {/* Connected Records Button */}
              <div className="pt-3 border-t border-[#D9DED2]">
                <button
                  onClick={() => handleViewDetail(person._id)}
                  className="w-full py-2 px-3 rounded-lg bg-[#EBEFE4]/60 hover:bg-[#526F52]/10 text-[#26332C] hover:text-[#526F52] text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>View Connected Records</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Person Detail Records Modal */}
      {detailPerson && (
        <Modal
          isOpen={!!detailPerson}
          onClose={() => setDetailPerson(null)}
          title={detailPerson.name}
          description="Everything connected to this person across Recall AI"
          maxWidth="lg"
        >
          <div className="space-y-6">
            {detailPerson.contact && (
              <div className="p-3 bg-[#EBEFE4]/60 rounded-lg text-xs text-[#26332C]">
                <strong>Contact:</strong> {detailPerson.contact}
              </div>
            )}

            {/* Items */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-[#26332C]">
                <Handshake className="w-4 h-4 text-[#62896A]" />
                <span>Borrowed & Lent Items ({detailPerson.items?.length || 0})</span>
              </div>
              {!detailPerson.items || detailPerson.items.length === 0 ? (
                <p className="text-xs text-[#7C877D] italic p-3 bg-[#EBEFE4]/60 rounded-lg">
                  No items borrowed or lent with this person.
                </p>
              ) : (
                <div className="space-y-2">
                  {detailPerson.items.map((it) => (
                    <div
                      key={it._id}
                      className="p-3 border border-[#D9DED2] rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#26332C]">{it.itemName}</span>
                        <span className="text-[#7C877D] block">
                          {it.direction === 'lent' ? 'Lent out' : 'Borrowed'} • Status: {it.status}
                        </span>
                      </div>
                      <Badge
                        variant={
                          it.status === 'overdue'
                            ? 'danger'
                            : it.status === 'returned'
                            ? 'success'
                            : 'accent'
                        }
                        size="sm"
                      >
                        {it.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Memories */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-[#26332C]">
                <Brain className="w-4 h-4 text-[#526F52]" />
                <span>Related Memories ({detailPerson.memories?.length || 0})</span>
              </div>
              {!detailPerson.memories || detailPerson.memories.length === 0 ? (
                <p className="text-xs text-[#7C877D] italic p-3 bg-[#EBEFE4]/60 rounded-lg">
                  No memories linked to this person.
                </p>
              ) : (
                <div className="space-y-2">
                  {detailPerson.memories.map((m) => (
                    <div key={m._id} className="p-3 border border-[#D9DED2] rounded-lg text-xs">
                      <span className="font-semibold text-[#26332C] block">{m.title}</span>
                      <p className="text-[#7C877D] mt-0.5 line-clamp-2">{m.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reminders */}
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-[#26332C]">
                <Bell className="w-4 h-4 text-[#C58B52]" />
                <span>Related Reminders ({detailPerson.reminders?.length || 0})</span>
              </div>
              {!detailPerson.reminders || detailPerson.reminders.length === 0 ? (
                <p className="text-xs text-[#7C877D] italic p-3 bg-[#EBEFE4]/60 rounded-lg">
                  No reminders linked to this person.
                </p>
              ) : (
                <div className="space-y-2">
                  {detailPerson.reminders.map((r) => (
                    <div
                      key={r._id}
                      className="p-3 border border-[#D9DED2] rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#26332C]">{r.title}</span>
                        <span className="text-[#7C877D] block">
                          Date: {r.date} {r.time ? `• ${r.time}` : ''}
                        </span>
                      </div>
                      <Badge variant={r.status === 'completed' ? 'success' : 'neutral'} size="sm">
                        {r.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Modal */}
      <PersonModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPerson(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingPerson}
        isLoading={submitting}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Contact"
        message="Are you sure you want to remove this person from your contact list?"
        confirmLabel="Delete"
        isDestructive
        isLoading={submitting}
      />
    </div>
  );
};

