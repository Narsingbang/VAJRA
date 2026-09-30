import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function LanguageSwitcher({ className = '' }) {
  const { i18n } = useTranslation();
  const { updateProfile, user } = useAuth();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'mr', label: 'मराठी' }
  ];

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('km_language', newLang);
    if (user) {
      try {
        await updateProfile({ preferred_language: newLang });
      } catch (err) {
        console.warn('Failed to persist language to profile:', err);
      }
    }
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <Globe className="w-4 h-4 text-slate-500 shrink-0" />
      <select
        value={i18n.language || 'en'}
        onChange={handleLanguageChange}
        className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer shadow-sm"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
