import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { authService } from '../services/authService';

export const AdminRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    designation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      await authService.register({
        ...formData,
        role: 'ADMIN',
        departmentId: null,
      });
      setSuccessMsg('Admin registration successful! Redirecting to admin login...');
      setTimeout(() => {
        navigate('/admin/login');
      }, 1500);
    } catch (err) {
      setApiError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Admin Registration"
      subtitle="Register as a System Administrator"
      isAdmin={true}
    >
      {apiError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-md flex items-start gap-2 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-md flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <div>
          <label className="form-label">Employee ID *</label>
          <input
            type="text"
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            placeholder="ADM-001"
            disabled={submitting}
            className={`form-input ${errors.employeeId ? 'border-red-400' : ''}`}
          />
          {errors.employeeId && <p className="mt-1 text-[11px] text-red-600">{errors.employeeId}</p>}
        </div>

        <div>
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="System Admin Name"
            disabled={submitting}
            className={`form-input ${errors.name ? 'border-red-400' : ''}`}
          />
          {errors.name && <p className="mt-1 text-[11px] text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="admin@company.com"
            disabled={submitting}
            className={`form-input ${errors.email ? 'border-red-400' : ''}`}
          />
          {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="form-label">Password *</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="At least 6 characters"
              disabled={submitting}
              className={`form-input pr-10 ${errors.password ? 'border-red-400' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-[11px] text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label className="form-label">Confirm Password *</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              disabled={submitting}
              className={`form-input pr-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-[11px] text-red-600">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex justify-center items-center py-2.5 px-4 rounded-md text-sm font-medium text-slate-950 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 active:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out shadow-xs font-semibold !mt-5"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Registering Admin...
            </>
          ) : (
            'Register Admin'
          )}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an admin account?{' '}
        <Link to="/admin/login" className="font-semibold text-amber-500 hover:underline">
          Admin Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};
