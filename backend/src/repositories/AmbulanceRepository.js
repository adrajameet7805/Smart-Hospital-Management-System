const { queryAll, queryOne, runQuery } = require('../config/db');

class AmbulanceRepository {
  async findAll(status) {
    if (status) {
      return await queryAll('SELECT * FROM ambulances WHERE status = $1 ORDER BY vehicle_number ASC', [status]);
    }
    return await queryAll('SELECT * FROM ambulances ORDER BY vehicle_number ASC');
  }

  async findById(id) {
    return await queryOne('SELECT * FROM ambulances WHERE ambulance_id = $1', [id]);
  }

  async create(data) {
    const { vehicle_number, type, driver_name, driver_phone, equipment_level } = data;
    const result = await runQuery(
      `INSERT INTO ambulances (vehicle_number, type, driver_name, driver_phone, equipment_level, status)
       VALUES ($1, $2, $3, $4, $5, 'available') RETURNING ambulance_id`,
      [vehicle_number, type, driver_name, driver_phone, equipment_level || 'basic']
    );
    return result.rows[0].ambulance_id;
  }

  async updateLocation(id, latitude, longitude) {
    await runQuery(`UPDATE ambulances SET current_location_lat=$1, current_location_lng=$2, last_maintenance_date=NOW() WHERE ambulance_id=$3`,
      [latitude, longitude, id]);
  }

  async updateStatus(id, status) {
    await runQuery(`UPDATE ambulances SET status=$1 WHERE ambulance_id=$2`, [status, id]);
  }
}

module.exports = new AmbulanceRepository();
