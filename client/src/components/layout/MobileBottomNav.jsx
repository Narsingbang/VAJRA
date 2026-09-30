import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, MapPin, Sparkles, History, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function MobileBottomNav() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const items = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/farms', label: t('nav.farms'), icon: MapPin },
    { to: '/advisory/new', label: t('nav.newAdvisory'), icon: Sparkles, primary: true },
    { to: '/history', label: t('nav.history'), icon: History },
    { to: '/profile', label: t('nav.profile'), icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg mobile-bottom-nav">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          if (item.primary) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 ring-4 ring-white active:scale-95 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-brand-700 mt-1">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] min-h-[48px] rounded-xl transition-colors ${
                isActive ? 'text-brand-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
