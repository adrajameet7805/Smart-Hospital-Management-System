import { useState, useEffect, useRef } from 'react';
import { qrApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { QrCode, Camera, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';

export default function QRCheckin() {
  const { profile } = useAuth();
  const [qrImage, setQrImage] = useState<string>('');
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'myqr' | 'scan'>('myqr');
  const inputRef = useRef<HTMLInputElement>(null);

  // Load patient's QR on mount
  useEffect(() => {
    if (profile?.patient_id) {
      loadQR(profile.patient_id);
    }
  }, [profile]);

  const loadQR = async (patientId: number) => {
    try {
      const res = await qrApi.getPatientQr(patientId);
      setQrImage(res.data.data.qr);
    } catch {
      // No QR generated yet — generate one
      try {
        const res = await qrApi.generate(patientId);
        setQrImage(res.data.data.qr);
      } catch {
        setError('Could not load QR code.');
      }
    }
  };

  const handleScan = async () => {
    if (!scanInput.trim()) return;
    setLoading(true);
    setError('');
    setScanResult(null);

    try {
      const res = await qrApi.checkin(scanInput.trim());
      setScanResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          QR Patient Check-In
        </h1>
        <p className="text-surface-200 text-sm mt-1">View your QR code or scan to check in for appointments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('myqr')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'myqr'
              ? 'bg-primary-600/30 text-primary-300 border border-primary-500/30'
              : 'bg-surface-700/30 text-surface-200 border border-surface-600/30 hover:bg-surface-700/50'
          }`}
        >
          <QrCode className="w-4 h-4 inline mr-2" /> My QR Code
        </button>
        <button
          onClick={() => { setActiveTab('scan'); setTimeout(() => inputRef.current?.focus(), 100); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'scan'
              ? 'bg-primary-600/30 text-primary-300 border border-primary-500/30'
              : 'bg-surface-700/30 text-surface-200 border border-surface-600/30 hover:bg-surface-700/50'
          }`}
        >
          <Camera className="w-4 h-4 inline mr-2" /> Scan & Check In
        </button>
      </div>

      {/* My QR Tab */}
      {activeTab === 'myqr' && (
        <div className="glass-card p-8 text-center">
          {qrImage ? (
            <div className="space-y-4">
              <p className="text-sm text-surface-200">Show this QR code at the hospital reception for quick check-in</p>
              <div className="inline-block p-4 bg-white rounded-2xl shadow-xl">
                <img src={qrImage} alt="Patient QR Code" className="w-64 h-64" />
              </div>
              <div>
                <a href={qrImage} download="my-hospital-qr.png"
                  className="btn-ghost inline-flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" /> Download QR Code
                </a>
              </div>
            </div>
          ) : (
            <div className="py-12">
              <QrCode className="w-16 h-16 text-surface-500 mx-auto mb-4" />
              <p className="text-surface-300">No QR code available.</p>
              <p className="text-surface-400 text-sm mt-1">Contact the hospital to generate your QR code.</p>
            </div>
          )}
        </div>
      )}

      {/* Scan Tab */}
      {activeTab === 'scan' && (
        <div className="glass-card p-6 space-y-4">
          <p className="text-sm text-surface-200">Paste the QR code data to check in a patient</p>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleScan()}
              className="input-field flex-1"
              placeholder='Paste QR data (e.g., {"pid":1,"uid":7,"ts":...})'
            />
            <button onClick={handleScan} disabled={loading || !scanInput.trim()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              Check In
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-500/10 border border-danger-500/20">
              <AlertCircle className="w-4 h-4 text-danger-400" />
              <p className="text-sm text-danger-400">{error}</p>
            </div>
          )}

          {scanResult && (
            <div className="p-4 rounded-xl bg-success-500/10 border border-success-500/20 animate-fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-success-400" />
                <div>
                  <p className="text-sm font-semibold text-white">{scanResult.message}</p>
                  {scanResult.data?.appointment && (
                    <p className="text-xs text-surface-200 mt-1">
                      Appointment at {scanResult.data.appointment.time_slot} confirmed
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
