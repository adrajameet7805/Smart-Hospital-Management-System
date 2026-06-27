const { queryOne, runQuery } = require('../config/db');

class AuthRepository {
  async findByEmail(email) {
    return await queryOne('SELECT * FROM users WHERE email = $1', [email]);
  }

  async findById(id) {
    return await queryOne('SELECT id, name, email, role, phone, avatar, is_active, last_login, created_at FROM users WHERE id = $1', [id]);
  }

  async createUser(name, email, hashedPassword, role, phone) {
    const result = await runQuery(
      'INSERT INTO users (name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, email, hashedPassword, role, phone || null]
    );
    return result.rows[0].id;
  }

  async createPatientProfile(userId, data) {
    await runQuery(
      'INSERT INTO patients (user_id, blood_group, age, gender, address) VALUES ($1, $2, $3, $4, $5)',
      [userId, data.blood_group || null, data.age || null, data.gender || null, data.address || null]
    );
  }

  async createDoctorProfile(userId, data) {
    await runQuery(
      'INSERT INTO doctors (user_id, specialization, department, experience, qualification, consultation_fee) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, data.specialization || 'General', data.department || null, data.experience || 0, data.qualification || null, data.consultation_fee || 0]
    );
  }

  async updateLastLogin(id) {
    await runQuery('UPDATE users SET last_login = NOW() WHERE id = $1', [id]);
  }

  async getPatientProfile(userId) {
    return await queryOne('SELECT * FROM patients WHERE user_id = $1', [userId]);
  }

  async getDoctorProfile(userId) {
    return await queryOne('SELECT * FROM doctors WHERE user_id = $1', [userId]);
  }
}

module.exports = new AuthRepository();
