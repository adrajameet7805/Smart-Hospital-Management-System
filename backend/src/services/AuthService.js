const bcrypt = require('bcryptjs');
const AuthRepository = require('../repositories/AuthRepository');
const { generateToken } = require('../middleware/auth');
const redis = require('../config/redis');

class AuthService {
  async register(data) {
    const existingUser = await AuthRepository.findByEmail(data.email);
    if (existingUser) {
      throw { status: 409, message: 'Email already registered.' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUserId = await AuthRepository.createUser(data.name, data.email, hashedPassword, data.role, data.phone);

    if (data.role === 'patient') {
      await AuthRepository.createPatientProfile(newUserId, data);
    } else if (data.role === 'doctor') {
      await AuthRepository.createDoctorProfile(newUserId, data);
    }

    const user = await AuthRepository.findById(newUserId);
    const token = generateToken(user);
    return { user, token };
  }

  async login(email, password) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw { status: 401, message: 'Invalid credentials.' };
    if (!user.is_active) throw { status: 403, message: 'Account is deactivated.' };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw { status: 401, message: 'Invalid credentials.' };

    await AuthRepository.updateLastLogin(user.id);
    const token = generateToken(user);

    let profile = null;
    if (user.role === 'patient') profile = await AuthRepository.getPatientProfile(user.id);
    else if (user.role === 'doctor') profile = await AuthRepository.getDoctorProfile(user.id);

    // Cache active status
    await redis.setex(`user:active:${user.id}`, 60, '1');

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, profile, token };
  }

  async getMe(userId) {
    const user = await AuthRepository.findById(userId);
    if (!user) throw { status: 404, message: 'User not found.' };

    let profile = null;
    if (user.role === 'patient') profile = await AuthRepository.getPatientProfile(userId);
    else if (user.role === 'doctor') profile = await AuthRepository.getDoctorProfile(userId);

    return { user, profile };
  }
}

module.exports = new AuthService();
