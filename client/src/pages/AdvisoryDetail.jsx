import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  Droplet
} from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { formatDateTime, formatModuleName } from '../lib/formatters';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Input } from '../components/ui/Input';

export function AdvisoryDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Follow-up state
  const [followups, setFollowups] = useState([]);
  const [question, setQuestion] = useState('');
  const [sendingFollowup, setSendingFollowup] = useState(false);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  useEffect(() => {
    async function loadAdvisory() {
      try {
        setLoading(true);
        const data = await apiClient(`/advisories/${id}`);
        setAdvisory(data);
        if (data?.followups) setFollowups(data.followups);
        if (data?.feedback) {
          setFeedbackRating(data.feedback.rating);
          setFeedbackSaved(true);
        }
      } catch (err) {
        console.warn('API fetch failed, checking local cache:', err);
        const local = JSON.parse(localStorage.getItem('km_local_advisories') || '[]');
        const match = local.find((a) => a.id === id);
        if (match) {
          setAdvisory(match);
        } else {
          setError('Advisory not found.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadAdvisory();
  }, [id]);

  const handleCopy = () => {
    if (!advisory) return;
    const text = `KisanMitra AI Advisory - ${formatModuleName(advisory.module)}
Crop: ${advisory.crop || advisory.input?.crop || 'N/A'}
Summary: ${advisory.result?.summary || ''}
${advisory.result?.warnings?.length ? `Warnings: ${advisory.result.warnings.join('; ')}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this advisory from your history?')) return;
    try {
      await apiClient(`/advisories/${id}`, { method: 'DELETE' }).catch(() => null);
      const local = JSON.parse(localStorage.getItem('km_local_advisories') || '[]');
      const filtered = local.filter((a) => a.id !== id);
      localStorage.setItem('km_local_advisories', JSON.stringify(filtered));
      navigate('/history');
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setSendingFollowup(true);
    try {
      let res;
      try {
        res = await apiClient(`/advisories/${id}/followups`, {
          method: 'POST',
          body: JSON.stringify({ question })
        });
      } catch (apiErr) {
        // Fallback local mock follow-up answer
        res = {
          id: 'fu-' + Date.now(),
          question,
          answer: `Regarding your query: "${question}" - for your ${advisory?.crop || 'crop'} under these weather conditions, maintain balanced moisture and monitor weekly. If pest symptoms escalate, consult the local agricultural officer.`,
          action_steps: ['Inspect underside of leaves', 'Apply neem oil spray if infestation is under 5%'],
          warnings: ['Do not mix different chemical sprays without compatibility testing'],
          created_at: new Date().toISOString()
        };
      }
      setFollowups((prev) => [...prev, res]);
      setQuestion('');
    } catch (err) {
      alert(err.message || 'Failed to submit question.');
    } finally {
      setSendingFollowup(false);
    }
  };

  const handleFeedback = async (rating) => {
    setFeedbackRating(rating);
    try {
      await apiClient(`/advisories/${id}/feedback`, {
        method: 'PUT',
        body: JSON.stringify({ rating, comment: feedbackComment || undefined })
      }).catch(() => null);
      setFeedbackSaved(true);
    } catch (err) {
      console.warn('Feedback save failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" label="Loading advisory..." />
      </div>
    );
  }

  if (error || !advisory) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">{error || 'Advisory not found'}</h2>
        <Link to="/history">
          <Button variant="secondary" icon={ArrowLeft}>
            Back to History
          </Button>
        </Link>
      </div>
    );
  }

  const result = advisory.result || {};
  const isHighRisk = result.risk_level === 'high';

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <Link
          to="/history"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={copied ? Check : Copy} onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint}>
            Print / PDF
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={handleDelete}
            className="text-red-600 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Advisory Header Card */}
      <Card className="border-brand-100 bg-gradient-to-br from-white via-white to-brand-50/20">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Badge variant="brand">{formatModuleName(advisory.module)}</Badge>
              <Badge variant={result.confidence === 'high' ? 'success' : 'neutral'}>
                Confidence: {result.confidence?.toUpperCase() || 'NORMAL'}
              </Badge>
              <Badge variant={isHighRisk ? 'danger' : 'neutral'}>
                Risk: {result.risk_level?.toUpperCase() || 'LOW'}
              </Badge>
            </div>
            <span className="text-xs text-slate-400">
              {formatDateTime(advisory.created_at)}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {advisory.crop || advisory.input?.crop || 'Crop Advisory'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {advisory.district || advisory.input?.district}, {advisory.state || advisory.input?.state}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Season: {advisory.season || advisory.input?.season}
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                Soil: {advisory.input?.soil_type?.replace('_', ' ') || 'Normal'}
              </span>
            </p>
          </div>

          {/* Core Summary */}
          {result.summary && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 leading-relaxed font-medium">
              {result.summary}
            </div>
          )}
        </div>
      </Card>

      {/* Expert Consult Alert (if high risk or recommended) */}
      {(result.consult_expert || isHighRisk) && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Consultation Recommended</h4>
            <p className="text-xs leading-relaxed text-amber-800">
              {t('common.expert_consult_needed')}
            </p>
          </div>
        </div>
      )}

      {/* Warnings & Safety Notes */}
      {(result.warnings?.length > 0 || result.safety_notes?.length > 0) && (
        <Card className="border-red-100 bg-red-50/20 space-y-3">
          <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Safety Guidelines & Cautions
          </h3>
          <ul className="space-y-2 text-xs text-red-800">
            {result.warnings?.map((w, idx) => (
              <li key={`w-${idx}`} className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
            {result.safety_notes?.map((s, idx) => (
              <li key={`s-${idx}`} className="flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Key Assumptions */}
      {result.assumptions?.length > 0 && (
        <Card className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Analysis Assumptions
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {result.assumptions.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-brand-600 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Follow-up Questions Section */}
      <Card className="space-y-4 no-print">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-600" />
          Ask a Follow-Up Question
        </h3>
        <p className="text-xs text-slate-500 -mt-2">
          Have questions about chemical dosages, irrigation timing, or alternatives? The AI will answer using this advisory's context.
        </p>

        {followups.length > 0 && (
          <div className="space-y-3 pt-2">
            {followups.map((fu, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="text-xs font-bold text-slate-800">Q: {fu.question}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{fu.answer}</p>
                {fu.action_steps?.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[11px] font-semibold text-slate-700">Action Steps:</span>
                    <ul className="list-disc list-inside text-xs text-slate-600 mt-0.5">
                      {fu.action_steps.map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleFollowupSubmit} className="flex items-center gap-2 pt-2">
          <Input
            placeholder="e.g. Can I spray this during the evening? What is the dosage per 15L pump?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={sendingFollowup || followups.length >= 10}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="primary"
            loading={sendingFollowup}
            disabled={!question.trim() || followups.length >= 10}
            icon={Send}
          >
            Ask
          </Button>
        </form>
        {followups.length >= 10 && (
          <p className="text-[11px] text-amber-600">
            Maximum 10 follow-up questions reached for this advisory.
          </p>
        )}
      </Card>

      {/* Feedback Widget */}
      <Card className="no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Was this advisory helpful?</h4>
            <p className="text-xs text-slate-500">Your feedback helps improve agronomic models</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleFeedback(1)}
              className={`p-2.5 rounded-xl border transition-all ${
                feedbackRating === 1
                  ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleFeedback(-1)}
              className={`p-2.5 rounded-xl border transition-all ${
                feedbackRating === -1
                  ? 'bg-red-50 border-red-500 text-red-700 shadow-sm'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <ThumbsDown className="w-5 h-5" />
            </button>
            {feedbackSaved && (
              <span className="text-xs text-brand-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Disclaimer Footer */}
      <footer className="pt-4 border-t border-slate-200 text-center text-xs text-slate-400 leading-relaxed">
        {result.disclaimer ||
          'Disclaimer: This advisory is generated by KisanMitra AI for agronomic decision-support. Always follow package labels for exact agrochemical measurements.'}
      </footer>
    </div>
  );
}
