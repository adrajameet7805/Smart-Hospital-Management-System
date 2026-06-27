const PatientService = require('../services/PatientService');

class PatientController {
  async list(req, res) {
    const { search, page = 1, limit = 20 } = req.query;
    const data = await PatientService.list(search, Number(page), Number(limit));
    res.json({ success: true, data });
  }

  async getById(req, res) {
    try {
      const patient = await PatientService.getById(req.params.id, req.user);
      res.json({ success: true, data: patient });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async update(req, res) {
    try {
      const updated = await PatientService.update(req.params.id, req.body, req.user);
      res.json({ success: true, message: 'Patient updated.', data: updated });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async delete(req, res) {
    try {
      await PatientService.deactivate(req.params.id);
      res.json({ success: true, message: 'Patient deactivated.' });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }

  async history(req, res) {
    try {
      const data = await PatientService.getHistory(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ success: false, message: err.message });
      throw err;
    }
  }
}

module.exports = new PatientController();
