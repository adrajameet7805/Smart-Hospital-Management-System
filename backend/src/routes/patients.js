const express = require('express');
const { queryAll, queryOne, runQuery } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/** GET /api/patients */
router.get('/', authenticate, authorize('admin', 'doctor'), (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let patients, total;
    if (search) {
      const s = `%${search}%`;
      patients = queryAll(
        `SELECT p.*, u.name, u.email, u.phone, u.is_active FROM patients p JOIN users u ON p.user_id = u.id 
         WHERE u.name LIKE ? OR u.email LIKE ? ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
        [s, s, Number(limit), Number(offset)]
      );
      total = queryOne(`SELECT COUNT(*) as count FROM patients p JOIN users u ON p.user_id = u.id WHERE u.name LIKE ? OR u.email LIKE ?`, [s, s])?.count || 0;
    } else {
      patients = queryAll(
        `SELECT p.*, u.name, u.email, u.phone, u.is_active FROM patients p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
        [Number(limit), Number(offset)]
      );
      total = queryOne('SELECT COUNT(*) as count FROM patients')?.count || 0;
    }

    res.json({ success: true, data: { patients, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } } });
  } catch (err) {
    console.error('List patients error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** GET /api/patients/:id */
router.get('/:id', authenticate, (req, res) => {
  try {
    const patient = queryOne(
      `SELECT p.*, u.name, u.email, u.phone, u.avatar, u.is_active FROM patients p JOIN users u ON p.user_id = u.id WHERE p.patient_id = ?`,
      [req.params.id]
    );
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    if (req.user.role === 'patient') {
      const myProfile = queryOne('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.id]);
      if (!myProfile || myProfile.patient_id !== patient.patient_id) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    console.error('Get patient error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** PUT /api/patients/:id */
router.put('/:id', authenticate, (req, res) => {
  try {
    const { blood_group, age, gender, address, emergency_contact_name, emergency_contact_phone, allergies, chronic_conditions } = req.body;
    const patient = queryOne('SELECT * FROM patients WHERE patient_id = ?', [req.params.id]);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    if (req.user.role === 'patient' && patient.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    runQuery(`UPDATE patients SET blood_group=COALESCE(?,blood_group), age=COALESCE(?,age), gender=COALESCE(?,gender), 
      address=COALESCE(?,address), emergency_contact_name=COALESCE(?,emergency_contact_name), 
      emergency_contact_phone=COALESCE(?,emergency_contact_phone), allergies=COALESCE(?,allergies), 
      chronic_conditions=COALESCE(?,chronic_conditions), updated_at=datetime('now') WHERE patient_id=?`,
      [blood_group, age, gender, address, emergency_contact_name, emergency_contact_phone, allergies, chronic_conditions, req.params.id]);

    const updated = queryOne(`SELECT p.*, u.name, u.email, u.phone FROM patients p JOIN users u ON p.user_id = u.id WHERE p.patient_id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Patient updated.', data: updated });
  } catch (err) {
    console.error('Update patient error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** DELETE /api/patients/:id (admin) */
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const patient = queryOne('SELECT * FROM patients WHERE patient_id = ?', [req.params.id]);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });
    runQuery('UPDATE users SET is_active = 0 WHERE id = ?', [patient.user_id]);
    res.json({ success: true, message: 'Patient deactivated.' });
  } catch (err) {
    console.error('Delete patient error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** GET /api/patients/:id/history */
router.get('/:id/history', authenticate, (req, res) => {
  try {
    const patient = queryOne('SELECT * FROM patients WHERE patient_id = ?', [req.params.id]);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found.' });

    const appointments = queryAll(
      `SELECT a.*, u.name as doctor_name, d.specialization FROM appointments a
       JOIN doctors d ON a.doctor_id = d.doctor_id JOIN users u ON d.user_id = u.id
       WHERE a.patient_id = ? ORDER BY a.date DESC`, [req.params.id]);

    const prescriptions = queryAll(
      `SELECT p.*, u.name as doctor_name, d.specialization FROM prescriptions p
       JOIN doctors d ON p.doctor_id = d.doctor_id JOIN users u ON d.user_id = u.id
       WHERE p.patient_id = ? ORDER BY p.created_at DESC`, [req.params.id]);

    for (const p of prescriptions) {
      p.items = queryAll('SELECT * FROM prescription_items WHERE prescription_id = ?', [p.prescription_id]);
    }

    const bills = queryAll('SELECT * FROM billing WHERE patient_id = ? ORDER BY created_at DESC', [req.params.id]);

    res.json({ success: true, data: { patient, appointments, prescriptions, bills } });
  } catch (err) {
    console.error('Patient history error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
