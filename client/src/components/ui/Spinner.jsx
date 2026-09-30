import React from 'react';
import { Loader2 } from 'lucide-react';

export function Spinner({ size = 'md', className = '', label }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-4 ${className}`}>
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-brand-600`} />
      {label && <p className="text-sm font-medium text-slate-600 animate-pulse">{label}</p>}
    </div>
  );
}
