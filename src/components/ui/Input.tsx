import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-[17px] font-medium text-ios-label">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-5 h-[44px] rounded-2xl',
          'text-[17px] text-ios-label placeholder:text-ios-tertiary-label',
          'bg-gray-100/80 border-transparent',
          'focus:outline-none focus:border-ios-blue focus:ring-1 focus:ring-ios-blue focus:bg-white',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all duration-200',
          error && 'border-ios-red focus:border-ios-red focus:ring-ios-red',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-[13px] text-ios-red">{error}</p>
      )}
    </div>
  );
}