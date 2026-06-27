const BillingRepository = require('../repositories/BillingRepository');

class BillingService {
  async list(user, status, page, limit) {
    const offset = (page - 1) * limit;
    const bills = await BillingRepository.findAll(user.role, user.id, status, limit, offset);
    const total = await BillingRepository.countAll(user.role, user.id, status);
    return { bills, pagination: { page, limit, total: Number(total), totalPages: Math.ceil(total / limit) } };
  }

  async getById(id) {
    const bill = await BillingRepository.findById(id);
    if (!bill) throw { status: 404, message: 'Bill not found.' };
    return bill;
  }

  async create(data) {
    const billId = await BillingRepository.create(data);
    return await BillingRepository.findById(billId);
  }

  async pay(id, payment_method, amount_paid) {
    const bill = await BillingRepository.findById(id);
    if (!bill) throw { status: 404, message: 'Bill not found.' };

    await BillingRepository.pay(id, payment_method, amount_paid, bill.total);
    return await BillingRepository.findById(id);
  }
}

module.exports = new BillingService();
