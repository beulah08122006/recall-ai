import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex gap-4 items-start py-2">
        <div
          className={`p-2.5 rounded-full shrink-0 ${
            isDestructive ? 'bg-[#D9534F]/10 text-[#D9534F]' : 'bg-[#526F52]/10 text-[#526F52]'
          }`}
        >
          <AlertCircle className="w-5 h-5" />
        </div>
        <p className="text-sm text-[#7C877D] leading-relaxed">{message}</p>
      </div>
      <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-[#D9DED2]">
        <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant={isDestructive ? 'danger' : 'primary'}
          size="md"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
};

