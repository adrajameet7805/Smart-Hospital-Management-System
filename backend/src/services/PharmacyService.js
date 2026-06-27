const PharmacyRepository = require('../repositories/PharmacyRepository');

class PharmacyService {
  async list(search, page, limit) {
    const offset = (page - 1) * limit;
    const items = await PharmacyRepository.findAll(search, limit, offset);
    const total = await PharmacyRepository.countAll(search);
    return { items, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(total / limit) } };
  }

  async getById(id) {
    const item = await PharmacyRepository.findById(id);
    if (!item) throw { status: 404, message: 'Item not found.' };
    return item;
  }

  async create(data) {
    const id = await PharmacyRepository.create(data);
    return await PharmacyRepository.findById(id);
  }

  async update(id, data) {
    const item = await PharmacyRepository.findById(id);
    if (!item) throw { status: 404, message: 'Item not found.' };
    await PharmacyRepository.update(id, data);
    return await PharmacyRepository.findById(id);
  }

  async updateStock(id, type, amount, reason, userId) {
    const item = await PharmacyRepository.findById(id);
    if (!item) throw { status: 404, message: 'Item not found.' };

    const qty = parseInt(amount);
    if (type === 'remove' && item.quantity < qty) {
      throw { status: 400, message: 'Insufficient stock.' };
    }

    await PharmacyRepository.updateStock(id, type, qty, reason, userId);
    return await PharmacyRepository.findById(id);
  }

  async getLowStock() {
    return await PharmacyRepository.getLowStock();
  }

  async delete(id) {
    await PharmacyRepository.delete(id);
  }
}

module.exports = new PharmacyService();
