const { queryAll, queryOne, runQuery } = require('../config/db');

class BillingRepository {
  async findAll(role, userId, status, limit, offset) {
    let conditions = [];
    let params = [];
    let paramIdx = 1;

    if (role === 'patient') {
      const patient = await queryOne('SELECT patient_id FROM patients WHERE user_id = $1', [userId]);
      if (patient) { conditions.push(`b.patient_id = $${paramIdx++}`); params.push(patient.patient_id); }
    }
    if (status) { conditions.push(`b.payment_status = $${paramIdx++}`); params.push(status); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return await queryAll(
      `SELECT b.*, u.name as patient_name FROM billing b
       JOIN patients p ON b.patient_id = p.patient_id JOIN users u ON p.user_id = u.id
       ${where} ORDER BY b.created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );
  }

  async countAll(role, userId, status) {
    let conditions = [];
    let params = [];
    let paramIdx = 1;

    if (role === 'patient') {
      const patient = await queryOne('SELECT patient_id FROM patients WHERE user_id = $1', [userId]);
      if (patient) { conditions.push(`b.patient_id = $${paramIdx++}`); params.push(patient.patient_id); }
    }
    if (status) { conditions.push(`b.payment_status = $${paramIdx++}`); params.push(status); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return (await queryOne(`SELECT COUNT(*) as count FROM billing b ${where}`, params))?.count || 0;
  }

  async findById(id) {
    const bill = await queryOne(
      `SELECT b.*, u.name as patient_name, u.email as patient_email, u.phone as patient_phone
       FROM billing b JOIN patients p ON b.patient_id = p.patient_id JOIN users u ON p.user_id = u.id WHERE b.bill_id = $1`,
      [id]
    );
    if (bill) {
      bill.items = await queryAll('SELECT * FROM billing_items WHERE bill_id = $1', [id]);
    }
    return bill;
  }

  async create(data) {
    const { patient_id, appointment_id, items, discount = 0, notes } = data;
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * (item.quantity || 1)), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax - discount;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const result = await runQuery(
      `INSERT INTO billing (patient_id, appointment_id, subtotal, tax, discount, total, payment_status, invoice_number, notes)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8) RETURNING bill_id`,
      [patient_id, appointment_id || null, subtotal, tax, discount, total, invoiceNumber, notes || null]
    );
    const billId = result.rows[0].bill_id;

    for (const item of items) {
      await runQuery(`INSERT INTO billing_items (bill_id, description, category, quantity, unit_price, amount) VALUES ($1, $2, $3, $4, $5, $6)`,
        [billId, item.description, item.category || 'other', item.quantity || 1, item.unit_price, item.unit_price * (item.quantity || 1)]);
    }
    return billId;
  }

  async pay(id, payment_method, amount_paid, total) {
    const status = amount_paid >= total ? 'paid' : 'partial';
    await runQuery(`UPDATE billing SET payment_status=$1, payment_method=$2, payment_date=NOW(), updated_at=NOW() WHERE bill_id=$3`,
      [status, payment_method, id]);
  }
}

module.exports = new BillingRepository();
