'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { CityGuide } from '@/types';
import { CITY_GUIDES_SEED } from '@/lib/constants';
import SlideDrawer from '@/components/ui/SlideDrawer';
import {
  MapPin, Edit3, Save, X, Smartphone, Home, Bus, Utensils, Cloud, DollarSign, Users,
} from 'lucide-react';

export default function CitiesPage() {
  const [cities, setCities] = useState<CityGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<CityGuide | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<CityGuide>>({});

  const fetchCities = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('city_guides').select('*').order('city_name');
    if (data && data.length > 0) {
      setCities(data);
    } else {
      // Seed database with initial data
      const { data: seeded } = await supabase.from('city_guides').insert(CITY_GUIDES_SEED).select();
      if (seeded) setCities(seeded);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCities(); }, [fetchCities]);

  const openDrawer = (city: CityGuide) => {
    setSelectedCity(city);
    setEditData(city);
    setEditMode(false);
    setDrawerOpen(true);
  };

  const saveEdit = async () => {
    if (!selectedCity) return;
    await supabase.from('city_guides').update({
      description: editData.description,
      population: editData.population,
      climate: editData.climate,
      cost_of_living: editData.cost_of_living,
      accommodation_info: editData.accommodation_info,
      transportation: editData.transportation,
    }).eq('id', selectedCity.id);
    setEditMode(false);
    fetchCities();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>City Guides</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Essential information for living and studying in Chinese cities.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.map((city, i) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openDrawer(city)}
              className="surface-card p-5 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{city.city_name}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{city.province}</p>
                </div>
                <MapPin size={18} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <p className="text-xs leading-relaxed mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                {city.description}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Users size={12} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{city.population}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Smartphone size={12} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{city.essential_apps?.length || 0} apps</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* City Detail Drawer */}
      <SlideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={selectedCity?.city_name || ''} subtitle={selectedCity?.province} width="max-w-xl">
        {selectedCity && (
          <div className="space-y-6">
            {editMode ? (
              <div className="space-y-3">
                <textarea value={editData.description || ''} onChange={(e) => setEditData({...editData, description: e.target.value})} className="input-field min-h-[100px]" placeholder="Description" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={editData.population || ''} onChange={(e) => setEditData({...editData, population: e.target.value})} className="input-field" placeholder="Population" />
                  <input value={editData.climate || ''} onChange={(e) => setEditData({...editData, climate: e.target.value})} className="input-field" placeholder="Climate" />
                </div>
                <textarea value={editData.cost_of_living || ''} onChange={(e) => setEditData({...editData, cost_of_living: e.target.value})} className="input-field min-h-[60px]" placeholder="Cost of Living" />
                <textarea value={editData.accommodation_info || ''} onChange={(e) => setEditData({...editData, accommodation_info: e.target.value})} className="input-field min-h-[60px]" placeholder="Accommodation" />
                <textarea value={editData.transportation || ''} onChange={(e) => setEditData({...editData, transportation: e.target.value})} className="input-field min-h-[60px]" placeholder="Transportation" />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="gradient-btn px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1"><Save size={14} /> Save</button>
                  <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-xl text-xs" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selectedCity.description}</p>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Users, label: 'Population', value: selectedCity.population },
                    { icon: Cloud, label: 'Climate', value: selectedCity.climate },
                    { icon: DollarSign, label: 'Cost of Living', value: selectedCity.cost_of_living },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon size={12} style={{ color: 'var(--accent-primary)' }} />
                        <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Essential Apps */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone size={14} style={{ color: 'var(--accent-primary)' }} />
                    <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Essential Apps</h4>
                  </div>
                  <div className="space-y-2">
                    {(selectedCity.essential_apps || []).map((app, i) => (
                      <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--bg-card)' }}>
                        <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{app.name}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{app.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accommodation */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Home size={14} style={{ color: 'var(--accent-primary)' }} />
                    <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Accommodation</h4>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selectedCity.accommodation_info}</p>
                </div>

                {/* Transportation */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Bus size={14} style={{ color: 'var(--accent-primary)' }} />
                    <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Transportation</h4>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selectedCity.transportation}</p>
                </div>

                <button onClick={() => setEditMode(true)} className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                  <Edit3 size={14} /> Edit Guide
                </button>
              </>
            )}
          </div>
        )}
      </SlideDrawer>
    </div>
  );
}
