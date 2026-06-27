import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send HTTP-Only cookies automatically
});

// Handle 401 responses — redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/login', '/register', '/forgot-password'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Patient API
export const patientApi = {
  list: (params?: any) => api.get('/patients', { params }),
  get: (id: number) => api.get(`/patients/${id}`),
  update: (id: number, data: any) => api.put(`/patients/${id}`, data),
  delete: (id: number) => api.delete(`/patients/${id}`),
  history: (id: number) => api.get(`/patients/${id}/history`),
};

// Doctor API
export const doctorApi = {
  list: (params?: any) => api.get('/doctors', { params }),
  get: (id: number) => api.get(`/doctors/${id}`),
  updateSchedule: (id: number, data: any) => api.put(`/doctors/${id}/schedule`, data),
  appointments: (id: number, params?: any) => api.get(`/doctors/${id}/appointments`, { params }),
  analytics: (id: number) => api.get(`/doctors/${id}/analytics`),
};

// Appointment API
export const appointmentApi = {
  list: (params?: any) => api.get('/appointments', { params }),
  create: (data: any) => api.post('/appointments', data),
  update: (id: number, data: any) => api.put(`/appointments/${id}`, data),
  cancel: (id: number) => api.delete(`/appointments/${id}`),
  queue: (doctorId: number) => api.get(`/appointments/queue/${doctorId}`),
};

// Billing API
export const billingApi = {
  list: (params?: any) => api.get('/billing', { params }),
  get: (id: number) => api.get(`/billing/${id}`),
  create: (data: any) => api.post('/billing', data),
  pay: (id: number, data: any) => api.put(`/billing/${id}/pay`, data),
};

// Pharmacy API
export const pharmacyApi = {
  medicines: (params?: any) => api.get('/pharmacy/medicines', { params }),
  addMedicine: (data: any) => api.post('/pharmacy/medicines', data),
  updateMedicine: (id: number, data: any) => api.put(`/pharmacy/medicines/${id}`, data),
  fulfill: (prescriptionId: number) => api.post('/pharmacy/fulfill', { prescription_id: prescriptionId }),
};

// Ambulance API
export const ambulanceApi = {
  list: (params?: any) => api.get('/ambulance', { params }),
  request: (data: any) => api.post('/ambulance/request', data),
  updateLocation: (id: number, data: any) => api.put(`/ambulance/${id}/location`, data),
  track: (id: number) => api.get(`/ambulance/${id}/track`),
};

// Analytics API
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
  revenue: (params?: any) => api.get('/analytics/revenue', { params }),
  patients: () => api.get('/analytics/patients'),
  beds: () => api.get('/analytics/beds'),
  notifications: () => api.get('/analytics/notifications'),
  markRead: (id: number) => api.put(`/analytics/notifications/${id}/read`),
};

// QR Check-In API
export const qrApi = {
  generate: (patientId: number) => api.post(`/qr/generate/${patientId}`),
  checkin: (qrPayload: string) => api.post('/qr/checkin', { qr_payload: qrPayload }),
  getPatientQr: (patientId: number) => api.get(`/qr/patient/${patientId}`),
};

// Separate Axios instance for AI service — bypasses /api/v1 prefix
const aiAxios = axios.create({ baseURL: '/api/ai' });

export const aiApi = {
  triage: (data: { symptoms: string[]; age?: number; gender?: string }) =>
    aiAxios.post('/triage', data),

  summarizeReport: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return aiAxios.post('/summarize-report', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  voiceCommand: (command: string, role: string) =>
    aiAxios.post('/command', { command, role }),

  predictive: () =>
    aiAxios.get('/predictive'),
};
