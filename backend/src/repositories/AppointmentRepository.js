const { queryAll, queryOne, runQuery } = require('../config/db');

class AppointmentRepository {
  async findAll(role, userId, date, status, limit, offset) {
    let conditions = [];
    let params = [];
    let paramIdx = 1;

    if (role === 'patient') {
      const patient = await queryOne('SELECT patient_id FROM patients WHERE user_id = $1', [userId]);
      if (patient) { conditions.push(`a.patient_id = $${paramIdx++}`); params.push(patient.patient_id); }
    } else if (role === 'doctor') {
      const doctor = await queryOne('SELECT doctor_id FROM doctors WHERE user_id = $1', [userId]);
      if (doctor) { conditions.push(`a.doctor_id = $${paramIdx++}`); params.push(doctor.doctor_id); }
    }

    if (date) { conditions.push(`a.date = $${paramIdx++}`); params.push(date); }
    if (status) { conditions.push(`a.status = $${paramIdx++}`); params.push(status); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return await queryAll(
      `SELECT a.*, pu.name as patient_name, p.age, p.gender,
        du.name as doctor_name, d.specialization, d.department
       FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id JOIN users pu ON p.user_id = pu.id
       JOIN doctors d ON a.doctor_id = d.doctor_id JOIN users du ON d.user_id = du.id
       ${where} ORDER BY a.date DESC, a.time_slot ASC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );
  }

  async countAll(role, userId, date, status) {
    let conditions = [];
    let params = [];
    let paramIdx = 1;

    if (role === 'patient') {
      const patient = await queryOne('SELECT patient_id FROM patients WHERE user_id = $1', [userId]);
      if (patient) { conditions.push(`a.patient_id = $${paramIdx++}`); params.push(patient.patient_id); }
    } else if (role === 'doctor') {
      const doctor = await queryOne('SELECT doctor_id FROM doctors WHERE user_id = $1', [userId]);
      if (doctor) { conditions.push(`a.doctor_id = $${paramIdx++}`); params.push(doctor.doctor_id); }
    }

    if (date) { conditions.push(`a.date = $${paramIdx++}`); params.push(date); }
    if (status) { conditions.push(`a.status = $${paramIdx++}`); params.push(status); }
    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return (await queryOne(`SELECT COUNT(*) as count FROM appointments a ${where}`, params))?.count || 0;
  }

  async findById(id) {
    return await queryOne('SELECT * FROM appointments WHERE appointment_id = $1', [id]);
  }

  async findPatientProfile(userId) {
    return await queryOne('SELECT patient_id FROM patients WHERE user_id = $1', [userId]);
  }

  async checkConflict(doctorId, date, timeSlot) {
    return await queryOne(
      "SELECT appointment_id FROM appointments WHERE doctor_id = $1 AND date = $2 AND time_slot = $3 AND status NOT IN ('cancelled', 'no_show')",
      [doctorId, date, timeSlot]
    );
  }

  async getQueueCount(doctorId, date) {
    return (await queryOne(
      "SELECT COUNT(*) as count FROM appointments WHERE doctor_id = $1 AND date = $2 AND status NOT IN ('cancelled', 'no_show')",
      [doctorId, date]
    ))?.count || 0;
  }

  async create(data) {
    const { patient_id, doctor_id, date, time_slot, type, queue_number, reason } = data;
    const result = await runQuery(
      `INSERT INTO appointments (patient_id, doctor_id, date, time_slot, status, type, queue_number, reason)
       VALUES ($1, $2, $3, $4, 'scheduled', $5, $6, $7) RETURNING appointment_id`,
      [patient_id, doctor_id, date, time_slot, type, queue_number, reason]
    );
    return result.rows[0].appointment_id;
  }

  async update(id, data) {
    const { status, notes, time_slot, date } = data;
    await runQuery(`UPDATE appointments SET status=COALESCE($1,status), notes=COALESCE($2,notes),
      time_slot=COALESCE($3,time_slot), date=COALESCE($4,date), updated_at=NOW() WHERE appointment_id=$5`,
      [status, notes, time_slot, date, id]);
    return await queryOne(
      `SELECT a.*, pu.name as patient_name, du.name as doctor_name FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id JOIN users pu ON p.user_id = pu.id
       JOIN doctors d ON a.doctor_id = d.doctor_id JOIN users du ON d.user_id = du.id
       WHERE a.appointment_id = $1`, [id]);
  }

  async cancel(id) {
    await runQuery("UPDATE appointments SET status = 'cancelled', updated_at = NOW() WHERE appointment_id = $1", [id]);
  }

  async getQueue(doctorId) {
    return await queryAll(
      `SELECT a.*, pu.name as patient_name, p.age, p.gender FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id JOIN users pu ON p.user_id = pu.id
       WHERE a.doctor_id = $1 AND a.date = CURRENT_DATE AND a.status IN ('scheduled', 'confirmed', 'in_progress')
       ORDER BY a.queue_number ASC`, [doctorId]);
  }
}

module.exports = new AppointmentRepository();
