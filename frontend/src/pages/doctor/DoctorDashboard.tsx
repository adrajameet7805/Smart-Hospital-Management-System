import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorApi, appointmentApi } from '../../lib/api';
import { Calendar, Users, Clock, CheckCircle, AlertCircle, Stethoscope, ArrowUpRight } from 'lucide-react';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [todayQueue, setTodayQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.doctor_id) {
      Promise.all([
        doctorApi.analytics(profile.doctor_id),
        appointmentApi.queue(profile.doctor_id)
      ]).then(([analyticsRes, queueRes]) => {
        setAnalytics(analyticsRes.data.data);
        setTodayQueue(queueRes.data.data);
      }).catch(console.error).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [profile]);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await appointmentApi.update(id, { status });
      setTodayQueue(prev => prev.map(a => a.appointment_id === id ? { ...a, status } : a));
    } catch {}
  };

  if (loading) return <div className="space-y-6">{[...Array(3)].map((_, i) => <div key={i} className="loading-shimmer h-40 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, Doctor</h1>
        <p className="text-surface-200 text-sm mt-0.5">Here's your schedule for today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { icon: Calendar, label: "Today's Appointments", value: analytics?.todayAppointments || 0, color: 'from-primary-500 to-primary-700' },
          { icon: CheckCircle, label: 'Completed', value: analytics?.completedAppointments || 0, color: 'from-success-500/80 to-green-700' },
          { icon: Users, label: 'Total Patients', value: analytics?.totalAppointments || 0, color: 'from-accent-500 to-accent-700' },
          { icon: Stethoscope, label: 'Rating', value: `${analytics?.rating || 0}⭐`, color: 'from-amber-500 to-amber-700' },
        ].map((stat, i) => (
          <div key={i} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color} mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-surface-200">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Today's Queue */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary-400" />
          Today's Patient Queue
        </h3>
        {todayQueue.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <p className="text-surface-200">No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayQueue.map((apt, i) => (
              <div key={apt.appointment_id} className="flex items-center gap-4 bg-surface-700/30 rounded-xl p-4 hover:bg-surface-700/50 transition-all animate-slide-in-left" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-400 font-bold text-sm">
                  #{apt.queue_number}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{apt.patient_name}</p>
                  <p className="text-xs text-surface-200">{apt.gender}, {apt.age} yrs • {apt.time_slot}</p>
                </div>
                <span className={`badge ${
                  apt.status === 'in_progress' ? 'badge-warning' :
                  apt.status === 'confirmed' ? 'badge-info' : 'badge-neutral'
                }`}>
                  {apt.status}
                </span>
                <div className="flex gap-2">
                  {apt.status === 'scheduled' && (
                    <button onClick={() => handleStatusChange(apt.appointment_id, 'in_progress')} className="btn-primary text-xs px-3 py-1.5">Start</button>
                  )}
                  {apt.status === 'in_progress' && (
                    <button onClick={() => handleStatusChange(apt.appointment_id, 'completed')} className="btn-accent text-xs px-3 py-1.5">Complete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion Rate */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h3 className="text-base font-semibold text-white mb-3">Completion Rate</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 bg-surface-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent-500 to-success-500 rounded-full transition-all duration-1000" style={{ width: `${analytics?.completionRate || 0}%` }} />
            </div>
          </div>
          <span className="text-lg font-bold text-accent-400">{analytics?.completionRate || 0}%</span>
        </div>
      </div>
    </div>
  );
}
