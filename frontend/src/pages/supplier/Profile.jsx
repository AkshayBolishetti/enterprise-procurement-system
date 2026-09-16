import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Building, Settings, CheckCircle } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  // Read-only view for now, as updating profile requires backend endpoints
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Supplier Profile</h1>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.supplierName || 'My Company'}</h2>
            <p className="text-slate-500 dark:text-slate-400">Supplier Account</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white">
                {user?.name}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email Address
              </label>
              <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white">
                {user?.email}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Building className="w-4 h-4" /> Supplier ID
            </label>
            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-mono">
              SUP-{user?.id?.toString().padStart(6, '0')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
