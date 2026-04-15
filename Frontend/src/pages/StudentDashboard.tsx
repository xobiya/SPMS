import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, LogOut, Upload, XCircle } from 'lucide-react';
import api from '../api/axios';

type Payment = {
  id: number;
  month: string;
  academic_year: string;
  amount_due: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
};

type DashboardData = {
  student: {
    full_name: string;
    smis_id: string;
    department: string;
    cafe_status: string;
  };
  payments: Payment[];
  bank_account: {
    bank_name: string;
    account_holder_name: string;
    account_number_masked: string;
  } | null;
};

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [formState, setFormState] = useState<Record<number, { reference_number: string; slip: File | null }>>({});
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/student/dashboard');
      setData(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pendingBalance = useMemo(
    () => data?.payments?.filter((p) => p.status === 'PENDING').reduce((acc, p) => acc + parseFloat(p.amount_due), 0) ?? 0,
    [data]
  );

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

  const handleSubmitSlip = async (e: React.FormEvent, paymentId: number) => {
    e.preventDefault();

    const currentForm = formState[paymentId];
    if (!currentForm?.reference_number || !currentForm?.slip) {
      return;
    }

    const payload = new FormData();
    payload.append('reference_number', currentForm.reference_number);
    payload.append('slip', currentForm.slip);
    payload.append('payment_method', 'BANK_TRANSFER');

    try {
      setUploadingId(paymentId);
      await api.post(`/student/payments/${paymentId}/submit-slip`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Slip submitted successfully.');
      setFormState((prev) => ({ ...prev, [paymentId]: { reference_number: '', slip: null } }));
      fetchData();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert((err.response?.data as { error?: string } | undefined)?.error || 'Submission failed.');
      } else {
        alert('Submission failed.');
      }
    } finally {
      setUploadingId(null);
    }
  };

  const iconForStatus = (status: Payment['status']) => {
    if (status === 'VERIFIED') return <CheckCircle className="text-green-600 w-4 h-4" />;
    if (status === 'REJECTED') return <XCircle className="text-red-600 w-4 h-4" />;
    if (status === 'UNDER_REVIEW') return <Clock className="text-amber-500 w-4 h-4" />;
    return <Clock className="text-slate-400 w-4 h-4" />;
  };

  if (loading) {
    return <div className="h-screen grid place-items-center text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <h1 className="font-semibold text-slate-900">AMU SPMS · Student Portal</h1>
          <button onClick={handleLogout} className="inline-flex items-center text-sm text-slate-600 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="md:col-span-2 rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">{data?.student.full_name}</h2>
            <p className="mt-1 text-sm text-slate-600">{data?.student.smis_id} · {data?.student.department}</p>
            <span className="mt-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              {data?.student.cafe_status}
            </span>
          </article>
          <article className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-500">Current Pending Balance</p>
            <p className="mt-2 text-3xl font-bold text-blue-700">{pendingBalance.toFixed(2)} ETB</p>
          </article>
        </section>

        {data?.bank_account && (
          <section className="rounded-xl bg-white p-5 shadow-sm border border-slate-200 text-sm">
            <h3 className="font-semibold text-slate-900 mb-2">Bank account for transfers</h3>
            <p>{data.bank_account.bank_name} · {data.bank_account.account_holder_name}</p>
            <p className="text-slate-600">{data.bank_account.account_number_masked}</p>
          </section>
        )}

        <section className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="font-semibold text-slate-900">Payment History</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 text-sm text-slate-800">{payment.month} {payment.academic_year}</td>
                    <td className="px-6 py-4 text-sm text-slate-800">{payment.amount_due} ETB</td>
                    <td className="px-6 py-4 text-sm text-slate-800">
                      <span className="inline-flex items-center gap-1.5">{iconForStatus(payment.status)} {payment.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {(payment.status === 'PENDING' || payment.status === 'REJECTED') ? (
                        <form onSubmit={(e) => handleSubmitSlip(e, payment.id)} className="flex flex-wrap gap-2 items-center">
                          <input
                            type="text"
                            required
                            placeholder="Reference #"
                            value={formState[payment.id]?.reference_number ?? ''}
                            onChange={(e) =>
                              setFormState((prev) => ({
                                ...prev,
                                [payment.id]: { ...(prev[payment.id] ?? { slip: null }), reference_number: e.target.value },
                              }))
                            }
                            className="rounded border border-slate-300 px-2.5 py-1.5 text-xs"
                          />
                          <input
                            type="file"
                            required
                            onChange={(e) =>
                              setFormState((prev) => ({
                                ...prev,
                                [payment.id]: {
                                  ...(prev[payment.id] ?? { reference_number: '' }),
                                  slip: e.target.files?.[0] ?? null,
                                },
                              }))
                            }
                            className="text-xs"
                          />
                          <button
                            type="submit"
                            disabled={uploadingId === payment.id}
                            className="inline-flex items-center rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            {uploadingId === payment.id ? 'Uploading...' : <><Upload className="w-3 h-3 mr-1" /> Submit</>}
                          </button>
                        </form>
                      ) : (
                        <span className="text-slate-400">No action required</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
