import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import api from '../api/axios';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/login', { email, password });
      const { access_token, user } = response.data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'STUDENT') {
        navigate('/student/dashboard');
        return;
      }

      navigate('/admin/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors as Record<string, string[]>).flat();
        setError(errors.join(' '));
      } else if (axios.isAxiosError(err)) {
        setError((err.response?.data as { error?: string } | undefined)?.error || 'Login failed. Please check your credentials.');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 overflow-hidden rounded-2xl shadow-2xl bg-white">
        <section className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm">
              <ShieldCheck className="h-4 w-4" /> Secure access
            </div>
            <h1 className="mt-8 text-4xl font-bold leading-tight">AMU Student Payment Management System</h1>
            <p className="mt-4 text-blue-100">Track fee schedules, submit payment slips, and monitor verification in one place.</p>
          </div>
          <p className="text-sm text-blue-100">Designed for students and finance administrators.</p>
        </section>

        <section className="p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="rounded-lg bg-blue-100 p-2">
              <GraduationCap className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-sm text-slate-600">Sign in to continue</p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
              <LogIn className="ml-2 h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 rounded-md bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-800 mb-2">Demo Accounts</p>
            <p>Student: <span className="font-medium">abebe.kebede@amu.edu.et / password</span></p>
            <p>Finance: <span className="font-medium">finance@amu.edu.et / password</span></p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
