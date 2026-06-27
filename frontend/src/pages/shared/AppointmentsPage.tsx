import { useState, useEffect } from 'react';
import { appointmentApi } from '../../lib/api';
import { Calendar, Clock, X } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: any = { limit: 50 };
    if (filter !== 'all') params.status = filter;
    appointmentApi.list(params)
      .then(res => setAppointments(res.data.data.appointments))
      .catch(console.error).finally(() => setLoading(false));
  }, [filter]);

  const handleCancel = async (id: number) => {
    try {
      await appointmentApi.cancel(id);
      setAppointments(prev => prev.map(a => a.appointment_id === id ? { ...a, status: 'cancelled' } : a));
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Appointments</h1>
        <p className="text-surface-200 text-sm">View and manage all appointments</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setLoading(true); }} className={`text-xs px-4 py-2 rounded-xl capitalize transition-all ${filter === f ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' : 'btn-ghost'}`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Patient</th><th>Doctor</th><th>Department</th><th>Date</th><th>Time</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={8}><div className="loading-shimmer h-8" /></td></tr>) :
            appointments.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-surface-200">No appointments found</td></tr> :
            appointments.map(apt => (
              <tr key={apt.appointment_id}>
                <td className="font-medium text-white">{apt.patient_name}</td>
                <td>{apt.doctor_name}</td>
                <td>{apt.department}</td>
                <td>{apt.date}</td>
                <td>{apt.time_slot}</td>
                <td className="capitalize">{apt.type}</td>
                <td><span className={`badge ${apt.status === 'completed' ? 'badge-success' : apt.status === 'scheduled' ? 'badge-info' : apt.status === 'confirmed' ? 'badge-warning' : apt.status === 'cancelled' ? 'badge-danger' : 'badge-neutral'}`}>{apt.status}</span></td>
                <td>
                  {['scheduled', 'confirmed'].includes(apt.status) && (
                    <button onClick={() => handleCancel(apt.appointment_id)} className="p-1.5 rounded-lg hover:bg-danger-500/10 text-danger-400"><X className="w-4 h-4" /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
