const express = require('express');
const { queryAll, queryOne, runQuery } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/** GET /api/analytics/dashboard */
router.get('/dashboard', authenticate, authorize('admin'), (req, res) => {
  try {
    const totalPatients = queryOne('SELECT COUNT(*) as count FROM patients')?.count || 0;
    const totalDoctors = queryOne('SELECT COUNT(*) as count FROM doctors')?.count || 0;
    const totalAppointments = queryOne('SELECT COUNT(*) as count FROM appointments')?.count || 0;
    const todayAppointments = queryOne('SELECT COUNT(*) as count FROM appointments WHERE date = date("now")')?.count || 0;
    const totalRevenue = queryOne('SELECT COALESCE(SUM(total), 0) as total FROM billing WHERE payment_status = "paid"')?.total || 0;
    const pendingBills = queryOne('SELECT COUNT(*) as count FROM billing WHERE payment_status = "pending"')?.count || 0;
    const availableBeds = queryOne('SELECT COUNT(*) as count FROM beds WHERE status = "available"')?.count || 0;
    const occupiedBeds = queryOne('SELECT COUNT(*) as count FROM beds WHERE status = "occupied"')?.count || 0;
    const totalBeds = queryOne('SELECT COUNT(*) as count FROM beds')?.count || 0;
    const availableAmbulances = queryOne('SELECT COUNT(*) as count FROM ambulances WHERE status = "available"')?.count || 0;
    const totalAmbulances = queryOne('SELECT COUNT(*) as count FROM ambulances')?.count || 0;
    const lowStockMedicines = queryOne('SELECT COUNT(*) as count FROM medicines WHERE stock <= min_stock')?.count || 0;

    const recentAppointments = queryAll(
      `SELECT a.*, pu.name as patient_name, du.name as doctor_name, d.specialization
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id JOIN users pu ON p.user_id = pu.id
       JOIN doctors d ON a.doctor_id = d.doctor_id JOIN users du ON d.user_id = du.id
       ORDER BY a.created_at DESC LIMIT 5`
    );

    const statusDistribution = queryAll('SELECT status, COUNT(*) as count FROM appointments GROUP BY status');
    const departmentStats = queryAll(
      `SELECT d.department, COUNT(*) as count FROM appointments a
       JOIN doctors d ON a.doctor_id = d.doctor_id WHERE d.department IS NOT NULL
       GROUP BY d.department ORDER BY count DESC`
    );

    res.json({ success: true, data: {
      stats: { totalPatients, totalDoctors, totalAppointments, todayAppointments, totalRevenue, pendingBills,
        beds: { available: availableBeds, occupied: occupiedBeds, total: totalBeds },
        ambulances: { available: availableAmbulances, total: totalAmbulances }, lowStockMedicines },
      recentAppointments, statusDistribution, departmentStats
    }});
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** GET /api/analytics/revenue */
router.get('/revenue', authenticate, authorize('admin'), (req, res) => {
  try {
    const revenue = queryAll(
      `SELECT strftime('%Y-%m', created_at) as period,
        SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END) as collected,
        SUM(CASE WHEN payment_status = 'pending' THEN total ELSE 0 END) as pending,
        COUNT(*) as bill_count
       FROM billing WHERE created_at >= date('now', '-12 months')
       GROUP BY strftime('%Y-%m', created_at) ORDER BY period ASC`
    );
    const byCategory = queryAll(
      `SELECT bi.category, SUM(bi.amount) as total FROM billing_items bi
       JOIN billing b ON bi.bill_id = b.bill_id WHERE b.payment_status = 'paid'
       GROUP BY bi.category ORDER BY total DESC`
    );
    const byMethod = queryAll(
      `SELECT payment_method, SUM(total) as total, COUNT(*) as count FROM billing
       WHERE payment_status = 'paid' AND payment_method IS NOT NULL GROUP BY payment_method`
    );
    res.json({ success: true, data: { revenue, byCategory, byMethod } });
  } catch (err) {
    console.error('Revenue report error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** GET /api/analytics/patients */
router.get('/patients', authenticate, authorize('admin'), (req, res) => {
  try {
    const newPatients = queryAll(
      `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count FROM patients
       WHERE created_at >= date('now', '-12 months') GROUP BY strftime('%Y-%m', created_at) ORDER BY month ASC`
    );
    const genderDistribution = queryAll('SELECT gender, COUNT(*) as count FROM patients WHERE gender IS NOT NULL GROUP BY gender');
    const ageDistribution = queryAll(
      `SELECT CASE WHEN age < 18 THEN '0-17' WHEN age BETWEEN 18 AND 30 THEN '18-30'
        WHEN age BETWEEN 31 AND 45 THEN '31-45' WHEN age BETWEEN 46 AND 60 THEN '46-60' ELSE '60+' END as age_group,
        COUNT(*) as count FROM patients WHERE age IS NOT NULL GROUP BY age_group ORDER BY age_group`
    );
    const bloodGroupDistribution = queryAll('SELECT blood_group, COUNT(*) as count FROM patients WHERE blood_group IS NOT NULL GROUP BY blood_group');
    res.json({ success: true, data: { newPatients, genderDistribution, ageDistribution, bloodGroupDistribution } });
  } catch (err) {
    console.error('Patient analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** GET /api/analytics/beds */
router.get('/beds', authenticate, authorize('admin'), (req, res) => {
  try {
    const occupancy = queryAll(
      `SELECT ward, COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance
       FROM beds GROUP BY ward ORDER BY ward`
    );
    const allBeds = queryAll(
      `SELECT b.*, u.name as patient_name FROM beds b
       LEFT JOIN patients p ON b.patient_id = p.patient_id LEFT JOIN users u ON p.user_id = u.id
       ORDER BY b.ward, b.bed_number`
    );
    res.json({ success: true, data: { occupancy, allBeds } });
  } catch (err) {
    console.error('Bed stats error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** GET /api/analytics/notifications */
router.get('/notifications', authenticate, (req, res) => {
  try {
    const notifications = queryAll('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.user.id]);
    const unreadCount = queryOne('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0', [req.user.id])?.count || 0;
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (err) {
    console.error('Notifications error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** PUT /api/analytics/notifications/:id/read */
router.put('/notifications/:id/read', authenticate, (req, res) => {
  try {
    runQuery('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
