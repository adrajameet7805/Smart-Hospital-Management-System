import { useState, useEffect } from 'react';
import { patientApi } from '../../lib/api';
import { Search, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PatientManagement() {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchPatients = () => {
    setLoading(true);
    patientApi.list({ search, page, limit: 10 })
      .then(res => { setPatients(res.data.data.patients); setPagination(res.data.data.pagination); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPatients(); }, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchPatients(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Patient Management</h1>
          <p className="text-surface-200 text-sm">Manage all registered patients</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-200" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..." className="input-field pl-10"
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>Blood</th><th>Age</th><th>Gender</th><th>Conditions</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={8}><div className="loading-shimmer h-8" /></td></tr>
                ))
              ) : patients.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-surface-200">No patients found</td></tr>
              ) : (
                patients.map(p => (
                  <tr key={p.patient_id}>
                    <td className="font-medium text-white">{p.name}</td>
                    <td>{p.email}</td>
                    <td>{p.phone || '—'}</td>
                    <td><span className="badge badge-danger">{p.blood_group || '—'}</span></td>
                    <td>{p.age || '—'}</td>
                    <td className="capitalize">{p.gender || '—'}</td>
                    <td>{p.chronic_conditions || '—'}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="p-1.5 rounded-lg hover:bg-white/5 text-primary-400"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-white/5 text-danger-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/5">
            <p className="text-xs text-surface-200">Page {pagination.page} of {pagination.totalPages} ({pagination.total} patients)</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">
                <ChevronLeft className="w-3 h-3" /> Prev
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p+1))} disabled={page === pagination.totalPages} className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">
                Next <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
