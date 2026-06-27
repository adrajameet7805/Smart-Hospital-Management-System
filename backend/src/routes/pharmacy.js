const express = require('express');
const { queryAll, queryOne, runQuery } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

/** GET /api/pharmacy/medicines */
router.get('/medicines', authenticate, (req, res) => {
  try {
    const { search, category, low_stock, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = [];
    let params = [];

    if (search) { conditions.push('(m.name LIKE ? OR m.generic_name LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
    if (category) { conditions.push('m.category = ?'); params.push(category); }
    if (low_stock === 'true') { conditions.push('m.stock <= m.min_stock'); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const medicines = queryAll(`SELECT * FROM medicines m ${where} ORDER BY m.name ASC LIMIT ? OFFSET ?`, [...params, Number(limit), Number(offset)]);
    const total = queryOne(`SELECT COUNT(*) as count FROM medicines m ${where}`, params)?.count || 0;
    const categories = queryAll('SELECT DISTINCT category FROM medicines ORDER BY category');

    res.json({ success: true, data: { medicines, categories: categories.map(c => c.category), pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } } });
  } catch (err) {
    console.error('List medicines error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** POST /api/pharmacy/medicines */
router.post('/medicines', authenticate, authorize('admin', 'pharmacist'), (req, res) => {
  try {
    const { name, generic_name, category, manufacturer, dosage_form, strength, stock, min_stock, price, expiry_date, description } = req.body;
    const result = runQuery(
      `INSERT INTO medicines (name, generic_name, category, manufacturer, dosage_form, strength, stock, min_stock, price, expiry_date, description) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [name, generic_name, category, manufacturer, dosage_form, strength, stock||0, min_stock||10, price, expiry_date, description]
    );
    const medicine = queryOne('SELECT * FROM medicines WHERE medicine_id = ?', [result.lastInsertRowid]);
    res.status(201).json({ success: true, data: medicine });
  } catch (err) {
    console.error('Add medicine error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** PUT /api/pharmacy/medicines/:id */
router.put('/medicines/:id', authenticate, authorize('admin', 'pharmacist'), (req, res) => {
  try {
    const { stock, price, min_stock, expiry_date } = req.body;
    runQuery(`UPDATE medicines SET stock=COALESCE(?,stock), price=COALESCE(?,price), min_stock=COALESCE(?,min_stock), expiry_date=COALESCE(?,expiry_date), updated_at=datetime('now') WHERE medicine_id=?`,
      [stock, price, min_stock, expiry_date, req.params.id]);
    const medicine = queryOne('SELECT * FROM medicines WHERE medicine_id = ?', [req.params.id]);
    res.json({ success: true, data: medicine });
  } catch (err) {
    console.error('Update medicine error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/** POST /api/pharmacy/fulfill */
router.post('/fulfill', authenticate, authorize('admin', 'pharmacist', 'doctor'), (req, res) => {
  try {
    const { prescription_id } = req.body;
    const prescription = queryOne('SELECT * FROM prescriptions WHERE prescription_id = ?', [prescription_id]);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found.' });

    const items = queryAll('SELECT * FROM prescription_items WHERE prescription_id = ?', [prescription_id]);
    for (const item of items) {
      runQuery(`UPDATE medicines SET stock = stock - 1, updated_at = datetime('now') WHERE name LIKE ? AND stock > 0`, [`%${item.medicine_name}%`]);
    }
    runQuery('UPDATE prescriptions SET status = "completed", updated_at = datetime("now") WHERE prescription_id = ?', [prescription_id]);
    res.json({ success: true, message: 'Prescription fulfilled.' });
  } catch (err) {
    console.error('Fulfill prescription error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
