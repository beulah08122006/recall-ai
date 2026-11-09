import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-[#7C877D] ${className}`}>
      <Loader2 className="w-6 h-6 animate-spin text-[#526F52] mb-2.5" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

