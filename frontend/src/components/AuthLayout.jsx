import React from 'react';
import { Building2, ShieldCheck } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle, isAdmin = false }) => {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#030712] transition-colors duration-300 overflow-hidden font-sans">
      
      {/* Subtle Atmospheric Glows (Light Mode) */}
      <div className="absolute dark:hidden top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute dark:hidden bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-[150px] pointer-events-none" />

      {/* Subtle Atmospheric Glows (Dark Mode) */}
      <div className="hidden dark:block absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="hidden dark:block absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full flex flex-col items-center max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg border ${
            isAdmin 
              ? 'bg-slate-900 border-amber-500/40 text-amber-400 shadow-amber-500/10' 
              : 'bg-blue-600 border-blue-400/40 text-white shadow-blue-600/20'
          }`}>
            {isAdmin ? <ShieldCheck className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white tracking-tight text-lg">Enterprise Procurement System</span>
            {isAdmin && (
              <span className="bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                Admin Portal
              </span>
            )}
          </div>
          
          <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400 max-w-sm">
              {subtitle}
            </p>
          )}
        </div>

        {/* Auth Card Container */}
        <div className="w-full bg-white/80 dark:bg-[#0b1121]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] dark:shadow-blue-900/10 p-6 sm:p-8">
          {children}
        </div>

        {/* Footer copyright */}
        <div className="mt-8 text-center text-xs text-slate-500 dark:text-gray-500">
          &copy; {new Date().getFullYear()} Enterprise Procurement Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
};
