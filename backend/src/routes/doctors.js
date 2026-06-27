const express = require('express');
const { queryAll, queryOne, runQuery } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/** GET /api/doctors */
router.get('/', authenticate, (req, res) => {
  try {
    const { specialization, department, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = ['u.is_active = 1'];
    let params = [];

    if (specialization) { conditions.push('d.specialization = ?'); params.push(specialization); }
    if (department) { conditions.push('d.department = ?'); params.push(department); }
    if (search) { conditions.push('(u.name LIKE ? OR d.specialization LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const doctors = queryAll(
      `SELECT d.*, u.name, u.email, u.phone, u.avatar FROM doctors d JOIN users u ON d.user_id = u.id ${where} ORDER BY d.rating DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const total = queryOne(`SELECT COUNT(*) as count FROM doctors d JOIN users u ON d.user_id = u.id ${where}`, params)?.count || 0;

    res.json({ success: true, data: { doctors, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } } });
  } catch (err) {
    console.error('List doctors error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** GET /api/doctors/:id */
router.get('/:id', authenticate, (req, res) => {
  try {
    const doctor = queryOne(
      `SELECT d.*, u.name, u.email, u.phone, u.avatar FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.doctor_id = ?`,
      [req.params.id]
    );
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found.' });
    res.json({ success: true, data: doctor });
  } catch (err) {
    console.error('Get doctor error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** POST /api/doctors (admin) */
router.post('/', authenticate, authorize('admin'), (req, res) => {
  try {
    const { user_id, specialization, department, experience, qualification, license_number, consultation_fee, bio } = req.body;
    const result = runQuery(
      `INSERT INTO doctors (user_id, specialization, department, experience, qualification, license_number, consultation_fee, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, specialization, department, experience || 0, qualification, license_number, consultation_fee || 0, bio]
    );
    const doctor = queryOne('SELECT * FROM doctors WHERE doctor_id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, data: doctor });
  } catch (err) {
    console.error('Add doctor error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** PUT /api/doctors/:id/schedule */
router.put('/:id/schedule', authenticate, (req, res) => {
  try {
    const { working_hours_start, working_hours_end, working_days, max_patients_per_day, availability_status } = req.body;
    runQuery(`UPDATE doctors SET working_hours_start=COALESCE(?,working_hours_start), working_hours_end=COALESCE(?,working_hours_end),
      working_days=COALESCE(?,working_days), max_patients_per_day=COALESCE(?,max_patients_per_day),
      availability_status=COALESCE(?,availability_status), updated_at=datetime('now') WHERE doctor_id=?`,
      [working_hours_start, working_hours_end, working_days, max_patients_per_day, availability_status, req.params.id]);
    const doctor = queryOne('SELECT * FROM doctors WHERE doctor_id = ?', [req.params.id]);
    res.json({ success: true, data: doctor });
  } catch (err) {
    console.error('Update schedule error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** GET /api/doctors/:id/appointments */
router.get('/:id/appointments', authenticate, (req, res) => {
  try {
    const { date, status } = req.query;
    let conditions = ['a.doctor_id = ?'];
    let params = [req.params.id];
    if (date) { conditions.push('a.date = ?'); params.push(date); }
    if (status) { conditions.push('a.status = ?'); params.push(status); }

    const appointments = queryAll(
      `SELECT a.*, u.name as patient_name, p.age, p.gender, p.blood_group FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id JOIN users u ON p.user_id = u.id
       WHERE ${conditions.join(' AND ')} ORDER BY a.date ASC, a.time_slot ASC`, params);
    res.json({ success: true, data: appointments });
  } catch (err) {
    console.error('Doctor appointments error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** GET /api/doctors/:id/analytics */
router.get('/:id/analytics', authenticate, (req, res) => {
  try {
    const id = req.params.id;
    const totalAppointments = queryOne('SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ?', [id])?.count || 0;
    const completedAppointments = queryOne('SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND status = "completed"', [id])?.count || 0;
    const todayAppointments = queryOne('SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND date = date("now")', [id])?.count || 0;
    const totalPrescriptions = queryOne('SELECT COUNT(*) as count FROM prescriptions WHERE doctor_id = ?', [id])?.count || 0;
    const doctor = queryOne('SELECT rating, total_reviews FROM doctors WHERE doctor_id = ?', [id]);
    const monthlyTrend = queryAll(
      `SELECT strftime('%Y-%m', date) as month, COUNT(*) as count FROM appointments WHERE doctor_id = ? AND date >= date('now', '-6 months') GROUP BY strftime('%Y-%m', date) ORDER BY month ASC`, [id]);

    res.json({ success: true, data: {
      totalAppointments, completedAppointments, todayAppointments, totalPrescriptions,
      rating: doctor?.rating || 0, totalReviews: doctor?.total_reviews || 0,
      completionRate: totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0,
      monthlyTrend
    }});
  } catch (err) {
    console.error('Doctor analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
