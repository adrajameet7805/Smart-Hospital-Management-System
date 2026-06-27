const AmbulanceRepository = require('../repositories/AmbulanceRepository');

class AmbulanceService {
  async list(status) {
    return await AmbulanceRepository.findAll(status);
  }

  async getById(id) {
    const ambulance = await AmbulanceRepository.findById(id);
    if (!ambulance) throw { status: 404, message: 'Ambulance not found.' };
    return ambulance;
  }

  async create(data) {
    const id = await AmbulanceRepository.create(data);
    return await AmbulanceRepository.findById(id);
  }

  async updateLocation(id, latitude, longitude) {
    const ambulance = await AmbulanceRepository.findById(id);
    if (!ambulance) throw { status: 404, message: 'Ambulance not found.' };

    await AmbulanceRepository.updateLocation(id, latitude, longitude);
    return await AmbulanceRepository.findById(id);
  }

  async updateStatus(id, status) {
    const ambulance = await AmbulanceRepository.findById(id);
    if (!ambulance) throw { status: 404, message: 'Ambulance not found.' };

    await AmbulanceRepository.updateStatus(id, status);
    return await AmbulanceRepository.findById(id);
  }
}

module.exports = new AmbulanceService();
