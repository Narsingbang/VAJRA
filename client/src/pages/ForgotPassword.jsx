import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isConfigured) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) throw error;
      }
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send password reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <Card className="shadow-lg border-slate-200">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">Enter your registered email address</p>
        </div>

        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-brand-600 mx-auto" />
            <h3 className="font-semibold text-slate-900">Check your inbox</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We have dispatched password reset instructions to <strong>{email}</strong>.
            </p>
            <Link to="/login">
              <Button variant="secondary" size="sm" className="mt-4" icon={ArrowLeft}>
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">
                {error}
              </div>
            )}
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="farmer@example.com"
            />
            <Button type="submit" variant="primary" loading={loading} className="w-full">
              Send Reset Link
            </Button>
            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
