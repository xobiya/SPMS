import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from '../api/axios';
import { CreditCard, FileText, Upload, CheckCircle, Clock, XCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [refNumber, setRefNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await api.get('/student/dashboard');
      setData(response.data);
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
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSubmitSlip = async (e: React.FormEvent, paymentId: number) => {
    e.preventDefault();
    if (!file || !refNumber) return;

    const formData = new FormData();
    formData.append('slip', file);
    formData.append('reference_number', refNumber);
    formData.append('payment_method', 'BANK_TRANSFER');

    try {
      setUploading(paymentId);
      await api.post(`/student/payments/${paymentId}/submit-slip`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Slip submitted successfully!');
      setUploading(null);
      setFile(null);
      setRefNumber('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Submission failed');
      setUploading(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED': return <CheckCircle className="text-green-500 w-5 h-5" />;
      case 'UNDER_REVIEW': return <Clock className="text-yellow-500 w-5 h-5" />;
      case 'REJECTED': return <XCircle className="text-red-500 w-5 h-5" />;
      default: return <Clock className="text-gray-400 w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-800">AMU SPMS Student Portal</h1>
        <button onClick={handleLogout} className="flex items-center text-gray-600 hover:text-red-600">
          <LogOut className="w-4 h-4 mr-1" /> Logout
        </button>
      </nav>

      <main className="max-w-6xl mx-auto py-8 px-4">
        {/* Profile Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{data?.student?.full_name}</h2>
            <p className="text-gray-600">{data?.student?.smis_id} | {data?.student?.department}</p>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${data?.student?.cafe_status === 'NON_CAFE' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
              {data?.student?.cafe_status}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className="text-3xl font-bold text-blue-600">
              {data?.payments?.filter((p:any) => p.status === 'PENDING').reduce((acc:number, p:any) => acc + parseFloat(p.amount_due), 0).toFixed(2)} ETB
            </p>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Payment History</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.payments?.map((payment: any) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.month} {payment.academic_year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.amount_due} ETB</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm flex items-center">
                    {getStatusIcon(payment.status)}
                    <span className="ml-2">{payment.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {(payment.status === 'PENDING' || payment.status === 'REJECTED') ? (
                      <div className="flex flex-col space-y-2">
                        {uploading === payment.id ? (
                           <span className="text-blue-500">Processing...</span>
                        ) : (
                          <form onSubmit={(e) => handleSubmitSlip(e, payment.id)} className="flex items-center space-x-2">
                            <input 
                              type="text" 
                              placeholder="Ref #" 
                              className="border rounded px-2 py-1 text-xs w-24"
                              value={refNumber}
                              onChange={(e) => setRefNumber(e.target.value)}
                              required
                            />
                            <input 
                              type="file" 
                              className="text-xs w-32"
                              onChange={(e) => setFile(e.target.files?.[0] || null)}
                              required
                            />
                            <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                              <Upload className="w-3 h-3" />
                            </button>
                          </form>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">---</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;