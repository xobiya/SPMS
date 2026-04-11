import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api/axios';
import { Check, X, Eye, RefreshCw, LogOut, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const fetchPayments = async () => {
    try {
      const response = await api.get('/admin/payments?status=UNDER_REVIEW');
      setPayments(response.data.data);
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleVerify = async (id: number, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.post(`/admin/payments/${id}/verify`, { status });
      alert(`Payment ${status.toLowerCase()} successfully`);
      fetchPayments();
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/admin/sync-students');
      alert('Students synced successfully');
      fetchPayments();
    } catch (err) {
      alert('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-900">AMU SPMS Admin Portal</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSync} 
            disabled={syncing}
            className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${syncing ? 'animate-spin' : ''}`} /> {syncing ? 'Syncing...' : 'Sync Students'}
          </button>
          <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-600">
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Users className="text-blue-600 w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm text-gray-500">Review Queue</p>
                    <p className="text-2xl font-bold">{payments.length}</p>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Verification Queue (Pending Review)</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No payments pending review</td>
                </tr>
              ) : (
                payments.map((p: any) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{p.student.full_name}</div>
                      <div className="text-sm text-gray-500">{p.student.smis_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.amount_due} ETB</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.reference_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a 
                        href={`http://localhost:8000/storage/${p.slip_file_path}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" /> View Slip
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleVerify(p.id, 'VERIFIED')}
                          className="bg-green-100 text-green-700 p-1 rounded hover:bg-green-200"
                          title="Verify"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleVerify(p.id, 'REJECTED')}
                          className="bg-red-100 text-red-700 p-1 rounded hover:bg-red-200"
                          title="Reject"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;