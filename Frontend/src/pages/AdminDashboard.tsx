import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, Eye, LogOut, RefreshCw, X } from 'lucide-react';
import api from '../api/axios';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_BASE_URL as string | undefined)?.trim() || 'http://localhost:8000';

type ReviewPayment = {
  id: number;
  amount_due: string;
  reference_number: string;
  slip_file_path: string;
  student: {
    full_name: string;
    smis_id: string;
  };
};

const AdminDashboard: React.FC = () => {
  const [payments, setPayments] = useState<ReviewPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const totalAmount = useMemo(
    () => payments.reduce((sum, p) => sum + parseFloat(p.amount_due), 0),
    [payments]
  );

  const fetchPayments = useCallback(async () => {
    try {
      const response = await api.get('/admin/payments', { params: { status: 'UNDER_REVIEW' } });
      setPayments(response.data.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleVerify = async (id: number, status: 'VERIFIED' | 'REJECTED') => {
    try {
      setUpdatingId(id);
      await api.post(`/admin/payments/${id}/verify`, { status });
      fetchPayments();
    } catch {
      alert('Action failed.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await api.post('/admin/sync-students');
      fetchPayments();
    } catch {
      alert('Sync failed.');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch {
      // Best effort logout
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="h-screen grid place-items-center text-slate-500">Loading verification queue...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
          <h1 className="font-semibold text-slate-900">AMU SPMS · Admin Portal</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Students'}
            </button>
            <button onClick={handleLogout} className="inline-flex items-center text-sm text-slate-600 hover:text-red-600">
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-4 md:p-8 space-y-6">
        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Queue size</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{payments.length}</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total under review</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">{totalAmount.toFixed(2)} ETB</p>
          </article>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="font-semibold text-slate-900">Verification Queue</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Reference</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Evidence</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No payments currently pending review.</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-medium text-slate-900">{p.student.full_name}</p>
                        <p className="text-slate-500">{p.student.smis_id}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-800">{p.amount_due} ETB</td>
                      <td className="px-6 py-4 text-sm text-slate-800">{p.reference_number}</td>
                      <td className="px-6 py-4 text-sm">
                        <a
                          href={`${BACKEND_URL}/storage/${p.slip_file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-blue-700 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4 mr-1" /> View Slip
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleVerify(p.id, 'VERIFIED')}
                            disabled={updatingId === p.id}
                            className="rounded bg-green-100 p-1.5 text-green-700 hover:bg-green-200 disabled:opacity-50"
                            title="Verify"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleVerify(p.id, 'REJECTED')}
                            disabled={updatingId === p.id}
                            className="rounded bg-red-100 p-1.5 text-red-700 hover:bg-red-200 disabled:opacity-50"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
