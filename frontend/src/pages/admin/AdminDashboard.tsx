import { useState, useEffect } from 'react';
import { analyticsApi } from '../../lib/api';
import {
  Users, UserCog, Calendar, CreditCard, BedDouble, Truck, Pill, TrendingUp,
  TrendingDown, AlertTriangle, Activity, ArrowUpRight, Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const CHART_COLORS = ['#3b82f6', '#14b8a6', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e', '#ec4899'];

function StatCard({ icon: Icon, label, value, change, color, delay = 0 }: any) {
  return (
    <div className="stat-card animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-xs text-surface-200">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.dashboard()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="loading-shimmer h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="loading-shimmer h-80 rounded-xl" />
          <div className="loading-shimmer h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const statusData = data?.statusDistribution?.map((s: any) => ({ name: s.status, value: s.count })) || [];
  const deptData = data?.departmentStats || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-surface-200 text-sm mt-0.5">Welcome back! Here's what's happening at your hospital.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-surface-200">
          <Clock className="w-3.5 h-3.5" />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Total Patients" value={stats?.totalPatients || 0} change={12} color="from-primary-500 to-primary-700" delay={0} />
        <StatCard icon={UserCog} label="Total Doctors" value={stats?.totalDoctors || 0} change={5} color="from-accent-500 to-accent-700" delay={50} />
        <StatCard icon={Calendar} label="Today's Appointments" value={stats?.todayAppointments || 0} color="from-violet-500 to-violet-700" delay={100} />
        <StatCard icon={CreditCard} label="Total Revenue" value={`₹${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`} change={18} color="from-emerald-500 to-emerald-700" delay={150} />
        <StatCard icon={BedDouble} label="Beds Available" value={`${stats?.beds?.available || 0}/${stats?.beds?.total || 0}`} color="from-blue-500 to-blue-700" delay={200} />
        <StatCard icon={Truck} label="Ambulances Ready" value={`${stats?.ambulances?.available || 0}/${stats?.ambulances?.total || 0}`} color="from-orange-500 to-orange-700" delay={250} />
        <StatCard icon={Pill} label="Low Stock Meds" value={stats?.lowStockMedicines || 0} color="from-rose-500 to-rose-700" delay={300} />
        <StatCard icon={Activity} label="Pending Bills" value={stats?.pendingBills || 0} color="from-amber-500 to-amber-700" delay={350} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Pie */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-base font-semibold text-white mb-4">Appointment Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_: any, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e5e7eb' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Bar Chart */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-base font-semibold text-white mb-4">Appointments by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="department" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1a2035', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#e5e7eb' }} />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Recent Appointments</h3>
          <button className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentAppointments?.map((apt: any) => (
                <tr key={apt.appointment_id}>
                  <td className="font-medium text-white">{apt.patient_name}</td>
                  <td>{apt.doctor_name}</td>
                  <td>{apt.specialization}</td>
                  <td>{apt.date}</td>
                  <td>{apt.time_slot}</td>
                  <td>
                    <span className={`badge ${
                      apt.status === 'completed' ? 'badge-success' :
                      apt.status === 'scheduled' ? 'badge-info' :
                      apt.status === 'confirmed' ? 'badge-warning' :
                      apt.status === 'cancelled' ? 'badge-danger' : 'badge-neutral'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bed Occupancy Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-base font-semibold text-white mb-3">Bed Occupancy</h3>
          <div className="space-y-3">
            {stats?.beds && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-surface-200">Occupancy Rate</span>
                    <span className="text-white font-medium">{stats.beds.total > 0 ? ((stats.beds.occupied / stats.beds.total) * 100).toFixed(0) : 0}%</span>
                  </div>
                  <div className="h-2 bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-1000"
                      style={{ width: `${stats.beds.total > 0 ? (stats.beds.occupied / stats.beds.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-surface-700/40 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-success-400">{stats.beds.available}</p>
                    <p className="text-xs text-surface-200">Available</p>
                  </div>
                  <div className="bg-surface-700/40 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-warning-400">{stats.beds.occupied}</p>
                    <p className="text-xs text-surface-200">Occupied</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.55s' }}>
          <h3 className="text-base font-semibold text-white mb-3">Ambulance Fleet</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-success-500/10 rounded-xl p-4 text-center border border-success-500/10">
              <Truck className="w-6 h-6 text-success-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-success-400">{stats?.ambulances?.available || 0}</p>
              <p className="text-xs text-surface-200">Available</p>
            </div>
            <div className="bg-warning-500/10 rounded-xl p-4 text-center border border-warning-500/10">
              <Activity className="w-6 h-6 text-warning-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-warning-400">{(stats?.ambulances?.total || 0) - (stats?.ambulances?.available || 0)}</p>
              <p className="text-xs text-surface-200">Active</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <h3 className="text-base font-semibold text-white mb-3">Alerts</h3>
          <div className="space-y-2">
            {stats?.lowStockMedicines > 0 && (
              <div className="flex items-center gap-3 bg-warning-500/10 rounded-xl p-3 border border-warning-500/10">
                <AlertTriangle className="w-4 h-4 text-warning-400 flex-shrink-0" />
                <p className="text-xs text-warning-400">{stats.lowStockMedicines} medicines running low on stock</p>
              </div>
            )}
            {stats?.pendingBills > 0 && (
              <div className="flex items-center gap-3 bg-info-500/10 rounded-xl p-3 border border-info-500/10">
                <CreditCard className="w-4 h-4 text-info-400 flex-shrink-0" />
                <p className="text-xs text-info-400">{stats.pendingBills} bills pending payment</p>
              </div>
            )}
            <div className="flex items-center gap-3 bg-success-500/10 rounded-xl p-3 border border-success-500/10">
              <Activity className="w-4 h-4 text-success-400 flex-shrink-0" />
              <p className="text-xs text-success-400">All systems operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
