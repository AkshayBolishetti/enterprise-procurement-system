import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import {
  Building2, Moon, Sun, Menu, X, ArrowRight,
  Users, Shield, Truck, FileText, CheckCircle, Clock
} from 'lucide-react';

export const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Roles', href: '#roles' },
    { name: 'How It Works', href: '#workflow' },
    { name: 'About', href: '#about' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30 transition-colors duration-300 relative overflow-hidden">

      {/* Subtle Atmospheric Glows (Dark Mode Only) */}
      <div className="hidden dark:block absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="hidden dark:block absolute top-[40%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/80 dark:bg-[#030712]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 py-3 shadow-sm'
          : 'bg-transparent py-5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">ProcureSys</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg dark:shadow-[0_0_15px_rgba(37,99,235,0.3)] dark:hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
            >
              Login
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#0b1121] border-b border-slate-200 dark:border-white/10 shadow-lg py-4 px-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-slate-700 dark:text-slate-200"
              >
                {link.name}
              </a>
            ))}
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
              className="w-full mt-2 py-3 bg-blue-600 text-white font-semibold rounded-lg text-center"
            >
              Login to Procurement System
            </button>
          </div>
        )}
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                Manage Your <br className="hidden md:block" />
                Procurement. <br className="hidden md:block" />
                <span className="text-blue-600 dark:text-blue-500">Efficiently.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-8 font-light max-w-xl">
                Company procurement made simple, transparent, and efficient.
                Streamline requests, approvals, supplier coordination, payments, and deliveries through one centralized platform.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl dark:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
                >
                  Login <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#workflow"
                  className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white font-medium rounded-xl border border-slate-200 dark:border-white/10 transition-all flex items-center justify-center"
                >
                  Explore How It Works
                </a>
              </div>
            </div>

            {/* Visual Dashboard Representation */}
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square max-w-lg mx-auto lg:ml-auto">
              {/* Background accent layer */}
              <div className="absolute inset-4 bg-gradient-to-tr from-blue-100 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl transform rotate-3 scale-105 transition-transform duration-500" />

              {/* Main Card */}
              <div className="absolute inset-0 bg-white dark:bg-[#0b1121] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 z-10">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Procurement Overview</h3>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full">
                    Live Status
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 flex-grow">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 flex flex-col justify-center">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Pending Requests</span>
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">12</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-500/10 flex flex-col justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-medium mb-1">Approved</span>
                    <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">28</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-500/10 flex flex-col justify-center">
                    <span className="text-amber-600 dark:text-amber-400 text-xs font-medium mb-1">In Progress</span>
                    <span className="text-3xl font-bold text-amber-700 dark:text-amber-300">08</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-500/10 flex flex-col justify-center">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-1">Delivered</span>
                    <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">34</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ROLES SECTION */}
        <section id="roles" className="py-20 bg-slate-50 dark:bg-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                Built for Every Role
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
                Everyone involved in procurement gets a focused experience.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white dark:bg-[#0b1121] border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm hover:shadow-lg dark:shadow-none hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Employee</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-grow font-light">
                  Raise procurement requests, select required products, provide quantities and reasons, and track request progress.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Raise Requests', 'Select Products', 'Track Status'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle className="w-4 h-4 text-blue-500" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 text-sm font-medium text-blue-600 dark:text-blue-400">
                  Request & Track →
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white dark:bg-[#0b1121] border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm hover:shadow-lg dark:shadow-none hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Admin</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-grow font-light">
                  Review requests, approve or reject procurement needs, manage orders, process supplier payments, and oversee the entire workflow.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Review Requests', 'Approve Requests', 'Manage Orders', 'Process Payments'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle className="w-4 h-4 text-indigo-500" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  Govern & Manage →
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white dark:bg-[#0b1121] border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-sm hover:shadow-lg dark:shadow-none hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Supplier</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-grow font-light">
                  Receive approved orders, manage products, update delivery status, and keep the organization informed.
                </p>
                <ul className="space-y-2 mb-6">
                  {['Manage Products', 'Receive Orders', 'Update Delivery', 'Track Payments'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500" /> {item}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t border-slate-100 dark:border-white/5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Fulfill & Deliver →
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW SECTION */}
        <section id="workflow" className="py-24 border-t border-slate-200 dark:border-white/5 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                How It Works
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
                From request to delivery, procurement stays simple and transparent.
              </p>
            </div>

            <div className="relative">
              {/* Desktop Connecting Line */}
              <div className="hidden lg:block absolute top-[45px] left-[10%] right-[10%] h-0.5 bg-slate-200 dark:bg-white/10 z-0" />

              {/* Mobile Connecting Line */}
              <div className="lg:hidden absolute top-[10%] bottom-[10%] left-[39px] w-0.5 bg-slate-200 dark:bg-white/10 z-0" />

              <div className="flex flex-col lg:flex-row justify-between gap-10 lg:gap-6 relative z-10">
                {[
                  { step: '01', title: 'Employee Requests', desc: 'The employee selects a product, enters the required quantity and reason, and submits a procurement request.' },
                  { step: '02', title: 'Admin Access', desc: 'The administrator reviews the request and approves or rejects it.' },
                  { step: '03', title: 'Supplier Receives', desc: 'Once approved and ordered, the supplier receives the procurement order.' },
                  { step: '04', title: 'Supplier Accepts', desc: 'The supplier accepts the order and updates its fulfillment status.' },
                  { step: '05', title: 'Supplier Delivers', desc: 'The supplier ships and delivers the requested product while the order status is updated.' }
                ].map((item, index) => (
                  <div key={index} className="flex flex-row lg:flex-col items-start lg:items-center gap-6 lg:gap-4 lg:w-1/5 group">
                    <div className="flex-shrink-0 w-20 h-20 rounded-full bg-white dark:bg-[#0b1121] border-2 border-slate-200 dark:border-white/10 flex items-center justify-center text-xl font-bold text-slate-400 dark:text-slate-500 group-hover:border-blue-500 group-hover:text-blue-500 transition-colors shadow-sm">
                      {item.step}
                    </div>
                    <div className="lg:text-center pt-2 lg:pt-0">
                      <h4 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS SECTION */}
        <section className="py-20 bg-blue-50/50 dark:bg-white/[0.02] border-y border-slate-200 dark:border-white/5">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-12 text-slate-900 dark:text-white">
              Procurement, Without the Complexity
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: <FileText className="w-6 h-6" />, title: 'Centralized Requests' },
                { icon: <Clock className="w-6 h-6" />, title: 'Faster Approvals' },
                { icon: <Users className="w-6 h-6" />, title: 'Supplier Coordination' },
                { icon: <Truck className="w-6 h-6" />, title: 'Transparent Delivery' },
              ].map((benefit, i) => (
                <div key={i} className="flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm md:text-base">{benefit.title}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-slate-900 dark:text-white">
              Ready to streamline your procurement?
            </h2>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 font-light">
              Bring employees, administrators, and suppliers together in one efficient procurement workflow.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl text-lg flex items-center justify-center gap-2 mx-auto"
            >
              Login to Procurement System <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-black py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-16">

            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">ProcureSys</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light pr-4">
                Modern procurement management for efficient organizations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm tracking-wider uppercase">Product</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 font-light">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Features</a></li>
                <li><a href="#roles" className="hover:text-blue-600 dark:hover:text-blue-400">Roles</a></li>
                <li><a href="#workflow" className="hover:text-blue-600 dark:hover:text-blue-400">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm tracking-wider uppercase">Business</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 font-light">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Procurement Management</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Supplier Management</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Request Management</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Order Management</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm tracking-wider uppercase">Company</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 font-light">
                <li><a href="#about" className="hover:text-blue-600 dark:hover:text-blue-400">About</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Contact</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4 text-sm tracking-wider uppercase">Account</h4>
              <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 font-light">
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-blue-600 dark:hover:text-blue-400">
                    Login
                  </button>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-500 font-light">
            <p>© {new Date().getFullYear()} Procurement System. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300">Privacy</a>
              <a href="#" className="hover:text-slate-900 dark:hover:text-slate-300">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
