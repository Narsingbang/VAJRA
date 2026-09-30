import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  ShieldAlert,
  Save,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

export function Profile() {
  const { t, i18n } = useTranslation();
  const { user, profile, updateProfile, signOut } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [preferredLanguage, setPreferredLanguage] = useState(profile?.preferred_language || i18n.language || 'en');
  const [state, setState] = useState(profile?.state || 'Maharashtra');
  const [district, setDistrict] = useState(profile?.district || 'Nashik');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPreferredLanguage(profile.preferred_language || i18n.language || 'en');
      setState(profile.state || 'Maharashtra');
      setDistrict(profile.district || 'Nashik');
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSavedSuccess(false);

    try {
      await updateProfile({
        full_name: fullName,
        preferred_language: preferredLanguage,
        state,
        district
      });
      i18n.changeLanguage(preferredLanguage);
      localStorage.setItem('km_language', preferredLanguage);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'Are you sure you want to permanently delete your account and all associated farm data? Type DELETE to confirm:'
    );
    if (confirmation !== 'DELETE') return;

    try {
      await apiClient('/me', { method: 'DELETE' }).catch(() => null);
      localStorage.clear();
      await signOut();
      window.location.href = '/';
    } catch (err) {
      alert(err.message || 'Failed to delete account.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('nav.profile')} & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal agronomy preferences, language, and account
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={LogOut} onClick={signOut}>
          Sign Out
        </Button>
      </div>

      <Card>
        <CardHeader title="Farmer Profile" subtitle="Your default details pre-fill advisory questionnaires" />

        {savedSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-brand-50 border border-brand-200 text-brand-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Profile settings saved successfully!</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="State"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            <Input
              label="District"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          <Select
            label="Preferred UI & AI Language"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'hi', label: 'हिन्दी (Hindi)' },
              { value: 'mr', label: 'मराठी (Marathi)' }
            ]}
          />

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" loading={saving} icon={Save}>
              Save Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone: Account Deletion */}
      <Card className="border-red-200 bg-red-50/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-red-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Delete Account & Farm Data
            </h4>
            <p className="text-xs text-red-700 mt-0.5">
              Permanently delete all registered farms, image uploads, and crop advisories. This action cannot be undone.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={handleDeleteAccount}
            className="shrink-0"
          >
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
