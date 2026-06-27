const DoctorService = require('../services/DoctorService');

class DoctorController {
  async list(req, res) {
    const { specialization, department, search, page = 1, limit = 20 } = req.query;
    const data = await DoctorService.list(specialization, department, search, Number(page), Number(limit));
    res.json({ success: true, data });
  }

  async getById(req, res) {
    try {
      const doctor = await DoctorService.getById(req.params.id);
      res.json({ success: true, data: doctor });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async create(req, res) {
    const doctor = await DoctorService.create(req.body);
    res.status(201).json({ success: true, data: doctor });
  }

  async updateSchedule(req, res) {
    const doctor = await DoctorService.updateSchedule(req.params.id, req.body);
    res.json({ success: true, data: doctor });
  }

  async getAppointments(req, res) {
    const appointments = await DoctorService.getAppointments(req.params.id, req.query.date, req.query.status);
    res.json({ success: true, data: appointments });
  }

  async getAnalytics(req, res) {
    const analytics = await DoctorService.getAnalytics(req.params.id);
    res.json({ success: true, data: analytics });
  }
}

module.exports = new DoctorController();
