import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Truck, CreditCard, Users, Box, Tag, Download } from 'lucide-react';
import { procurementService } from '../../services/procurementService';
import { Loader2 } from 'lucide-react';
import api from '../../services/api';
import { SpendingChart } from '../../components/dashboard/SpendingChart';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="card">
    <div className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</h3>
      </div>
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

export const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await procurementService.getAdminDashboard();
        // Assuming ApiResponse format: { data: { ...metrics } }
        setMetrics(res.data || res);
      } catch (err) {
        console.error('Error fetching admin dashboard', err);
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
        <p>Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
        {error}
      </div>
    );
  }

  if (!metrics) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const statCards = [
    { 
      title: 'Total Requests', 
      value: metrics.totalRequests || 0, 
      icon: FileText, 
      colorClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' 
    },
    { 
      title: 'Pending Approval', 
      value: metrics.pendingRequests || 0, 
      icon: FileText, 
      colorClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
    },
    { 
      title: 'Rejected Requests', 
      value: metrics.rejectedRequests || 0, 
      icon: FileText, 
      colorClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
    },
    { 
      title: 'Total Suppliers', 
      value: metrics.totalSuppliers || 0, 
      icon: Users, 
      colorClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' 
    },
    { 
      title: 'Processing Orders', 
      value: metrics.activeOrders || 0, 
      icon: Truck, 
      colorClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
    },
    { 
      title: 'Delivered Orders', 
      value: metrics.deliveredOrders || 0, 
      icon: Truck, 
      colorClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
    },
    { 
      title: 'Total Spend', 
      value: formatCurrency(metrics.totalSpend), 
      icon: DollarSign, 
      colorClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
    },
    { 
      title: 'Pending Payments', 
      value: formatCurrency(metrics.pendingPaymentAmount), 
      icon: CreditCard, 
      colorClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
        <button
          onClick={async () => {
            try {
              const res = await api.get('/requests/download', { responseType: 'blob' });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'approved-requests.csv');
              document.body.appendChild(link);
              link.click();
              link.remove();
            } catch (err) {
              console.error('Failed to download CSV', err);
            }
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Download CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <SpendingChart />
    </div>
  );
};

export default Dashboard;
