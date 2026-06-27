import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Pill, Calendar, Search } from 'lucide-react';
import api from '../../lib/api';

export default function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine endpoint based on role
    const fetchPrescriptions = async () => {
      try {
        // Placeholder endpoint, assuming the backend has an endpoint for list
        // Alternatively, use history endpoint for patients
        if (user?.role === 'patient') {
          const res = await api.get(`/patients/${user.id}/history`);
          setPrescriptions(res.data.data.prescriptions || []);
        } else {
          // Doctors see all their issued prescriptions (assuming endpoint exists, else mock)
          // For now, let's mock it for the doctor view if it doesn't exist
          setPrescriptions([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [user]);

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Prescriptions</h1>
        {user?.role === 'doctor' && (
          <button className="btn-primary">Write Prescription</button>
        )}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              className="input-field pl-10 w-full"
            />
          </div>
        </div>

        {prescriptions.length === 0 ? (
          <div className="text-center py-12">
            <Pill className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-300">No prescriptions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-surface-800/50 border border-surface-700/50 flex flex-col md:flex-row gap-4 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-white">{p.doctor_name || 'Doctor'}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary-500/20 text-primary-400">
                      {p.specialization || 'General'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-surface-300 text-xs mb-3">
                    <Calendar className="w-3 h-3" />
                    {new Date(p.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="space-y-2">
                    {p.items?.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-surface-200">
                        <Pill className="w-4 h-4 text-accent-400" />
                        <span className="font-medium text-white">{item.medicine_name}</span>
                        <span>— {item.dosage} ({item.duration})</span>
                      </div>
                    ))}
                  </div>
                  
                  {p.notes && (
                    <div className="mt-4 text-sm text-surface-300 bg-surface-900/50 p-3 rounded-lg border border-surface-700/30">
                      <strong>Notes:</strong> {p.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
