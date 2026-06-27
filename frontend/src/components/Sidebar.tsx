import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, UserCog, Calendar, FileText, CreditCard,
  Pill, Truck, BarChart3, Settings, ChevronLeft, ChevronRight,
  Stethoscope, BedDouble, ClipboardList, Activity, Heart
} from 'lucide-react';

const navItems = {
  admin: [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/doctors', icon: UserCog, label: 'Doctors' },
    { path: '/admin/patients', icon: Users, label: 'Patients' },
    { path: '/admin/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/admin/beds', icon: BedDouble, label: 'Beds' },
    { path: '/admin/ambulance', icon: Truck, label: 'Ambulance' },
    { path: '/admin/pharmacy', icon: Pill, label: 'Pharmacy' },
    { path: '/admin/billing', icon: CreditCard, label: 'Billing' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ],
  doctor: [
    { path: '/doctor', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/doctor/patients', icon: Users, label: 'Patients' },
    { path: '/doctor/prescriptions', icon: ClipboardList, label: 'Prescriptions' },
    { path: '/doctor/analytics', icon: Activity, label: 'Analytics' },
  ],
  patient: [
    { path: '/patient', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/patient/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/patient/prescriptions', icon: FileText, label: 'Prescriptions' },
    { path: '/patient/billing', icon: CreditCard, label: 'Billing' },
    { path: '/patient/history', icon: ClipboardList, label: 'Medical History' },
  ],
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || 'patient';
  const items = navItems[role as keyof typeof navItems] || [];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{
        background: 'linear-gradient(180deg, rgba(10, 14, 26, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <Heart className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold text-white tracking-tight">Smart Hospital</h1>
            <p className="text-[10px] text-surface-100 uppercase tracking-widest">Management System</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== `/${role}` && location.pathname.startsWith(item.path));

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-surface-100 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary-500 rounded-r-full" />
              )}
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                isActive ? 'text-primary-400' : 'text-surface-200 group-hover:text-white'
              }`} />
              {!collapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-surface-200 hover:text-white hover:bg-white/5 transition-all text-sm"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
