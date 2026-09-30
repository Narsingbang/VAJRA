import React, { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, className = '', id, rows = 3, ...props },
  ref
) {
  const textareaId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors duration-150 disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
    </div>
  );
});
