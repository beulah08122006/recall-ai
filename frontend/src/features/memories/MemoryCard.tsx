import React from 'react';
import { Memory } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Calendar, User, Package, Edit2, Trash2 } from 'lucide-react';

export interface MemoryCardProps {
  memory: Memory;
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onEdit, onDelete }) => {
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

  return (
    <div className="bg-white rounded-xl border border-[#D9DED2] p-5 hover:border-[#526F52]/40 hover:shadow-xs transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold text-[#26332C] leading-snug">{memory.title}</h3>
          {memory.category && (
            <Badge variant="neutral" size="sm" className="shrink-0">
              {memory.category}
            </Badge>
          )}
        </div>

        <p className="text-sm text-[#7C877D] whitespace-pre-wrap leading-relaxed mb-4">
          {memory.description}
        </p>

        {/* Linked person or item metadata */}
        {(memory.personName || memory.relatedItem) && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#7C877D] mb-3 p-2 rounded-lg bg-[#EBEFE4]/60">
            {memory.personName && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#526F52]" />
                {memory.personName}
              </span>
            )}
            {memory.relatedItem && (
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-[#62896A]" />
                {memory.relatedItem}
              </span>
            )}
          </div>
        )}

        {/* Tags */}
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {memory.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-[#526F52] bg-[#EBEFE4] px-2 py-0.5 rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#D9DED2] text-xs text-[#7C877D]">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(memory.createdAt)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(memory)}
            className="p-1 rounded text-[#7C877D] hover:text-[#526F52] hover:bg-[#EBEFE4] transition-colors cursor-pointer"
            aria-label="Edit memory"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(memory._id)}
            className="p-1 rounded text-[#7C877D] hover:text-[#D9534F] hover:bg-[#EBEFE4] transition-colors cursor-pointer"
            aria-label="Delete memory"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

