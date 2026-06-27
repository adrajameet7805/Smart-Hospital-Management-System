const { validationResult } = require('express-validator');
const PharmacyService = require('../services/PharmacyService');

class PharmacyController {
  async list(req, res) {
    const { search, page = 1, limit = 50 } = req.query;
    const data = await PharmacyService.list(search, Number(page), Number(limit));
    res.json({ success: true, data });
  }

  async getById(req, res) {
    try {
      const item = await PharmacyService.getById(req.params.id);
      res.json({ success: true, data: item });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const item = await PharmacyService.create(req.body);
    res.status(201).json({ success: true, data: item });
  }

  async update(req, res) {
    try {
      const updated = await PharmacyService.update(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async updateStock(req, res) {
    try {
      const { type, amount, reason } = req.body;
      if (!['add', 'remove'].includes(type) || !amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid stock update parameters.' });
      }

      const item = await PharmacyService.updateStock(req.params.id, type, amount, reason, req.user.id);
      res.json({ success: true, message: `Stock ${type === 'add' ? 'added' : 'removed'} successfully.`, data: item });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async getLowStock(req, res) {
    const items = await PharmacyService.getLowStock();
    res.json({ success: true, data: items });
  }

  async delete(req, res) {
    try {
      await PharmacyService.delete(req.params.id);
      res.json({ success: true, message: 'Item deleted successfully.' });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }
}

module.exports = new PharmacyController();
