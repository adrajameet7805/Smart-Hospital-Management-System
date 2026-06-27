const express = require('express');
const QRCode = require('qrcode');
const { queryOne, queryAll, runQuery } = require('../../config/db');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

/** POST /api/v1/qr/generate/:patientId — Generate QR for a patient */
router.post('/generate/:patientId', authenticate, authorize('admin', 'doctor'), asyncHandler(async (req, res) => {
  const patient = await queryOne('SELECT * FROM patients WHERE patient_id = $1', [req.params.patientId]);
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

  const payload = JSON.stringify({
    pid: patient.patient_id,
    uid: patient.user_id,
    ts: Date.now(),
  });

  const qrDataUrl = await QRCode.toDataURL(payload, { width: 300, margin: 2 });
  await runQuery('UPDATE patients SET qr_code = $1, updated_at = NOW() WHERE patient_id = $2',
    [payload, patient.patient_id]);

  res.json({ success: true, data: { qr: qrDataUrl, payload } });
}));

/** POST /api/v1/qr/checkin — Scan QR and check in patient */
router.post('/checkin', authenticate, asyncHandler(async (req, res) => {
  const { qr_payload } = req.body;
  let parsed;
  try { parsed = JSON.parse(qr_payload); } catch {
    return res.status(400).json({ success: false, message: 'Invalid QR code.' });
  }

  const patient = await queryOne(
    'SELECT p.*, u.name FROM patients p JOIN users u ON p.user_id = u.id WHERE p.patient_id = $1',
    [parsed.pid]
  );
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

  // Find today's appointment for this patient
  const appointment = await queryOne(
    `SELECT * FROM appointments WHERE patient_id = $1 AND date = CURRENT_DATE AND status IN ('scheduled','confirmed') ORDER BY time_slot ASC LIMIT 1`,
    [parsed.pid]
  );

  if (appointment) {
    await runQuery("UPDATE appointments SET status = 'confirmed', updated_at = NOW() WHERE appointment_id = $1", [appointment.appointment_id]);
  }

  res.json({
    success: true,
    message: `${patient.name} checked in successfully.`,
    data: { patient, appointment }
  });
}));

/** GET /api/v1/qr/patient/:patientId — Get QR for a patient */
router.get('/patient/:patientId', authenticate, asyncHandler(async (req, res) => {
  const patient = await queryOne(
    'SELECT p.*, u.name FROM patients p JOIN users u ON p.user_id = u.id WHERE p.patient_id = $1',
    [req.params.patientId]
  );
  if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

  if (!patient.qr_code) {
    return res.status(404).json({ success: false, message: 'No QR code generated for this patient.' });
  }

  const qrDataUrl = await QRCode.toDataURL(patient.qr_code, { width: 300, margin: 2 });
  res.json({ success: true, data: { qr: qrDataUrl, patient_name: patient.name } });
}));

module.exports = router;
