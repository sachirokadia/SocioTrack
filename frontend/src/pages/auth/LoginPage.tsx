import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apartmentPhoto from '../../assets/apartment.jpg';

// Login screen: a real apartment photograph on the left (the society
// itself, not an illustration) with the sign-in form on the right.
// The old gradient + SVG skyline layout is replaced by this split view.
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login(formData);

      if (from !== '/') {
        navigate(from, { replace: true });
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f3] flex flex-col md:flex-row">
      {/* Photo panel — real apartment building, full height on desktop */}
      <div className="relative h-64 md:h-auto md:w-[46%] shrink-0 overflow-hidden">
        <img
          src={apartmentPhoto}
          alt="Residential apartment building"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-white">
          <p className="text-sm font-semibold tracking-widest uppercase text-white/80">
            SocioTrack
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold leading-tight">
            Smart Society App
          </h1>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/85">
            Complaints, maintenance billing and society notices — managed in
            one place, for residents, the committee and technicians.
          </p>
        </div>
      </div>

      {/* Sign-in form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-1 text-sm text-gray-500">
            Sign in to your society account
          </p>

          {error && (
            <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 flex items-center bg-white border border-stone-300 rounded-md px-3 focus-within:border-[#2fb3a6] focus-within:ring-1 focus-within:ring-[#2fb3a6]">
                <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-3 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 flex items-center bg-white border border-stone-300 rounded-md px-3 focus-within:border-[#2fb3a6] focus-within:ring-1 focus-within:ring-[#2fb3a6]">
                <svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-3 outline-none text-gray-900 placeholder-gray-400"
                  placeholder="Your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-md bg-[#2fb3a6] text-white font-semibold tracking-wide hover:bg-[#28a295] disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 flex justify-between text-sm">
            <Link to="/login" className="text-gray-600 underline">Forgot Password</Link>
            <Link to="/register" className="font-medium text-[#2fb3a6] underline">Request Demo</Link>
          </div>

          <p className="mt-6 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-gray-900 underline">
              Register here
            </Link>
          </p>

          <div className="mt-8 rounded-md bg-stone-100 border border-stone-200 p-4">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Demo accounts</p>
            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
              Admin: admin@sociotrack.com / Admin@123<br />
              Resident: john@sociotrack.com / Resident@123<br />
              Technician: mike@sociotrack.com / Tech@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
