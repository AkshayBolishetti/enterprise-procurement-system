import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { authService } from '../services/authService';

export const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    designation: '',
    departmentId: '',
  });

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [deptError, setDeptError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepts = async () => {
    setLoadingDepartments(true);
    setDeptError('');
    try {
      const response = await authService.getDepartments();
      if (response?.data) {
        setDepartments(response.data);
        if (response.data.length === 0) {
          setDeptError('No departments are currently available.');
        }
      } else {
        setDepartments([]);
        setDeptError('No departments are currently available.');
      }
    } catch (err) {
      setDepartments([]);
      setDeptError('Unable to load departments. Please try again.');
    } finally {
      setLoadingDepartments(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    } else if (formData.employeeId.trim().length > 50) {
      newErrors.employeeId = 'Employee ID must not exceed 50 characters';
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
        role: 'EMPLOYEE',
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
      });

      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create Employee Account"
      subtitle="Register to access procurement request management"
    >
      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-2 text-xs text-emerald-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Employee ID *</label>
            <input
              type="text"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              placeholder="EMP-1001"
              disabled={submitting}
              className={`form-input ${errors.employeeId ? 'border-red-400' : ''}`}
            />
            {errors.employeeId && <p className="mt-1 text-[11px] text-red-600">{errors.employeeId}</p>}
          </div>

          <div>
            <label className="form-label">Department [ Optional ]</label>
            <select
              value={formData.departmentId}
              onChange={(e) => {
                setFormData({ ...formData, departmentId: e.target.value });
                if (errors.departmentId) setErrors({ ...errors, departmentId: '' });
              }}
              disabled={submitting || loadingDepartments || departments.length === 0}
              className={`form-input ${errors.departmentId ? 'border-red-400' : ''}`}
            >
              {loadingDepartments ? (
                <option value="">Loading departments...</option>
              ) : departments.length === 0 ? (
                <option value="">No departments available</option>
              ) : (
                <>
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.departmentName}
                    </option>
                  ))}
                </>
              )}
            </select>
            {deptError && (
              <div className="mt-1 flex items-center justify-between gap-1 text-[11px] text-red-600">
                <span>{deptError}</span>
                <button
                  type="button"
                  onClick={fetchDepts}
                  className="font-bold text-blue-600 hover:underline flex items-center gap-0.5 shrink-0"
                >
                  <RefreshCw className="w-3 h-3" /> Retry
                </button>
              </div>
            )}
            {errors.departmentId && <p className="mt-1 text-[11px] text-red-600">{errors.departmentId}</p>}
          </div>
        </div>

        <div>
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
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
            placeholder="john.doe@company.com"
            disabled={submitting}
            className={`form-input ${errors.email ? 'border-red-400' : ''}`}
          />
          {errors.email && <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Phone</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+1 555 0192"
              disabled={submitting}
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Designation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="Software Engineer"
              disabled={submitting}
              className="form-input"
            />
          </div>
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
          disabled={submitting || loadingDepartments || departments.length === 0}
          className="btn-primary !mt-5"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center text-xs">
        <div className="text-slate-600 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
            Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};
