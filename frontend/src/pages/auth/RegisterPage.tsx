import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import CitySkyline from '../../components/CitySkyline';

// Register screen in the same SocietyNow-style dress as Login:
// gradient, serif title, white fields, outlined button, skyline.
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.RESIDENT,
    phone: '',
    flatNumber: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.role === UserRole.RESIDENT && !formData.flatNumber) {
      setError('Flat number is required for residents');
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const inputCls = 'w-full px-3 py-2.5 bg-white rounded-md shadow outline-none text-gray-900 placeholder-gray-400';
  const labelCls = 'block text-sm font-medium text-white mb-1';

  return (
    <div className="society-gradient relative min-h-screen overflow-hidden flex flex-col">
      <div className="pt-10 pb-2 text-center relative z-10">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-white drop-shadow">
          Smart Society App
        </h1>
        <p className="mt-2 text-sm text-white/90">SocioTrack — Residential Society Management</p>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pt-6 relative z-10">
        <div className="w-full max-w-sm pb-8">
          <h2 className="text-center text-2xl font-medium text-gray-900 mb-6">REGISTER</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className={labelCls}>Full Name *</label>
              <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className={inputCls} placeholder="FULL NAME" />
            </div>
            <div>
              <label htmlFor="email" className={labelCls}>Email address *</label>
              <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className={inputCls} placeholder="EMAIL" />
            </div>
            <div>
              <label htmlFor="role" className={labelCls}>Role *</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className={inputCls}>
                <option value={UserRole.RESIDENT}>Resident</option>
                <option value={UserRole.TECHNICIAN}>Technician</option>
                <option value={UserRole.ADMIN}>Admin</option>
              </select>
            </div>
            {formData.role === UserRole.RESIDENT && (
              <div>
                <label htmlFor="flatNumber" className={labelCls}>Flat Number *</label>
                <input id="flatNumber" name="flatNumber" type="text" required value={formData.flatNumber} onChange={handleChange} className={inputCls} placeholder="A-101" />
              </div>
            )}
            <div>
              <label htmlFor="phone" className={labelCls}>Phone Number</label>
              <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className={inputCls} placeholder="PHONE" />
            </div>
            <div>
              <label htmlFor="password" className={labelCls}>Password *</label>
              <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} className={inputCls} placeholder="PASSWORD" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className={labelCls}>Confirm Password *</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className={inputCls} placeholder="CONFIRM PASSWORD" />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-md border-2 border-white text-white font-semibold tracking-wide hover:bg-white/20 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Creating account...' : 'GO!'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/90">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-white underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <CitySkyline />
    </div>
  );
};

export default RegisterPage;
