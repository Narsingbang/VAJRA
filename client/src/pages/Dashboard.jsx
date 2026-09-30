import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Sparkles,
  ArrowRight,
  Plus,
  History,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import { formatDateTime, formatModuleName } from '../lib/formatters';
import { QuotaMeter } from '../components/dashboard/QuotaMeter';
import { ModuleShortcutGrid } from '../components/dashboard/ModuleShortcutGrid';
import { OnboardingBanner } from '../components/dashboard/OnboardingBanner';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';

export function Dashboard() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

  const [farms, setFarms] = useState([]);
  const [recentAdvisories, setRecentAdvisories] = useState([]);
  const [quota, setQuota] = useState({ used: 0, limit: 30 });
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboardData() {
      try {
        // Fetch farms, recent advisories, and me quota
        const [meData, farmsData, advisoriesData] = await Promise.allSettled([
          apiClient('/me'),
          apiClient('/farms'),
          apiClient('/advisories?pageSize=5')
        ]);

        if (mounted) {
          if (meData.status === 'fulfilled' && meData.value) {
            setQuota(meData.value.today_quota || { used: 0, limit: 30 });
          }
          if (farmsData.status === 'fulfilled' && Array.user !== null && Array.isArray(farmsData.value)) {
            setFarms(farmsData.value);
          } else {
            // Local fallback farms if none or offline
            const localFarms = JSON.parse(localStorage.getItem('km_local_farms') || '[]');
            setFarms(localFarms);
          }
          if (advisoriesData.status === 'fulfilled' && advisoriesData.value?.items) {
            setRecentAdvisories(advisoriesData.value.items);
          } else {
            const localAdvisories = JSON.parse(localStorage.getItem('km_local_advisories') || '[]');
            setRecentAdvisories(localAdvisories.slice(0, 5));
          }
        }
      } catch (err) {
        console.warn('Dashboard fetch warning:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      mounted = false;
    };
  }, []);

  const farmerName = profile?.full_name || user?.user_metadata?.full_name || 'Farmer';

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" label="Loading your agricultural hub..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Quota Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('dashboard.welcome', { name: farmerName })}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Region: {profile?.district || 'Nashik'}, {profile?.state || 'Maharashtra'} • Ready for advisory
          </p>
        </div>

        <Link to="/advisory/new">
          <Button variant="primary" icon={Sparkles} size="md" className="shadow-md shadow-brand-500/20">
            {t('nav.newAdvisory')}
          </Button>
        </Link>
      </div>

      {/* Onboarding Banner if no farms */}
      {farms.length === 0 && showBanner && (
        <OnboardingBanner onDismiss={() => setShowBanner(false)} />
      )}

      {/* Quota Meter */}
      <QuotaMeter quota={quota} />

      {/* 6 Advisory Modules Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{t('dashboard.quick_advisory')}</h2>
          <Link to="/advisory/new" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            All Modules <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <ModuleShortcutGrid />
      </section>

      {/* Two Column Section: My Farms & Recent Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Registered Farms */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader
              title={t('dashboard.my_farms')}
              subtitle={`${farms.length} Farm${farms.length === 1 ? '' : 's'} connected`}
              action={
                <Link to="/farms">
                  <Button variant="secondary" size="sm" icon={Plus}>
                    Add
                  </Button>
                </Link>
              }
            />

            {farms.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs">{t('dashboard.no_farms_yet')}</p>
                <Link to="/farms">
                  <Button variant="outline" size="sm" className="mt-3">
                    Register Farm
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {farms.slice(0, 3).map((f) => (
                  <div key={f.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{f.name}</h4>
                      <p className="text-xs text-slate-500">
                        {f.area_acres} {t('common.acres')} • {f.district || f.state}
                      </p>
                    </div>
                    <Badge variant="brand">{f.soil_type?.replace('_', ' ') || 'Farm'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Recent Advisories */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title={t('dashboard.recent_advisories')}
              action={
                <Link to="/history">
                  <Button variant="ghost" size="sm" icon={History}>
                    {t('dashboard.view_all')}
                  </Button>
                </Link>
              }
            />

            {recentAdvisories.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Sparkles className="w-10 h-10 text-brand-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-700">No advisories generated yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Pick any module above to get instant personalized agronomy guidance for your crop.
                </p>
                <Link to="/advisory/new">
                  <Button variant="primary" size="sm" className="mt-4">
                    Create First Advisory
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentAdvisories.map((item) => (
                  <Link
                    key={item.id}
                    to={`/advisory/${item.id}`}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between group hover:bg-slate-50/80 -mx-4 px-4 rounded-xl transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {formatModuleName(item.module)}
                        </span>
                        <Badge variant={item.status === 'completed' ? 'success' : 'neutral'}>
                          {item.crop || item.season || 'Crop'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {item.result?.summary || item.input?.symptoms || 'Click to view structured advisory'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400 block">
                        {formatDateTime(item.created_at)}
                      </span>
                      <span className="text-xs font-semibold text-brand-600 flex items-center gap-0.5 justify-end mt-0.5">
                        View <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
