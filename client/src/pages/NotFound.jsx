import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="py-24 text-center max-w-md mx-auto space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-2">
        <Sprout className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
      <p className="text-xs text-slate-500 leading-relaxed">
        The page or advisory you are looking for does not exist or has been moved.
      </p>
      <div className="pt-2">
        <Link to="/dashboard">
          <Button variant="primary" icon={ArrowLeft}>
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
