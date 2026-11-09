import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles = {
    neutral: 'bg-[#EBEFE4] text-[#526F52] border border-[#D9DED2]',
    accent: 'bg-[#526F52]/10 text-[#526F52] border border-[#526F52]/25',
    success: 'bg-[#62896A]/15 text-[#3D6645] border border-[#62896A]/30',
    warning: 'bg-[#C58B52]/15 text-[#9E642A] border border-[#C58B52]/30',
    danger: 'bg-[#D9534F]/15 text-[#B53B37] border border-[#D9534F]/30',
  };

  return (
    <span className={`inline-flex items-center rounded-md ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

