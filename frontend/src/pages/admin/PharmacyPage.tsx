import { useState, useEffect } from 'react';
import { pharmacyApi } from '../../lib/api';
import { Pill, Search, AlertTriangle, Package } from 'lucide-react';

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pharmacyApi.medicines({ search, category, limit: 50 })
      .then(res => { setMedicines(res.data.data.medicines); setCategories(res.data.data.categories); })
      .catch(console.error).finally(() => setLoading(false));
  }, [category]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setLoading(true);
    pharmacyApi.medicines({ search, category, limit: 50 })
      .then(res => setMedicines(res.data.data.medicines)).catch(console.error).finally(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">Pharmacy</h1><p className="text-surface-200 text-sm">Medicine inventory management</p></div>

      <div className="flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicines..." className="input-field pl-10" />
        </form>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setLoading(true); }} className="input-field w-48">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(6)].map((_, i) => <div key={i} className="loading-shimmer h-40 rounded-xl" />) :
        medicines.map((med, i) => (
          <div key={med.medicine_id} className="glass-card p-4 animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">{med.name}</h3>
                <p className="text-xs text-surface-200">{med.generic_name} • {med.dosage_form} {med.strength}</p>
              </div>
              {med.stock <= med.min_stock && (
                <span className="badge badge-danger"><AlertTriangle className="w-3 h-3 mr-1" />Low</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="bg-surface-700/30 rounded-lg p-2 text-center">
                <p className="text-xs text-surface-200">Stock</p>
                <p className={`text-sm font-bold ${med.stock <= med.min_stock ? 'text-danger-400' : 'text-success-400'}`}>{med.stock}</p>
              </div>
              <div className="bg-surface-700/30 rounded-lg p-2 text-center">
                <p className="text-xs text-surface-200">Price</p>
                <p className="text-sm font-bold text-white">₹{med.price}</p>
              </div>
              <div className="bg-surface-700/30 rounded-lg p-2 text-center">
                <p className="text-xs text-surface-200">Expiry</p>
                <p className="text-sm font-bold text-white">{med.expiry_date?.slice(5) || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="badge badge-neutral text-xs">{med.category}</span>
              <span className="text-xs text-surface-200">{med.manufacturer}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
