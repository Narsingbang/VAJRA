import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 focus:ring-brand-500 border border-brand-500/30',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm focus:ring-slate-400',
    earth: 'bg-earth-700 hover:bg-earth-800 text-white shadow-md shadow-earth-700/20 focus:ring-earth-600',
    harvest: 'bg-harvest-500 hover:bg-harvest-600 text-white shadow-md shadow-harvest-500/20 focus:ring-harvest-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 focus:ring-red-500',
    outline: 'border-2 border-brand-600 text-brand-700 hover:bg-brand-50 focus:ring-brand-500',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[44px]', // WCAG AA min touch target
    lg: 'text-base px-6 py-3.5 gap-2.5 min-h-[48px]'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
