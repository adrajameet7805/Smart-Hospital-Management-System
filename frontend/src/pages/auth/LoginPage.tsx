import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Heart, Mail, Lock, ArrowRight, Eye, EyeOff, Stethoscope, Shield, User } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect after user state updates from login
  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh relative overflow-hidden" style={{ background: 'var(--color-surface-900)' }}>
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-primary-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-accent-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/5 blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)' }}>
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Smart Hospital</h1>
          <p className="text-surface-200 text-sm">AI-Powered Healthcare Management</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-semibold text-white mb-1">Welcome Back</h2>
          <p className="text-surface-200 text-sm mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-100 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-100 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-200 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-surface-200 cursor-pointer">
                <input type="checkbox" className="rounded border-surface-400 bg-surface-700" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary-400 hover:text-primary-300">
                Forgot password?
              </Link>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-200">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Create Account
            </Link>
          </p>
        </div>

        {/* Quick Login Cards */}
        <div className="mt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-center text-xs text-surface-200 mb-3 uppercase tracking-wider">Quick Demo Access</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => quickLogin('admin@smarthospital.com', 'admin123')}
              className="glass-card p-3 text-center hover:border-violet-500/30 group cursor-pointer"
            >
              <Shield className="w-5 h-5 text-violet-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-surface-100">Admin</span>
            </button>
            <button
              onClick={() => quickLogin('aisha.patel@smarthospital.com', 'doctor123')}
              className="glass-card p-3 text-center hover:border-primary-500/30 group cursor-pointer"
            >
              <Stethoscope className="w-5 h-5 text-primary-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-surface-100">Doctor</span>
            </button>
            <button
              onClick={() => quickLogin('arjun.mehta@email.com', 'patient123')}
              className="glass-card p-3 text-center hover:border-accent-500/30 group cursor-pointer"
            >
              <User className="w-5 h-5 text-accent-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-surface-100">Patient</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
