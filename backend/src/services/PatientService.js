const PatientRepository = require('../repositories/PatientRepository');

class PatientService {
  async list(search, page, limit) {
    const offset = (page - 1) * limit;
    const patients = await PatientRepository.findAll(search, limit, offset);
    const total = await PatientRepository.countAll(search);
    return { patients, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(total / limit) } };
  }

  async getById(id, user) {
    const patient = await PatientRepository.findById(id);
    if (!patient) throw { status: 404, message: 'Patient not found.' };

    if (user.role === 'patient') {
      const myProfile = await PatientRepository.findProfileByUserId(user.id);
      if (!myProfile || myProfile.patient_id !== patient.patient_id) {
        throw { status: 403, message: 'Access denied.' };
      }
    }
    return patient;
  }

  async update(id, data, user) {
    const patient = await PatientRepository.findById(id);
    if (!patient) throw { status: 404, message: 'Patient not found.' };

    if (user.role === 'patient' && patient.user_id !== user.id) {
      throw { status: 403, message: 'Access denied.' };
    }

    await PatientRepository.update(id, data);
    return await PatientRepository.findById(id);
  }

  async deactivate(id) {
    const patient = await PatientRepository.findById(id);
    if (!patient) throw { status: 404, message: 'Patient not found.' };
    await PatientRepository.deactivateUser(patient.user_id);
  }

  async getHistory(id) {
    const patient = await PatientRepository.findById(id);
    if (!patient) throw { status: 404, message: 'Patient not found.' };

    const appointments = await PatientRepository.getAppointments(id);
    const prescriptions = await PatientRepository.getPrescriptions(id);
    const bills = await PatientRepository.getBills(id);

    return { patient, appointments, prescriptions, bills };
  }
}

module.exports = new PatientService();
