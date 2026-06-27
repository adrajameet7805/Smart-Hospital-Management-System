const { queryAll, queryOne, runQuery } = require('../config/db');

class DoctorRepository {
  async findAll(specialization, department, search, limit, offset) {
    let conditions = ['u.is_active = TRUE'];
    let params = [];
    let paramIdx = 1;

    if (specialization) { conditions.push(`d.specialization = $${paramIdx++}`); params.push(specialization); }
    if (department) { conditions.push(`d.department = $${paramIdx++}`); params.push(department); }
    if (search) { conditions.push(`(u.name ILIKE $${paramIdx} OR d.specialization ILIKE $${paramIdx + 1})`); params.push(`%${search}%`, `%${search}%`); paramIdx += 2; }

    const where = `WHERE ${conditions.join(' AND ')}`;

    return await queryAll(
      `SELECT d.*, u.name, u.email, u.phone, u.avatar FROM doctors d JOIN users u ON d.user_id = u.id ${where} ORDER BY d.rating DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );
  }

  async countAll(specialization, department, search) {
    let conditions = ['u.is_active = TRUE'];
    let params = [];
    let paramIdx = 1;

    if (specialization) { conditions.push(`d.specialization = $${paramIdx++}`); params.push(specialization); }
    if (department) { conditions.push(`d.department = $${paramIdx++}`); params.push(department); }
    if (search) { conditions.push(`(u.name ILIKE $${paramIdx} OR d.specialization ILIKE $${paramIdx + 1})`); params.push(`%${search}%`, `%${search}%`); paramIdx += 2; }

    const where = `WHERE ${conditions.join(' AND ')}`;
    return (await queryOne(`SELECT COUNT(*) as count FROM doctors d JOIN users u ON d.user_id = u.id ${where}`, params))?.count || 0;
  }

  async findById(id) {
    return await queryOne(
      `SELECT d.*, u.name, u.email, u.phone, u.avatar FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.doctor_id = $1`,
      [id]
    );
  }

  async create(data) {
    const { user_id, specialization, department, experience, qualification, license_number, consultation_fee, bio } = data;
    const result = await runQuery(
      `INSERT INTO doctors (user_id, specialization, department, experience, qualification, license_number, consultation_fee, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING doctor_id`,
      [user_id, specialization, department, experience || 0, qualification, license_number, consultation_fee || 0, bio]
    );
    return result.rows[0].doctor_id;
  }

  async updateSchedule(id, data) {
    const { working_hours_start, working_hours_end, working_days, max_patients_per_day, availability_status } = data;
    await runQuery(`UPDATE doctors SET working_hours_start=COALESCE($1,working_hours_start), working_hours_end=COALESCE($2,working_hours_end),
      working_days=COALESCE($3,working_days), max_patients_per_day=COALESCE($4,max_patients_per_day),
      availability_status=COALESCE($5,availability_status), updated_at=NOW() WHERE doctor_id=$6`,
      [working_hours_start, working_hours_end, working_days, max_patients_per_day, availability_status, id]);
  }

  async getAppointments(doctorId, date, status) {
    let conditions = ['a.doctor_id = $1'];
    let params = [doctorId];
    let paramIdx = 2;
    if (date) { conditions.push(`a.date = $${paramIdx++}`); params.push(date); }
    if (status) { conditions.push(`a.status = $${paramIdx++}`); params.push(status); }

    return await queryAll(
      `SELECT a.*, u.name as patient_name, p.age, p.gender, p.blood_group FROM appointments a
       JOIN patients p ON a.patient_id = p.patient_id JOIN users u ON p.user_id = u.id
       WHERE ${conditions.join(' AND ')} ORDER BY a.date ASC, a.time_slot ASC`, params);
  }

  async getAnalytics(id) {
    const totalAppointments = (await queryOne('SELECT COUNT(*) as count FROM appointments WHERE doctor_id = $1', [id]))?.count || 0;
    const completedAppointments = (await queryOne("SELECT COUNT(*) as count FROM appointments WHERE doctor_id = $1 AND status = 'completed'", [id]))?.count || 0;
    const todayAppointments = (await queryOne('SELECT COUNT(*) as count FROM appointments WHERE doctor_id = $1 AND date = CURRENT_DATE', [id]))?.count || 0;
    const totalPrescriptions = (await queryOne('SELECT COUNT(*) as count FROM prescriptions WHERE doctor_id = $1', [id]))?.count || 0;
    const doctor = await queryOne('SELECT rating, total_reviews FROM doctors WHERE doctor_id = $1', [id]);
    const monthlyTrend = await queryAll(
      `SELECT TO_CHAR(date, 'YYYY-MM') as month, COUNT(*) as count FROM appointments WHERE doctor_id = $1 AND date >= CURRENT_DATE - INTERVAL '6 months' GROUP BY TO_CHAR(date, 'YYYY-MM') ORDER BY month ASC`, [id]);

    return {
      totalAppointments: Number(totalAppointments), completedAppointments: Number(completedAppointments),
      todayAppointments: Number(todayAppointments), totalPrescriptions: Number(totalPrescriptions),
      rating: doctor?.rating || 0, totalReviews: doctor?.total_reviews || 0,
      completionRate: totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0,
      monthlyTrend
    };
  }
}

module.exports = new DoctorRepository();
