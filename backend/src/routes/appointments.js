const express = require('express');
const { body, validationResult } = require('express-validator');
const { queryAll, queryOne, runQuery } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/** GET /api/appointments */
router.get('/', authenticate, (req, res) => {
  try {
    const { date, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];

    if (req.user.role === 'patient') {
      const patient = queryOne('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.id]);
      if (patient) { conditions.push('a.patient_id = ?'); params.push(patient.patient_id); }
    } else if (req.user.role === 'doctor') {
      const doctor = queryOne('SELECT doctor_id FROM doctors WHERE user_id = ?', [req.user.id]);
      if (doctor) { conditions.push('a.doctor_id = ?'); params.push(doctor.doctor_id); }
    }

    if (date) { conditions.push('a.date = ?'); params.push(date); }
    if (status) { conditions.push('a.status = ?'); params.push(status); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const appointments = queryAll(
      `SELECT a.*, pu.name as patient_name, p.age, p.gender,
        du.name as doctor_name, d.specialization, d.department
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id JOIN users pu ON p.user_id = pu.id
       JOIN doctors d ON a.doctor_id = d.doctor_id JOIN users du ON d.user_id = du.id
       ${where} ORDER BY a.date DESC, a.time_slot ASC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const total = queryOne(`SELECT COUNT(*) as count FROM appointments a ${where}`, params)?.count || 0;

    res.json({ success: true, data: { appointments, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } } });
  } catch (err) {
    console.error('List appointments error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** POST /api/appointments */
router.post('/', authenticate, [
  body('doctor_id').isInt(),
  body('date').notEmpty(),
  body('time_slot').notEmpty(),
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { doctor_id, date, time_slot, reason, type = 'general', patient_id: bodyPatientId } = req.body;
    let patient_id = bodyPatientId;
    if (req.user.role === 'patient') {
      const patient = queryOne('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.id]);
      if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found.' });
      patient_id = patient.patient_id;
    }

    const doctor = queryOne('SELECT * FROM doctors WHERE doctor_id = ?', [doctor_id]);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });

    const conflict = queryOne(
      'SELECT appointment_id FROM appointments WHERE doctor_id = ? AND date = ? AND time_slot = ? AND status NOT IN ("cancelled", "no_show")',
      [doctor_id, date, time_slot]
    );
    if (conflict) return res.status(409).json({ success: false, message: 'Time slot already booked.' });

    const queueCount = queryOne(
      'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND date = ? AND status NOT IN ("cancelled", "no_show")',
      [doctor_id, date]
    )?.count || 0;

    const result = runQuery(
      `INSERT INTO appointments (patient_id, doctor_id, date, time_slot, status, type, queue_number, reason)
       VALUES (?, ?, ?, ?, 'scheduled', ?, ?, ?)`,
      [patient_id, doctor_id, date, time_slot, type, queueCount + 1, reason]
    );

    const appointment = queryOne('SELECT * FROM appointments WHERE appointment_id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, message: 'Appointment booked.', data: appointment });
  } catch (err) {
    console.error('Book appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** PUT /api/appointments/:id */
router.put('/:id', authenticate, (req, res) => {
  try {
    const { status, notes, time_slot, date } = req.body;
    const appointment = queryOne('SELECT * FROM appointments WHERE appointment_id = ?', [req.params.id]);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });

    runQuery(`UPDATE appointments SET status=COALESCE(?,status), notes=COALESCE(?,notes),
      time_slot=COALESCE(?,time_slot), date=COALESCE(?,date), updated_at=datetime('now') WHERE appointment_id=?`,
      [status, notes, time_slot, date, req.params.id]);

    const updated = queryOne(
      `SELECT a.*, pu.name as patient_name, du.name as doctor_name FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id JOIN users pu ON p.user_id = pu.id
       JOIN doctors d ON a.doctor_id = d.doctor_id JOIN users du ON d.user_id = du.id
       WHERE a.appointment_id = ?`, [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** DELETE /api/appointments/:id */
router.delete('/:id', authenticate, (req, res) => {
  try {
    const appointment = queryOne('SELECT * FROM appointments WHERE appointment_id = ?', [req.params.id]);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' });
    runQuery('UPDATE appointments SET status = "cancelled", updated_at = datetime("now") WHERE appointment_id = ?', [req.params.id]);
    res.json({ success: true, message: 'Appointment cancelled.' });
  } catch (err) {
    console.error('Cancel appointment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** GET /api/appointments/queue/:doctorId */
router.get('/queue/:doctorId', authenticate, (req, res) => {
  try {
    const queue = queryAll(
      `SELECT a.*, pu.name as patient_name, p.age, p.gender FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id JOIN users pu ON p.user_id = pu.id
       WHERE a.doctor_id = ? AND a.date = date('now') AND a.status IN ('scheduled', 'confirmed', 'in_progress')
       ORDER BY a.queue_number ASC`, [req.params.doctorId]);
    res.json({ success: true, data: queue });
  } catch (err) {
    console.error('Get queue error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
