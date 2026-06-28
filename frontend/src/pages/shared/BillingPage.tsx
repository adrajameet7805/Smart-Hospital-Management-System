import { useState, useEffect } from 'react';
import { billingApi } from '../../lib/api';

export default function BillingPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    billingApi.list({ limit: 50 })
      .then(res => setBills(res.data.data.bills))
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-surface-200 text-sm">View invoices and payment history</p>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Invoice</th><th>Patient</th><th>Amount</th><th>Tax</th><th>Discount</th><th>Total</th><th>Method</th><th>Status</th></tr></thead>
          <tbody>
            {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={8}><div className="loading-shimmer h-8" /></td></tr>) :
            bills.length === 0 ? <tr><td colSpan={8} className="text-center py-8 text-surface-200">No bills found</td></tr> :
            bills.map(bill => (
              <tr key={bill.bill_id}>
                <td className="font-mono text-xs text-primary-400">{bill.invoice_number}</td>
                <td className="font-medium text-white">{bill.patient_name}</td>
                <td>₹{bill.subtotal?.toLocaleString()}</td>
                <td>₹{bill.tax?.toFixed(0)}</td>
                <td className="text-success-400">{bill.discount > 0 ? `-₹${bill.discount}` : '—'}</td>
                <td className="font-semibold text-white">₹{bill.total?.toLocaleString()}</td>
                <td className="capitalize">{bill.payment_method || '—'}</td>
                <td><span className={`badge ${bill.payment_status === 'paid' ? 'badge-success' : bill.payment_status === 'pending' ? 'badge-warning' : bill.payment_status === 'partial' ? 'badge-info' : 'badge-danger'}`}>{bill.payment_status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
