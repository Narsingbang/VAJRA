import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Layers,
  Droplet,
  Compass,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../lib/apiClient';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';

export function Farms() {
  const { t } = useTranslation();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    state: 'Maharashtra',
    district: 'Nashik',
    village: '',
    area_acres: 2.5,
    soil_type: 'black_cotton',
    irrigation_source: 'borewell'
  });

  const soilOptions = [
    { value: 'black_cotton', label: 'Black Cotton (काली मिट्टी)' },
    { value: 'red', label: 'Red Soil (लाल मिट्टी)' },
    { value: 'alluvial', label: 'Alluvial Soil (जलोढ़ मिट्टी)' },
    { value: 'laterite', label: 'Laterite Soil' },
    { value: 'sandy', label: 'Sandy (रेतीली)' },
    { value: 'loamy', label: 'Loamy (दोमट)' },
    { value: 'clayey', label: 'Clayey (चिकनी मिट्टी)' },
    { value: 'saline_alkaline', label: 'Saline / Alkaline' },
    { value: 'unknown', label: 'Other / Unknown' }
  ];

  const irrigationOptions = [
    { value: 'borewell', label: 'Borewell (नलकूप)' },
    { value: 'open_well', label: 'Open Well (कुआँ)' },
    { value: 'canal', label: 'Canal (नहर)' },
    { value: 'drip', label: 'Drip Irrigation (टपक सिंचाई)' },
    { value: 'sprinkler', label: 'Sprinkler (फव्वारा)' },
    { value: 'rainfed', label: 'Rainfed / Monsoon Only (बारिश पर निर्भर)' },
    { value: 'farm_pond', label: 'Farm Pond (खेत तालाब)' },
    { value: 'other', label: 'Other' }
  ];

  const loadFarms = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/farms');
      if (Array.isArray(data)) {
        setFarms(data);
      } else {
        const local = JSON.parse(localStorage.getItem('km_local_farms') || '[]');
        setFarms(local);
      }
    } catch (err) {
      console.warn('Failed to load farms from API, loading local:', err);
      const local = JSON.parse(localStorage.getItem('km_local_farms') || '[]');
      setFarms(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarms();
  }, []);

  const openCreateModal = () => {
    setEditingFarm(null);
    setFormData({
      name: '',
      state: 'Maharashtra',
      district: 'Nashik',
      village: '',
      area_acres: 2.5,
      soil_type: 'black_cotton',
      irrigation_source: 'borewell'
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name || '',
      state: farm.state || 'Maharashtra',
      district: farm.district || '',
      village: farm.village || '',
      area_acres: farm.area_acres || 1,
      soil_type: farm.soil_type || 'black_cotton',
      irrigation_source: farm.irrigation_source || 'borewell'
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      ...formData,
      area_acres: Number(formData.area_acres)
    };

    try {
      if (editingFarm) {
        try {
          await apiClient(`/farms/${editingFarm.id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload)
          });
        } catch (apiErr) {
          console.warn('Fallback to local update:', apiErr);
        }
        const updated = farms.map((f) => (f.id === editingFarm.id ? { ...f, ...payload } : f));
        setFarms(updated);
        localStorage.setItem('km_local_farms', JSON.stringify(updated));
      } else {
        let newFarm = null;
        try {
          newFarm = await apiClient('/farms', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        } catch (apiErr) {
          console.warn('Fallback to local creation:', apiErr);
          newFarm = { id: 'farm-' + Date.now(), ...payload, created_at: new Date().toISOString() };
        }
        const updated = [newFarm, ...farms];
        setFarms(updated);
        localStorage.setItem('km_local_farms', JSON.stringify(updated));
      }
      setModalOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to save farm.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (farmId) => {
    if (!window.confirm('Are you sure you want to delete this farm?')) return;

    try {
      await apiClient(`/farms/${farmId}`, { method: 'DELETE' }).catch(() => null);
      const updated = farms.filter((f) => f.id !== farmId);
      setFarms(updated);
      localStorage.setItem('km_local_farms', JSON.stringify(updated));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {t('nav.farms')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Register and manage your land plots to auto-fill advisory inputs
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={openCreateModal}>
          Add New Farm
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner size="lg" label="Loading your farms..." />
        </div>
      ) : farms.length === 0 ? (
        <Card className="text-center py-12">
          <MapPin className="w-12 h-12 text-brand-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No farms registered yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Adding your farm helps our AI provide exact fertilizer dosages, water schedules, and crop choices.
          </p>
          <Button variant="primary" size="md" icon={Plus} className="mt-4" onClick={openCreateModal}>
            Register First Farm
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {farms.map((farm) => (
            <Card key={farm.id} hover className="flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{farm.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Compass className="w-3.5 h-3.5 text-slate-400" />
                      {farm.village ? `${farm.village}, ` : ''}{farm.district}, {farm.state}
                    </p>
                  </div>
                  <Badge variant="brand">{farm.area_acres} Acres</Badge>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-earth-700 shrink-0" />
                    <span>Soil: <strong>{soilOptions.find(o => o.value === farm.soil_type)?.label || farm.soil_type}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Water: <strong>{irrigationOptions.find(o => o.value === farm.irrigation_source)?.label || farm.irrigation_source}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Edit2}
                  onClick={() => openEditModal(farm)}
                  className="text-slate-600"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => handleDelete(farm.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Farm Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFarm ? 'Edit Farm Details' : 'Register New Farm'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Farm / Plot Name *"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. North Plot or Sugarcane Field"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="State *"
              required
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="e.g. Maharashtra"
            />
            <Input
              label="District *"
              required
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              placeholder="e.g. Nashik"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Village / Tehsil (Optional)"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              placeholder="e.g. Dindori"
            />
            <Input
              label="Area in Acres *"
              type="number"
              step="0.1"
              min="0.1"
              max="10000"
              required
              value={formData.area_acres}
              onChange={(e) => setFormData({ ...formData, area_acres: e.target.value })}
              placeholder="e.g. 2.5"
            />
          </div>

          <Select
            label="Soil Type *"
            value={formData.soil_type}
            onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
            options={soilOptions}
          />

          <Select
            label="Primary Water / Irrigation Source *"
            value={formData.irrigation_source}
            onChange={(e) => setFormData({ ...formData, irrigation_source: e.target.value })}
            options={irrigationOptions}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              {editingFarm ? 'Save Changes' : 'Register Farm'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
