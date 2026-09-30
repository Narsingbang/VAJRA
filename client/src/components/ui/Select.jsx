import React, { forwardRef } from 'react';

export const Select = forwardRef(function Select(
  { label, error, hint, options = [], className = '', id, placeholder = 'Select an option', ...props },
  ref
) {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors duration-150 disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? 'border-red-400 focus:border-red-500' : 'border-slate-300'
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}
    </div>
  );
});
