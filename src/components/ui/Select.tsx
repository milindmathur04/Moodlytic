import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, children, ...props }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[17px] font-medium text-ios-label">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
            'w-full px-5 h-[44px] rounded-2xl appearance-none',
            'text-[17px] text-ios-label',
            'bg-gray-100/80 border-transparent',
            'focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue focus:bg-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            error && 'border-ios-red focus:border-ios-red focus:ring-ios-red',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ios-gray pointer-events-none" />
      </div>
      {error && (
        <p className="text-[13px] text-ios-red">{error}</p>
      )}
    </div>
  );
}