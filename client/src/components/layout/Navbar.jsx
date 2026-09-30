import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, LayoutDashboard, MapPin, Sparkles, History, User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from '../ui/Button';

export function Navbar() {
  const { t } = useTranslation();
  const { user, signOut, isConfigured } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/farms', label: t('nav.farms'), icon: MapPin },
    { to: '/advisory/new', label: t('nav.newAdvisory'), icon: Sparkles, highlight: true },
    { to: '/history', label: t('nav.history'), icon: History }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              KisanMitra <span className="text-brand-600">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] text-slate-500 font-medium -mt-1 tracking-wider uppercase">
              Smart Crop Advisory
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    link.highlight
                      ? 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
                      : isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.highlight ? 'text-brand-600' : 'text-slate-500'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" icon={User}>
                  {t('nav.profile')}
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={signOut}
                icon={LogOut}
                className="text-slate-600"
              >
                <span className="hidden sm:inline">{t('nav.logout')}</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" icon={LogIn}>
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  {t('nav.signup')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
