import { useState, useEffect } from 'react';
import { doctorApi } from '../../lib/api';
import { Search, Star, Clock, Stethoscope } from 'lucide-react';

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorApi.list({ limit: 50 })
      .then(res => setDoctors(res.data.data.doctors))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase()))
    : doctors;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Doctor Management</h1>
        <p className="text-surface-200 text-sm">Manage your medical staff</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctors..." className="input-field pl-10" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="loading-shimmer h-52 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doc, i) => (
            <div key={doc.doctor_id} className="glass-card p-5 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {doc.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{doc.name}</h3>
                  <p className="text-xs text-accent-400">{doc.specialization}</p>
                  <p className="text-xs text-surface-200">{doc.department}</p>
                </div>
                <span className={`badge ${doc.availability_status === 'available' ? 'badge-success' : doc.availability_status === 'busy' ? 'badge-warning' : 'badge-neutral'}`}>
                  {doc.availability_status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-surface-700/30 rounded-xl p-2 text-center">
                  <Star className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
                  <p className="text-xs font-medium text-white">{doc.rating}</p>
                </div>
                <div className="bg-surface-700/30 rounded-xl p-2 text-center">
                  <Clock className="w-3.5 h-3.5 text-primary-400 mx-auto mb-0.5" />
                  <p className="text-xs font-medium text-white">{doc.experience}yr</p>
                </div>
                <div className="bg-surface-700/30 rounded-xl p-2 text-center">
                  <Stethoscope className="w-3.5 h-3.5 text-accent-400 mx-auto mb-0.5" />
                  <p className="text-xs font-medium text-white">₹{doc.consultation_fee}</p>
                </div>
              </div>
              <p className="text-xs text-surface-200 mt-3 line-clamp-2">{doc.bio || 'No bio available'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
