import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, CheckCircle, Clock, FileText } from 'lucide-react';
import api from '../../lib/api';

export default function DoctorAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'doctor') return;
    
    api.get(`/doctors/${user.id}/analytics`)
      .then(res => setData(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto"></div></div>;
  if (!data) return <div className="p-8 text-center text-surface-400">Failed to load analytics.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Performance Analytics</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-surface-300 text-sm">Total Appointments</p>
            <p className="text-2xl font-bold text-white">{data.totalAppointments}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-surface-300 text-sm">Completed</p>
            <p className="text-2xl font-bold text-white">{data.completedAppointments}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-success-500/10 flex items-center justify-center text-success-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-surface-300 text-sm">Completion Rate</p>
            <p className="text-2xl font-bold text-white">{data.completionRate}%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-warning-500/10 flex items-center justify-center text-warning-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>
        <div className="glass-card p-4 flex items-center justify-between">
          <div>
            <p className="text-surface-300 text-sm">Prescriptions Issued</p>
            <p className="text-2xl font-bold text-white">{data.totalPrescriptions}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Trend */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Appointments Trend (Last 6 Months)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  cursor={{ fill: '#334155', opacity: 0.4 }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mock Rating Trend */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Patient Satisfaction Rating</h2>
          <div className="h-72 flex flex-col justify-center items-center">
             <div className="text-5xl font-bold text-white mb-2">{data.rating} <span className="text-2xl text-surface-400">/ 5.0</span></div>
             <p className="text-surface-300">Based on {data.totalReviews} reviews</p>
             
             {/* Progress bar to simulate high rating */}
             <div className="w-full max-w-sm mt-8 h-3 bg-surface-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-warning-500 to-success-500 rounded-full" style={{ width: `${(data.rating / 5) * 100}%` }}></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
