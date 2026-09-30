export function formatINR(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString, locale = 'en-IN') {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d);
}

export function formatDateTime(dateString, locale = 'en-IN') {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
}

export function formatModuleName(moduleKey) {
  const map = {
    crop_recommendation: 'Crop Recommendation',
    fertilizer_plan: 'Fertilizer & Nutrient Plan',
    irrigation_schedule: 'Irrigation Schedule',
    pest_disease_diagnosis: 'Pest & Disease Diagnosis',
    seasonal_calendar: 'Seasonal Crop Calendar',
    harvest_postharvest: 'Harvest & Post-Harvest'
  };
  return map[moduleKey] || moduleKey?.replace(/_/g, ' ') || 'Advisory';
}
