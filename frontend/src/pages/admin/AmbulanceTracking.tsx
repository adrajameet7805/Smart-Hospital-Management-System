import { useState, useEffect } from 'react';
import { ambulanceApi } from '../../lib/api';
import { Truck, MapPin, Phone, Navigation, AlertTriangle } from 'lucide-react';

const statusColors: Record<string, string> = {
  available: 'badge-success',
  dispatched: 'badge-warning',
  en_route: 'badge-info',
  at_scene: 'badge-danger',
  returning: 'badge-neutral',
  maintenance: 'badge-neutral',
};

export default function AmbulanceTracking() {
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ambulanceApi.list()
      .then(res => setAmbulances(res.data.data))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Ambulance Tracking</h1><p className="text-surface-200 text-sm">Real-time fleet management</p></div>

      {/* Fleet Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {['available', 'dispatched', 'en_route', 'maintenance'].map(status => {
          const count = ambulances.filter(a => a.status === status).length;
          return (
            <div key={status} className="glass-card p-4 text-center animate-fade-in">
              <p className="text-2xl font-bold text-white">{count}</p>
              <p className="text-xs text-surface-200 capitalize">{status.replace('_', ' ')}</p>
            </div>
          );
        })}
      </div>

      {/* Ambulance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? [...Array(4)].map((_, i) => <div key={i} className="loading-shimmer h-48 rounded-xl" />) :
        ambulances.map((amb, i) => (
          <div key={amb.ambulance_id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  amb.status === 'available' ? 'bg-success-500/20' :
                  amb.status === 'dispatched' || amb.status === 'en_route' ? 'bg-warning-500/20' : 'bg-surface-500/20'
                }`}>
                  <Truck className={`w-6 h-6 ${
                    amb.status === 'available' ? 'text-success-400' :
                    amb.status === 'dispatched' || amb.status === 'en_route' ? 'text-warning-400' : 'text-surface-300'
                  }`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{amb.vehicle_number}</h3>
                  <p className="text-xs text-surface-200 capitalize">{amb.ambulance_type} Life Support</p>
                </div>
              </div>
              <span className={`badge ${statusColors[amb.status] || 'badge-neutral'}`}>
                {amb.status === 'en_route' && <span className="pulse-live mr-2"> </span>}
                {amb.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-surface-200">
                <Navigation className="w-3.5 h-3.5" />
                <span>{amb.driver_name}</span>
              </div>
              <div className="flex items-center gap-2 text-surface-200">
                <Phone className="w-3.5 h-3.5" />
                <span>{amb.driver_phone}</span>
              </div>
              {amb.location_lat && (
                <div className="flex items-center gap-2 text-surface-200">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs font-mono">{amb.location_lat.toFixed(4)}, {amb.location_lng.toFixed(4)}</span>
                </div>
              )}
            </div>

            {(amb.status === 'dispatched' || amb.status === 'en_route') && (
              <div className="mt-3 bg-warning-500/10 rounded-xl p-3 border border-warning-500/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning-400" />
                  <span className="text-xs text-warning-400 font-medium">Active Emergency</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
