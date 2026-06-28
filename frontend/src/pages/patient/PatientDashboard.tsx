import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentApi, billingApi } from '../../lib/api';
import { Calendar, FileText, CreditCard, Activity, ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatientDashboard() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      appointmentApi.list({ limit: 5 }),
      billingApi.list({ limit: 5 }),
    ]).then(([aptsRes, billsRes]) => {
      setAppointments(aptsRes.data.data.appointments);
      setBills(billsRes.data.data.bills);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6">{[...Array(3)].map((_, i) => <div key={i} className="loading-shimmer h-40 rounded-xl" />)}</div>;

  const upcomingCount = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length;
  const pendingBills = bills.filter(b => b.payment_status === 'pending').length;
  const totalSpent = bills.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.total, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card p-8 relative overflow-hidden animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary-500/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-surface-200 mt-1 text-sm">Here's a summary of your health records and upcoming visits.</p>
          <div className="flex gap-3 mt-4">
            <Link to="/patient/appointments" className="btn-primary">
              <Plus className="w-4 h-4" /> Book Appointment
            </Link>
            <Link to="/patient/history" className="btn-ghost">View History</Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { icon: Calendar, label: 'Upcoming', value: upcomingCount, color: 'from-primary-500 to-primary-700' },
          { icon: FileText, label: 'Prescriptions', value: appointments.filter(a => a.status === 'completed').length, color: 'from-accent-500 to-accent-700' },
          { icon: CreditCard, label: 'Pending Bills', value: pendingBills, color: 'from-warning-500/80 to-amber-700' },
          { icon: Activity, label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, color: 'from-emerald-500 to-emerald-700' },
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

      {/* Profile Summary */}
      {profile && (
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-base font-semibold text-white mb-4">Health Profile</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-700/30 rounded-xl p-4">
              <p className="text-xs text-surface-200 mb-1">Blood Group</p>
              <p className="text-lg font-bold text-danger-400">{profile.blood_group || 'N/A'}</p>
            </div>
            <div className="bg-surface-700/30 rounded-xl p-4">
              <p className="text-xs text-surface-200 mb-1">Age</p>
              <p className="text-lg font-bold text-white">{profile.age || 'N/A'} yrs</p>
            </div>
            <div className="bg-surface-700/30 rounded-xl p-4">
              <p className="text-xs text-surface-200 mb-1">Allergies</p>
              <p className="text-sm font-medium text-warning-400">{profile.allergies || 'None'}</p>
            </div>
            <div className="bg-surface-700/30 rounded-xl p-4">
              <p className="text-xs text-surface-200 mb-1">Chronic Conditions</p>
              <p className="text-sm font-medium text-info-400">{profile.chronic_conditions || 'None'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Upcoming Appointments</h3>
          <Link to="/patient/appointments" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        {appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-10 h-10 text-surface-300 mx-auto mb-2" />
            <p className="text-surface-200 text-sm">No upcoming appointments</p>
            <Link to="/patient/appointments" className="btn-primary mt-3 inline-flex"><Plus className="w-4 h-4" /> Book Now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).slice(0, 3).map((apt, i) => (
              <div key={apt.appointment_id} className="flex items-center gap-4 bg-surface-700/30 rounded-xl p-4 animate-slide-in-left" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-primary-600/20 flex flex-col items-center justify-center">
                  <span className="text-xs text-primary-400 font-medium">{new Date(apt.date).toLocaleDateString('en', { month: 'short' })}</span>
                  <span className="text-lg font-bold text-white leading-none">{new Date(apt.date).getDate()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{apt.doctor_name}</p>
                  <p className="text-xs text-surface-200">{apt.specialization} • {apt.time_slot}</p>
                </div>
                <span className={`badge ${apt.status === 'confirmed' ? 'badge-success' : 'badge-info'}`}>{apt.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
