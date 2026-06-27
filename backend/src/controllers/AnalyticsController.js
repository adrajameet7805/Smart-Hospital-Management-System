const AnalyticsService = require('../services/AnalyticsService');

class AnalyticsController {
  async getDashboard(req, res) {
    const data = await AnalyticsService.getDashboard();
    res.json({ success: true, data });
  }
}

module.exports = new AnalyticsController();
