const BillingService = require('../services/BillingService');

class BillingController {
  async list(req, res) {
    const { status, page = 1, limit = 20 } = req.query;
    const data = await BillingService.list(req.user, status, Number(page), Number(limit));
    res.json({ success: true, data });
  }

  async getById(req, res) {
    try {
      const bill = await BillingService.getById(req.params.id);
      res.json({ success: true, data: bill });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async create(req, res) {
    const bill = await BillingService.create(req.body);
    res.status(201).json({ success: true, data: bill });
  }

  async pay(req, res) {
    try {
      const updated = await BillingService.pay(req.params.id, req.body.payment_method, req.body.amount_paid);
      res.json({ success: true, message: `Payment updated.`, data: updated });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }
}

module.exports = new BillingController();
