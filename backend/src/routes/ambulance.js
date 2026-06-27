const express = require('express');
const { queryAll, queryOne, runQuery } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/** GET /api/ambulance */
router.get('/', authenticate, (req, res) => {
  try {
    const { status } = req.query;
    const ambulances = status
      ? queryAll('SELECT * FROM ambulances WHERE status = ? ORDER BY ambulance_id', [status])
      : queryAll('SELECT * FROM ambulances ORDER BY ambulance_id');
    res.json({ success: true, data: ambulances });
  } catch (err) {
    console.error('List ambulances error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** POST /api/ambulance/request */
router.post('/request', authenticate, (req, res) => {
  try {
    const { patient_name, patient_phone, pickup_lat, pickup_lng, pickup_address, emergency_type, priority = 'normal' } = req.body;
    const available = queryOne('SELECT * FROM ambulances WHERE status = "available" ORDER BY ambulance_id LIMIT 1');

    const result = runQuery(
      `INSERT INTO ambulance_requests (patient_name, patient_phone, pickup_lat, pickup_lng, pickup_address, emergency_type, ambulance_id, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [patient_name, patient_phone, pickup_lat, pickup_lng, pickup_address, emergency_type, available?.ambulance_id || null, available ? 'assigned' : 'pending', priority]
    );

    if (available) {
      runQuery('UPDATE ambulances SET status="dispatched", current_request_id=?, updated_at=datetime("now") WHERE ambulance_id=?',
        [result.lastInsertRowid, available.ambulance_id]);
    }

    const request = queryOne('SELECT * FROM ambulance_requests WHERE request_id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, message: available ? 'Ambulance dispatched.' : 'Request queued.', data: { request, ambulance: available } });
  } catch (err) {
    console.error('Ambulance request error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** PUT /api/ambulance/:id/location */
router.put('/:id/location', authenticate, (req, res) => {
  try {
    const { lat, lng, status } = req.body;
    runQuery(`UPDATE ambulances SET location_lat=COALESCE(?,location_lat), location_lng=COALESCE(?,location_lng), status=COALESCE(?,status), updated_at=datetime('now') WHERE ambulance_id=?`,
      [lat, lng, status, req.params.id]);
    if (status === 'available') runQuery('UPDATE ambulances SET current_request_id = NULL WHERE ambulance_id = ?', [req.params.id]);
    const ambulance = queryOne('SELECT * FROM ambulances WHERE ambulance_id = ?', [req.params.id]);
    res.json({ success: true, data: ambulance });
  } catch (err) {
    console.error('Update location error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** GET /api/ambulance/:id/track */
router.get('/:id/track', authenticate, (req, res) => {
  try {
    const ambulance = queryOne('SELECT * FROM ambulances WHERE ambulance_id = ?', [req.params.id]);
    if (!ambulance) return res.status(404).json({ success: false, message: 'Ambulance not found.' });
    let activeRequest = null;
    if (ambulance.current_request_id) activeRequest = queryOne('SELECT * FROM ambulance_requests WHERE request_id = ?', [ambulance.current_request_id]);
    res.json({ success: true, data: { ambulance, activeRequest } });
  } catch (err) {
    console.error('Track ambulance error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
