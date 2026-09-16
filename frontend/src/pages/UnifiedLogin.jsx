import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Eye, EyeOff, ArrowRight, Zap, Shield, Truck } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Smart Procurement',
    desc: 'Automate purchase requests, approvals, and vendor selection with intelligent workflows.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Transparent Operations',
    desc: 'Real-time dashboards give complete visibility into spending, approvals, and compliance.',
  },
  {
    icon: <Truck className="w-5 h-5" />,
    title: 'Reliable Delivery',
    desc: 'End-to-end order tracking with supplier coordination and delivery management.',
  },
];

export function UnifiedLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'SUPPLIER') {
        navigate('/supplier/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const roles = ['ADMIN', 'EMPLOYEE', 'SUPPLIER'];

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-[#030712] transition-colors duration-300 relative overflow-hidden font-sans">
      
      {/* Subtle Atmospheric Glows (Light Mode) */}
      <div className="absolute dark:hidden top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute dark:hidden bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[150px] pointer-events-none" />

      {/* Subtle Atmospheric Glows (Dark Mode) */}
      <div className="hidden dark:block absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="hidden dark:block absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Left — Branding */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-center px-16 xl:px-24">
        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-3">
            Procurement<span className="text-blue-600 dark:text-blue-500">System</span>
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-lg mb-12 leading-relaxed font-light">
            Enterprise-grade procurement management. Streamline purchasing, manage suppliers, and control spending — all in one platform.
          </p>

          <div className="space-y-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="group flex items-start gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] hover:bg-white dark:hover:bg-white/[0.04] hover:shadow-sm dark:hover:shadow-none hover:border-blue-200 dark:hover:border-white/10 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/20 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-all">
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-200 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-500 leading-relaxed font-light">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="relative w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12">
        <div className="w-full max-w-md relative z-10">
          
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Procurement<span className="text-blue-600 dark:text-blue-500">System</span>
            </h1>
            <p className="text-slate-500 dark:text-gray-500 text-sm mt-2 font-light">Enterprise Procurement Platform</p>
          </div>

          <div className="bg-white/80 dark:bg-[#0b1121]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] dark:shadow-blue-900/10">
            
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
              <p className="text-slate-500 dark:text-gray-500 text-sm mt-1.5 font-light">Please sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Role Selector */}
              <div className="flex p-1 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-lg">
                {roles.map(role => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all duration-300 capitalize tracking-wide ${
                      selectedRole === role 
                        ? 'bg-white dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-slate-200/50 dark:border-blue-500/30 shadow-sm dark:shadow-[0_0_15px_rgba(37,99,235,0.15)]' 
                        : 'text-slate-500 dark:text-gray-500 hover:text-slate-700 dark:hover:text-gray-300 border border-transparent hover:bg-white/50 dark:hover:bg-white/5'
                    }`}
                  >
                    {role.toLowerCase()}
                  </button>
                ))}
              </div>

              {error && (
                <div className="px-4 py-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-sm text-red-600 dark:text-red-400 text-center">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-black/40 border border-slate-300 dark:border-gray-800 rounded-lg text-slate-900 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500/50 dark:focus:border-blue-500/50 transition-all"
                    />
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-600" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-black/40 border border-slate-300 dark:border-gray-800 rounded-lg text-slate-900 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-600 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500/50 dark:focus:border-blue-500/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-600 hover:text-slate-600 dark:hover:text-gray-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] dark:hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-2 border border-transparent dark:border-blue-500/50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500 dark:text-gray-500">
              Don't have an account?{' '}
              {selectedRole === 'ADMIN' && (
                <Link to="/admin/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors">
                  Register as Admin
                </Link>
              )}
              {selectedRole === 'EMPLOYEE' && (
                <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors">
                  Create Employee Account
                </Link>
              )}
              {selectedRole === 'SUPPLIER' && (
                <Link to="/supplier/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors">
                  Register as Supplier
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

