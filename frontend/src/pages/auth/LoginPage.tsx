import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Login screen modelled on the middle phone of the SocietyNow promo:
// serif "Smart Society App" title over a cyan-to-magenta gradient,
// USERNAME / PASSWORD fields with icons, a GO! button, and a city
// skyline along the bottom. SocioTrack keeps its own name and accounts.
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
    <div className="society-gradient relative min-h-screen overflow-hidden flex flex-col">
      {/* Display title, as on the promo */}
      <div className="pt-10 pb-2 text-center relative z-10">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white drop-shadow">
          Smart Society App
        </h1>
        <p className="mt-2 text-sm text-white/90">SocioTrack — Residential Society Management</p>
      </div>

      {/* Login form */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8 relative z-10">
        <div className="w-full max-w-sm">
          <h2 className="text-center text-2xl font-medium text-gray-900 mb-6">LOGIN</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center bg-white rounded-md shadow px-3">
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
                placeholder="USERNAME"
              />
            </div>

            <div className="flex items-center bg-white rounded-md shadow px-3">
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
                placeholder="PASSWORD"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-md border-2 border-white text-white font-semibold tracking-wide hover:bg-white/20 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Signing in...' : 'GO!'}
            </button>
          </form>

          <div className="mt-4 flex justify-between text-sm">
            <Link to="/login" className="text-white/90 underline">Forgot Password</Link>
            <Link to="/register" className="text-white/90 underline">Request Demo</Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/90">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-white underline">
                Register here
              </Link>
            </p>
            <p className="mt-4 text-xs text-white/80 leading-relaxed">
              Demo — Admin: admin@sociotrack.com / Admin@123<br />
              Resident: john@sociotrack.com / Resident@123<br />
              Technician: mike@sociotrack.com / Tech@123
            </p>
          </div>
        </div>
      </div>

      {/* City skyline along the bottom, as on the promo phone */}
      <svg
        className="relative z-0 w-full h-48 sm:h-56 -mb-1"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <circle cx="680" cy="35" r="22" fill="#fde68a" opacity="0.9" />
        <ellipse cx="150" cy="30" rx="55" ry="14" fill="#ffffff" opacity="0.7" />
        <ellipse cx="420" cy="22" rx="45" ry="12" fill="#ffffff" opacity="0.6" />
        <rect x="20" y="70" width="70" height="130" fill="#3aa99e" />
        <rect x="95" y="100" width="55" height="100" fill="#f2a65a" />
        <rect x="155" y="55" width="80" height="145" fill="#e85d75" />
        <rect x="240" y="90" width="60" height="110" fill="#7ec850" />
        <rect x="305" y="60" width="90" height="140" fill="#4db6a6" />
        <rect x="400" y="105" width="55" height="95" fill="#f2a65a" />
        <rect x="460" y="70" width="75" height="130" fill="#e85d75" />
        <rect x="540" y="95" width="60" height="105" fill="#3aa99e" />
        <rect x="605" y="60" width="85" height="140" fill="#7ec850" />
        <rect x="695" y="100" width="60" height="100" fill="#4db6a6" />
        <rect x="0" y="185" width="800" height="15" fill="#2f9e8f" />
        {/* Windows */}
        {[35, 55, 75, 95, 115, 135, 155].map((y) => (
          <rect key={y} x="40" y={y} width="12" height="10" fill="#fef3c7" opacity="0.85" />
        ))}
        {[70, 90, 110, 130].map((y) => (
          <rect key={y} x="175" y={y} width="12" height="10" fill="#fef3c7" opacity="0.85" />
        ))}
        {/* People walking */}
        <circle cx="330" cy="172" r="6" fill="#1f2937" />
        <rect x="324" y="178" width="12" height="14" rx="4" fill="#1f2937" />
        <circle cx="470" cy="172" r="6" fill="#1f2937" />
        <rect x="464" y="178" width="12" height="14" rx="4" fill="#1f2937" />
      </svg>
    </div>
  );
};

export default LoginPage;
