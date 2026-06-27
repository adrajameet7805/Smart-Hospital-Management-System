const AmbulanceService = require('../services/AmbulanceService');

class AmbulanceController {
  async list(req, res) {
    const data = await AmbulanceService.list(req.query.status);
    res.json({ success: true, data });
  }

  async getById(req, res) {
    try {
      const ambulance = await AmbulanceService.getById(req.params.id);
      res.json({ success: true, data: ambulance });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async create(req, res) {
    const ambulance = await AmbulanceService.create(req.body);
    res.status(201).json({ success: true, data: ambulance });
  }

  async updateLocation(req, res) {
    try {
      const updated = await AmbulanceService.updateLocation(req.params.id, req.body.latitude, req.body.longitude);
      res.json({ success: true, data: updated });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async updateStatus(req, res) {
    try {
      const updated = await AmbulanceService.updateStatus(req.params.id, req.body.status);
      res.json({ success: true, data: updated });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }
}

module.exports = new AmbulanceController();
