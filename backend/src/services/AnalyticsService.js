const AnalyticsRepository = require('../repositories/AnalyticsRepository');
const redis = require('../config/redis');

class AnalyticsService {
  async getDashboard() {
    // Try to get from cache first
    try {
      const cached = await redis.get('analytics:dashboard');
      if (cached) return JSON.parse(cached);
    } catch { }

    const [hospitalStats, revenueStats, departmentStats] = await Promise.all([
      AnalyticsRepository.getHospitalStats(),
      AnalyticsRepository.getRevenueStats(),
      AnalyticsRepository.getDepartmentStats()
    ]);

    const data = {
      overview: {
        totalPatients: Number(hospitalStats.totalPatients),
        totalDoctors: Number(hospitalStats.totalDoctors),
        totalAppointments: Number(hospitalStats.totalAppointments),
        activeAmbulances: Number(hospitalStats.activeAmbulances),
        totalRevenue: Number(revenueStats.totalRevenue)
      },
      monthlyRevenue: revenueStats.monthlyRevenue,
      departmentStats
    };

    // Cache the result for 5 minutes
    try {
      await redis.setex('analytics:dashboard', 300, JSON.stringify(data));
    } catch { }

    return data;
  }
}

module.exports = new AnalyticsService();
