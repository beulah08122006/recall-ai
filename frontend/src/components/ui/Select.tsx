import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-[#26332C] mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2 pr-9 text-sm text-[#26332C] transition-colors focus:outline-none focus:ring-2 focus:ring-[#526F52]/20 ${
              error ? 'border-[#D9534F] focus:border-[#D9534F]' : 'border-[#D9DED2] focus:border-[#526F52]'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-[#7C877D] flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="mt-1 text-xs text-[#D9534F]">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#7C877D]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

