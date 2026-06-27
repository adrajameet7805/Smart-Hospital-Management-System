const DoctorRepository = require('../repositories/DoctorRepository');

class DoctorService {
  async list(specialization, department, search, page, limit) {
    const offset = (page - 1) * limit;
    const doctors = await DoctorRepository.findAll(specialization, department, search, limit, offset);
    const total = await DoctorRepository.countAll(specialization, department, search);
    return { doctors, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(total / limit) } };
  }

  async getById(id) {
    const doctor = await DoctorRepository.findById(id);
    if (!doctor) throw { status: 404, message: 'Doctor not found.' };
    return doctor;
  }

  async create(data) {
    const doctorId = await DoctorRepository.create(data);
    return await DoctorRepository.findById(doctorId);
  }

  async updateSchedule(id, data) {
    await DoctorRepository.updateSchedule(id, data);
    return await DoctorRepository.findById(id);
  }

  async getAppointments(id, date, status) {
    return await DoctorRepository.getAppointments(id, date, status);
  }

  async getAnalytics(id) {
    return await DoctorRepository.getAnalytics(id);
  }
}

module.exports = new DoctorService();
