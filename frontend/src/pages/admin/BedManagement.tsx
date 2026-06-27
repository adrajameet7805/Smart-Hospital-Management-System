import { useState, useEffect } from 'react';
import { analyticsApi } from '../../lib/api';
import { BedDouble, Wrench, CheckCircle, XCircle } from 'lucide-react';

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  available: { bg: 'bg-success-500/15 border-success-500/20', text: 'text-success-400', icon: CheckCircle },
  occupied: { bg: 'bg-warning-500/15 border-warning-500/20', text: 'text-warning-400', icon: BedDouble },
  maintenance: { bg: 'bg-surface-400/15 border-surface-400/20', text: 'text-surface-300', icon: Wrench },
  reserved: { bg: 'bg-info-500/15 border-info-500/20', text: 'text-info-400', icon: XCircle },
};

export default function BedManagement() {
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.beds().then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6">{[...Array(3)].map((_, i) => <div key={i} className="loading-shimmer h-40 rounded-xl" />)}</div>;

  const beds = data?.allBeds?.filter((b: any) => filter === 'all' || b.status === filter) || [];
  const grouped = beds.reduce((acc: any, b: any) => { (acc[b.ward] = acc[b.ward] || []).push(b); return acc; }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Bed Management</h1>
        <p className="text-surface-200 text-sm">Visual hospital bed map</p>
      </div>

      {/* Occupancy Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {data?.occupancy?.map((ward: any, i: number) => (
          <div key={ward.ward} className="glass-card p-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <h4 className="text-sm font-medium text-white mb-2">{ward.ward}</h4>
            <div className="flex justify-between text-xs text-surface-200 mb-1">
              <span>Occupancy</span>
              <span>{ward.total > 0 ? ((ward.occupied / ward.total) * 100).toFixed(0) : 0}%</span>
            </div>
            <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full" style={{ width: `${ward.total > 0 ? (ward.occupied / ward.total) * 100 : 0}%` }} />
            </div>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-success-400">{ward.available} free</span>
              <span className="text-warning-400">{ward.occupied} used</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'available', 'occupied', 'maintenance'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`text-xs px-4 py-2 rounded-xl capitalize transition-all ${filter === f ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' : 'btn-ghost'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Bed Grid by Ward */}
      {Object.entries(grouped).map(([ward, wardBeds]: [string, any]) => (
        <div key={ward} className="glass-card p-6 animate-fade-in">
          <h3 className="text-base font-semibold text-white mb-4">{ward} Ward</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {wardBeds.map((bed: any) => {
              const sc = statusColors[bed.status] || statusColors.available;
              const StatusIcon = sc.icon;
              return (
                <div key={bed.bed_id} className={`${sc.bg} border rounded-xl p-3 text-center cursor-pointer hover:scale-105 transition-all`} title={bed.patient_name || bed.status}>
                  <StatusIcon className={`w-5 h-5 ${sc.text} mx-auto mb-1`} />
                  <p className="text-xs font-medium text-white">{bed.bed_number}</p>
                  {bed.patient_name && <p className="text-[10px] text-surface-200 truncate">{bed.patient_name}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
