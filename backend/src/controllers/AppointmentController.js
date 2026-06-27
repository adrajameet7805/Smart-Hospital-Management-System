const { validationResult } = require('express-validator');
const AppointmentService = require('../services/AppointmentService');

class AppointmentController {
  async list(req, res) {
    const { date, status, page = 1, limit = 20 } = req.query;
    const data = await AppointmentService.list(req.user, date, status, Number(page), Number(limit));
    res.json({ success: true, data });
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const appointment = await AppointmentService.create(req.body, req.user);
      res.status(201).json({ success: true, message: 'Appointment booked.', data: appointment });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async update(req, res) {
    try {
      const updated = await AppointmentService.update(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async cancel(req, res) {
    try {
      await AppointmentService.cancel(req.params.id);
      res.json({ success: true, message: 'Appointment cancelled.' });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async getQueue(req, res) {
    const data = await AppointmentService.getQueue(req.params.doctorId);
    res.json({ success: true, data });
  }
}

module.exports = new AppointmentController();
