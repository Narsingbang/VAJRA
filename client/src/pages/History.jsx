import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { formatDateTime, formatModuleName } from '../lib/formatters';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';

export function History() {
  const { t } = useTranslation();
  const [advisories, setAdvisories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState('');

  const loadHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });
      if (search) params.append('q', search);
      if (selectedModule) params.append('module', selectedModule);

      const data = await apiClient(`/advisories?${params.toString()}`);
      if (data?.items) {
        setAdvisories(data.items);
        setTotal(data.total || data.items.length);
      } else {
        const local = JSON.parse(localStorage.getItem('km_local_advisories') || '[]');
        let filtered = [...local];
        if (selectedModule) filtered = filtered.filter((a) => a.module === selectedModule);
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(
            (a) =>
              a.crop?.toLowerCase().includes(s) ||
              a.result?.summary?.toLowerCase().includes(s) ||
              a.district?.toLowerCase().includes(s)
          );
        }
        setAdvisories(filtered.slice((page - 1) * pageSize, page * pageSize));
        setTotal(filtered.length);
      }
    } catch (err) {
      console.warn('API history fetch failed, using local cache:', err);
      const local = JSON.parse(localStorage.getItem('km_local_advisories') || '[]');
      setAdvisories(local);
      setTotal(local.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page, selectedModule]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadHistory();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('nav.history')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse and review your past crop recommendations, schedules, and diagnoses
          </p>
        </div>

        <Link to="/advisory/new">
          <Button variant="primary" icon={Sparkles}>
            New Advisory
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by crop, symptoms, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="">All 6 Modules</option>
              <option value="crop_recommendation">Crop Recommendation</option>
              <option value="fertilizer_plan">Fertilizer Plan</option>
              <option value="irrigation_schedule">Irrigation Schedule</option>
              <option value="pest_disease_diagnosis">Pest & Disease</option>
              <option value="seasonal_calendar">Seasonal Calendar</option>
              <option value="harvest_postharvest">Harvest & Storage</option>
            </select>
          </div>

          <Button type="submit" variant="secondary" size="md">
            Filter
          </Button>
        </form>
      </Card>

      {/* Advisory List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" label="Loading history..." />
        </div>
      ) : advisories.length === 0 ? (
        <Card className="text-center py-16 space-y-3">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No advisories found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || selectedModule
              ? 'No matching advisories found with the current filters. Try resetting the search.'
              : 'You haven’t generated any crop advisories yet. Choose a module to begin.'}
          </p>
          <Link to="/advisory/new">
            <Button variant="primary" size="sm" className="mt-2">
              Generate First Advisory
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {advisories.map((adv) => (
            <Link
              key={adv.id}
              to={`/advisory/${adv.id}`}
              className="block group"
            >
              <Card hover className="p-4 sm:p-5 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="brand">{formatModuleName(adv.module)}</Badge>
                      <span className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors">
                        {adv.crop || adv.input?.crop || 'Recommended Crops'}
                      </span>
                      <Badge variant={adv.status === 'completed' ? 'success' : 'neutral'}>
                        {adv.season || adv.input?.season || 'Kharif'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {adv.result?.summary || adv.input?.symptoms || 'Click to view full advisory breakdown'}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {adv.district || adv.input?.district}, {adv.state || adv.input?.state}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(adv.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center text-xs font-semibold text-brand-600 shrink-0">
                    <span>View Detail</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages} ({total} total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  icon={ChevronLeft}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1 inline" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
