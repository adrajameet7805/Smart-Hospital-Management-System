const { queryOne, queryAll } = require('../config/db');

class AnalyticsRepository {
  async getHospitalStats() {
    const totalPatients = (await queryOne('SELECT COUNT(*) as count FROM patients'))?.count || 0;
    const totalDoctors = (await queryOne('SELECT COUNT(*) as count FROM doctors'))?.count || 0;
    const totalAppointments = (await queryOne('SELECT COUNT(*) as count FROM appointments'))?.count || 0;
    const activeAmbulances = (await queryOne("SELECT COUNT(*) as count FROM ambulances WHERE status = 'available'"))?.count || 0;

    return { totalPatients, totalDoctors, totalAppointments, activeAmbulances };
  }

  async getRevenueStats() {
    const totalRevenue = (await queryOne("SELECT SUM(total) as sum FROM billing WHERE payment_status = 'paid'"))?.sum || 0;
    const monthlyRevenue = await queryAll(
      `SELECT TO_CHAR(payment_date, 'YYYY-MM') as month, SUM(total) as revenue
       FROM billing WHERE payment_status = 'paid' AND payment_date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY TO_CHAR(payment_date, 'YYYY-MM') ORDER BY month ASC`
    );

    return { totalRevenue, monthlyRevenue };
  }

  async getDepartmentStats() {
    return await queryAll(
      `SELECT d.department, COUNT(a.appointment_id) as appointments
       FROM doctors d LEFT JOIN appointments a ON d.doctor_id = a.doctor_id
       GROUP BY d.department ORDER BY appointments DESC`
    );
  }
}

module.exports = new AnalyticsRepository();
