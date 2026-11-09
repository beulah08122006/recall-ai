import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-[#26332C] mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-[#26332C] placeholder-[#9EA79F] transition-colors focus:outline-none focus:ring-2 focus:ring-[#526F52]/20 ${
            error ? 'border-[#D9534F] focus:border-[#D9534F]' : 'border-[#D9DED2] focus:border-[#526F52]'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-[#D9534F]">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#7C877D]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

