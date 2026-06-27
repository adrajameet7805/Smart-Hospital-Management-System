const { queryAll, queryOne, runQuery } = require('../config/db');

class PharmacyRepository {
  async findAll(search, limit, offset) {
    if (search) {
      const s = `%${search}%`;
      return await queryAll(
        `SELECT * FROM inventory WHERE name ILIKE $1 OR category ILIKE $2 ORDER BY name ASC LIMIT $3 OFFSET $4`,
        [s, s, limit, offset]
      );
    }
    return await queryAll('SELECT * FROM inventory ORDER BY name ASC LIMIT $1 OFFSET $2', [limit, offset]);
  }

  async countAll(search) {
    if (search) {
      const s = `%${search}%`;
      return (await queryOne(`SELECT COUNT(*) as count FROM inventory WHERE name ILIKE $1 OR category ILIKE $2`, [s, s]))?.count || 0;
    }
    return (await queryOne('SELECT COUNT(*) as count FROM inventory'))?.count || 0;
  }

  async findById(id) {
    return await queryOne('SELECT * FROM inventory WHERE item_id = $1', [id]);
  }

  async create(data) {
    const { name, category, quantity, unit_price, supplier, expiry_date, batch_number, reorder_level } = data;
    const result = await runQuery(
      `INSERT INTO inventory (name, category, quantity, unit_price, supplier, expiry_date, batch_number, reorder_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING item_id`,
      [name, category || 'general', quantity || 0, unit_price || 0, supplier, expiry_date, batch_number, reorder_level || 10]
    );
    return result.rows[0].item_id;
  }

  async update(id, data) {
    const { name, category, quantity, unit_price, expiry_date, reorder_level } = data;
    await runQuery(`UPDATE inventory SET name=COALESCE($1,name), category=COALESCE($2,category),
      quantity=COALESCE($3,quantity), unit_price=COALESCE($4,unit_price),
      expiry_date=COALESCE($5,expiry_date), reorder_level=COALESCE($6,reorder_level), updated_at=NOW() WHERE item_id=$7`,
      [name, category, quantity, unit_price, expiry_date, reorder_level, id]);
  }

  async updateStock(id, type, amount, reason, userId) {
    const qty = parseInt(amount);
    await runQuery(`UPDATE inventory SET quantity = quantity ${type === 'add' ? '+' : '-'} $1, updated_at=NOW() WHERE item_id=$2`, [qty, id]);

    if (reason && userId) {
      await runQuery(`INSERT INTO stock_transactions (item_id, transaction_type, quantity, reason, user_id) VALUES ($1, $2, $3, $4, $5)`,
        [id, type === 'add' ? 'in' : 'out', qty, reason, userId]);
    }
  }

  async getLowStock() {
    return await queryAll('SELECT * FROM inventory WHERE quantity <= reorder_level ORDER BY quantity ASC');
  }

  async delete(id) {
    await runQuery('DELETE FROM inventory WHERE item_id = $1', [id]);
  }
}

module.exports = new PharmacyRepository();
