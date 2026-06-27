const AppointmentRepository = require('../repositories/AppointmentRepository');
const DoctorRepository = require('../repositories/DoctorRepository');

class AppointmentService {
  async list(user, date, status, page, limit) {
    const offset = (page - 1) * limit;
    const appointments = await AppointmentRepository.findAll(user.role, user.id, date, status, limit, offset);
    const total = await AppointmentRepository.countAll(user.role, user.id, date, status);
    return { appointments, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(total / limit) } };
  }

  async create(data, user) {
    let patient_id = data.patient_id;
    if (user.role === 'patient') {
      const patient = await AppointmentRepository.findPatientProfile(user.id);
      if (!patient) throw { status: 404, message: 'Patient profile not found.' };
      patient_id = patient.patient_id;
    }

    const doctor = await DoctorRepository.findById(data.doctor_id);
    if (!doctor) throw { status: 404, message: 'Doctor not found.' };

    const conflict = await AppointmentRepository.checkConflict(data.doctor_id, data.date, data.time_slot);
    if (conflict) throw { status: 409, message: 'Time slot already booked.' };

    const queueCount = await AppointmentRepository.getQueueCount(data.doctor_id, data.date);
    const appointmentId = await AppointmentRepository.create({
      patient_id,
      doctor_id: data.doctor_id,
      date: data.date,
      time_slot: data.time_slot,
      type: data.type || 'general',
      queue_number: queueCount + 1,
      reason: data.reason
    });

    return await AppointmentRepository.findById(appointmentId);
  }

  async update(id, data) {
    const appointment = await AppointmentRepository.findById(id);
    if (!appointment) throw { status: 404, message: 'Appointment not found.' };
    return await AppointmentRepository.update(id, data);
  }

  async cancel(id) {
    const appointment = await AppointmentRepository.findById(id);
    if (!appointment) throw { status: 404, message: 'Appointment not found.' };
    await AppointmentRepository.cancel(id);
  }

  async getQueue(doctorId) {
    return await AppointmentRepository.getQueue(doctorId);
  }
}

module.exports = new AppointmentService();
