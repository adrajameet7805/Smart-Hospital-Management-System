const { queryAll, queryOne, runQuery } = require('../config/db');

class PatientRepository {
  async findAll(search, limit, offset) {
    if (search) {
      const s = `%${search}%`;
      return await queryAll(
        `SELECT p.*, u.name, u.email, u.phone, u.is_active FROM patients p JOIN users u ON p.user_id = u.id
         WHERE u.name ILIKE $1 OR u.email ILIKE $2 ORDER BY p.created_at DESC LIMIT $3 OFFSET $4`,
        [s, s, limit, offset]
      );
    }
    return await queryAll(
      `SELECT p.*, u.name, u.email, u.phone, u.is_active FROM patients p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
  }

  async countAll(search) {
    if (search) {
      const s = `%${search}%`;
      return (await queryOne(`SELECT COUNT(*) as count FROM patients p JOIN users u ON p.user_id = u.id WHERE u.name ILIKE $1 OR u.email ILIKE $2`, [s, s]))?.count || 0;
    }
    return (await queryOne('SELECT COUNT(*) as count FROM patients'))?.count || 0;
  }

  async findById(id) {
    return await queryOne(
      `SELECT p.*, u.name, u.email, u.phone, u.avatar, u.is_active FROM patients p JOIN users u ON p.user_id = u.id WHERE p.patient_id = $1`,
      [id]
    );
  }

  async findProfileByUserId(userId) {
    return await queryOne('SELECT patient_id FROM patients WHERE user_id = $1', [userId]);
  }

  async update(id, data) {
    await runQuery(`UPDATE patients SET blood_group=COALESCE($1,blood_group), age=COALESCE($2,age), gender=COALESCE($3,gender),
      address=COALESCE($4,address), emergency_contact_name=COALESCE($5,emergency_contact_name),
      emergency_contact_phone=COALESCE($6,emergency_contact_phone), allergies=COALESCE($7,allergies),
      chronic_conditions=COALESCE($8,chronic_conditions), updated_at=NOW() WHERE patient_id=$9`,
      [data.blood_group, data.age, data.gender, data.address, data.emergency_contact_name, data.emergency_contact_phone, data.allergies, data.chronic_conditions, id]);
  }

  async deactivateUser(userId) {
    await runQuery('UPDATE users SET is_active = FALSE WHERE id = $1', [userId]);
  }

  async getAppointments(patientId) {
    return await queryAll(
      `SELECT a.*, u.name as doctor_name, d.specialization FROM appointments a
       JOIN doctors d ON a.doctor_id = d.doctor_id JOIN users u ON d.user_id = u.id
       WHERE a.patient_id = $1 ORDER BY a.date DESC`, [patientId]
    );
  }

  async getPrescriptions(patientId) {
    const prescriptions = await queryAll(
      `SELECT p.*, u.name as doctor_name, d.specialization FROM prescriptions p
       JOIN doctors d ON p.doctor_id = d.doctor_id JOIN users u ON d.user_id = u.id
       WHERE p.patient_id = $1 ORDER BY p.created_at DESC`, [patientId]
    );
    for (const p of prescriptions) {
      p.items = await queryAll('SELECT * FROM prescription_items WHERE prescription_id = $1', [p.prescription_id]);
    }
    return prescriptions;
  }

  async getBills(patientId) {
    return await queryAll('SELECT * FROM billing WHERE patient_id = $1 ORDER BY created_at DESC', [patientId]);
  }
}

module.exports = new PatientRepository();
