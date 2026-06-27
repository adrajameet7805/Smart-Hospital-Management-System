import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../lib/api';
import { Bell, Search, LogOut, User, ChevronDown, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    analyticsApi.notifications()
      .then(res => {
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      })
      .catch(() => {});
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await analyticsApi.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const roleColors: Record<string, string> = {
    admin: 'from-violet-500 to-purple-600',
    doctor: 'from-primary-500 to-blue-600',
    patient: 'from-accent-500 to-teal-600',
  };

  return (
    <header className="sticky top-0 z-30 glass px-6 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200" />
          <input
            type="text"
            placeholder="Search patients, doctors, appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 py-2 text-sm bg-surface-800/50"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="relative p-2 rounded-xl text-surface-200 hover:text-white hover:bg-white/5 transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-96 glass-card rounded-2xl shadow-lg overflow-hidden animate-scale-in" style={{ maxHeight: '400px' }}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)}>
                    <X className="w-4 h-4 text-surface-200 hover:text-white" />
                  </button>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: '340px' }}>
                  {notifications.length === 0 ? (
                    <p className="text-center text-surface-200 text-sm py-8">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map(n => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`px-4 py-3 border-b border-white/3 cursor-pointer hover:bg-white/3 transition-all ${
                          !n.read ? 'bg-primary-600/5' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            !n.read ? 'bg-primary-500' : 'bg-surface-400'
                          }`} />
                          <div>
                            <p className="text-sm font-medium text-white">{n.title}</p>
                            <p className="text-xs text-surface-200 mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="flex items-center gap-3 py-1.5 px-3 rounded-xl hover:bg-white/5 transition-all"
            >
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColors[user?.role || 'patient']} flex items-center justify-center`}>
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-[11px] text-surface-200 capitalize">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-surface-200" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-14 w-56 glass-card rounded-2xl shadow-lg overflow-hidden animate-scale-in">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-surface-200">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-danger-400 hover:bg-danger-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
