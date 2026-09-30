import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Clock } from 'lucide-react';
import { Card } from '../ui/Card';

export function QuotaMeter({ quota }) {
  const { t } = useTranslation();
  const limit = quota?.limit ?? 30;
  const used = quota?.used ?? 0;
  const remaining = Math.max(0, limit - used);
  const percentage = Math.min(100, Math.round((used / limit) * 100));

  return (
    <Card className="bg-gradient-to-br from-white via-white to-brand-50/40 border-brand-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800">{t('dashboard.quota_title')}</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('dashboard.quota_remaining', { remaining, limit })}
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-xs">
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
            <span>{percentage}% used</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              {t('dashboard.resets_in')}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage > 85 ? 'bg-amber-500' : 'bg-brand-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
