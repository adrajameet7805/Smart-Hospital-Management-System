import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layout (always loaded)
import Layout from './components/Layout';

// Lazy-loaded pages — code splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const PatientManagement = lazy(() => import('./pages/admin/PatientManagement'));
const DoctorManagement = lazy(() => import('./pages/admin/DoctorManagement'));
const BedManagement = lazy(() => import('./pages/admin/BedManagement'));
const AmbulanceTracking = lazy(() => import('./pages/admin/AmbulanceTracking'));
const PharmacyPage = lazy(() => import('./pages/admin/PharmacyPage'));
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const AppointmentsPage = lazy(() => import('./pages/shared/AppointmentsPage'));
const BillingPage = lazy(() => import('./pages/shared/BillingPage'));
const AITriage = lazy(() => import('./pages/shared/AITriage'));
const QRCheckin = lazy(() => import('./pages/patient/QRCheckin'));

const AnalyticsPage = lazy(() => import('./pages/doctor/DoctorAnalytics'));
const PrescriptionsPage = lazy(() => import('./pages/shared/Prescriptions'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-surface-300 text-xs">Loading module...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-surface-900)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-200 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />;
  return <>{children}</>;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center glass-card p-12 animate-scale-in">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-surface-200 text-sm">This page is coming soon</p>
      </div>
    </div>
  );
}

// Temporary real component until full page is built
const PatientRecordsPage = () => (
  <div className="p-8 text-white">
    <h1 className="text-2xl font-bold mb-2">Patient Records</h1>
    <p className="text-gray-400">Module under construction. Data will appear here.</p>
  </div>
);

const MedicalHistoryPage = () => (
  <div className="p-8 text-white">
    <h1 className="text-2xl font-bold mb-2">Medical History</h1>
    <p className="text-gray-400">Module under construction. Data will appear here.</p>
  </div>
);

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/forgot-password" element={<LoginPage />} />

        {/* Admin Portal */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="patients" element={<PatientManagement />} />
          <Route path="doctors" element={<DoctorManagement />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="beds" element={<BedManagement />} />
          <Route path="ambulance" element={<AmbulanceTracking />} />
          <Route path="pharmacy" element={<PharmacyPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="ai-triage" element={<AITriage />} />
        </Route>

        {/* Doctor Portal */}
        <Route path="/doctor" element={<ProtectedRoute roles={['doctor']}><Layout /></ProtectedRoute>}>
          <Route index element={<DoctorDashboard />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="patients" element={<PatientRecordsPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="ai-triage" element={<AITriage />} />
        </Route>

        {/* Patient Portal */}
        <Route path="/patient" element={<ProtectedRoute roles={['patient']}><Layout /></ProtectedRoute>}>
          <Route index element={<PatientDashboard />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="history" element={<MedicalHistoryPage />} />
          <Route path="qr-checkin" element={<QRCheckin />} />
          <Route path="ai-triage" element={<AITriage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to={user ? `/${user.role}` : '/login'} replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
