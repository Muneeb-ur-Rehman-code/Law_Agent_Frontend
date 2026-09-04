import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-navy uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'w-full px-3.5 py-2.5 bg-white text-dark text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent',
          error ? 'border-red-500 bg-red-50/20' : 'border-gray-300 hover:border-gray-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-mid mt-1">{helperText}</p>}
    </div>
  );
};
