const express = require('express');
const { queryAll, queryOne, runQuery } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/** GET /api/billing */
router.get('/', authenticate, (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];

    if (req.user.role === 'patient') {
      const patient = queryOne('SELECT patient_id FROM patients WHERE user_id = ?', [req.user.id]);
      if (patient) { conditions.push('b.patient_id = ?'); params.push(patient.patient_id); }
    }
    if (status) { conditions.push('b.payment_status = ?'); params.push(status); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const bills = queryAll(
      `SELECT b.*, u.name as patient_name FROM billing b
       JOIN patients p ON b.patient_id = p.patient_id JOIN users u ON p.user_id = u.id
       ${where} ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    const total = queryOne(`SELECT COUNT(*) as count FROM billing b ${where}`, params)?.count || 0;

    res.json({ success: true, data: { bills, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } } });
  } catch (err) {
    console.error('List bills error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** POST /api/billing */
router.post('/', authenticate, authorize('admin', 'doctor'), (req, res) => {
  try {
    const { patient_id, appointment_id, items, discount = 0, notes } = req.body;
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * (item.quantity || 1)), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax - discount;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const result = runQuery(
      `INSERT INTO billing (patient_id, appointment_id, subtotal, tax, discount, total, payment_status, invoice_number, notes)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [patient_id, appointment_id || null, subtotal, tax, discount, total, invoiceNumber, notes || null]
    );

    for (const item of items) {
      runQuery(`INSERT INTO billing_items (bill_id, description, category, quantity, unit_price, amount) VALUES (?, ?, ?, ?, ?, ?)`,
        [result.lastInsertRowid, item.description, item.category || 'other', item.quantity || 1, item.unit_price, item.unit_price * (item.quantity || 1)]);
    }

    const bill = queryOne('SELECT * FROM billing WHERE bill_id = ?', [result.lastInsertRowid]);
    bill.items = queryAll('SELECT * FROM billing_items WHERE bill_id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, data: bill });
  } catch (err) {
    console.error('Generate bill error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** GET /api/billing/:id */
router.get('/:id', authenticate, (req, res) => {
  try {
    const bill = queryOne(
      `SELECT b.*, u.name as patient_name, u.email as patient_email, u.phone as patient_phone
       FROM billing b JOIN patients p ON b.patient_id = p.patient_id JOIN users u ON p.user_id = u.id WHERE b.bill_id = ?`,
      [req.params.id]
    );
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found.' });
    bill.items = queryAll('SELECT * FROM billing_items WHERE bill_id = ?', [req.params.id]);
    res.json({ success: true, data: bill });
  } catch (err) {
    console.error('Get bill error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** PUT /api/billing/:id/pay */
router.put('/:id/pay', authenticate, (req, res) => {
  try {
    const { payment_method, amount_paid } = req.body;
    const bill = queryOne('SELECT * FROM billing WHERE bill_id = ?', [req.params.id]);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found.' });

    const status = amount_paid >= bill.total ? 'paid' : 'partial';
    runQuery(`UPDATE billing SET payment_status=?, payment_method=?, payment_date=datetime('now'), updated_at=datetime('now') WHERE bill_id=?`,
      [status, payment_method, req.params.id]);

    const updated = queryOne('SELECT * FROM billing WHERE bill_id = ?', [req.params.id]);
    res.json({ success: true, message: `Payment ${status}.`, data: updated });
  } catch (err) {
    console.error('Process payment error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
