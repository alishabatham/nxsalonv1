import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../api';
import { History, Search, ShieldCheck } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, [search]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(`/audit-logs${search ? `?search=${search}` : ''}`);
      setLogs(data.auditLogs || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Audit Trail & Security Logs</h2>
          <p className="text-xs text-slate-500 font-medium">Immutable audit trail of system operations, logins, payment changes, and cancellations</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by action, user, or entity..."
            className="w-full p-2.5 pl-9 text-xs rounded-xl border border-slate-200 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No audit log entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map(l => (
                  <tr key={l._id} className="hover:bg-slate-50/60 font-sans">
                    <td className="p-3.5 text-slate-500 font-medium">{new Date(l.timestamp || l.createdAt).toLocaleString()}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{l.userName}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{l.userRole}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{l.entity} ({l.entityId ? l.entityId.substring(0, 8) : ''})</td>
                    <td className="p-3.5 text-slate-500 font-mono text-[10px] max-w-xs truncate">
                      {JSON.stringify(l.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
