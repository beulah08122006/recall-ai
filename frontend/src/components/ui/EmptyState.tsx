import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[#D9DED2] rounded-xl bg-white/70 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-[#EBEFE4] text-[#526F52] flex items-center justify-center mb-3">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-[#26332C] mb-1">{title}</h4>
      <p className="text-sm text-[#7C877D] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

