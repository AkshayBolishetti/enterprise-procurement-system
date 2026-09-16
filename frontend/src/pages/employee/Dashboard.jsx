import React, { useState, useEffect } from 'react';
import { procurementService } from '../../services/procurementService';
import { FileText, Clock, CheckCircle2, Package, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/common/StatCard';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';

export const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalMyRequests: 0,
    pendingMyRequests: 0,
    approvedMyRequests: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDash = async () => {
      try {
        setLoading(true);
        const [dashRes, reqRes, ordRes] = await Promise.all([
          procurementService.getUserDashboard(),
          procurementService.getMyRequests(),
          procurementService.getMyOrders()
        ]);
        
        if (dashRes.data) setMetrics(dashRes.data);
        
        const requestsData = reqRes?.data?.content || reqRes?.data || [];
        if (Array.isArray(requestsData)) {
          const sorted = [...requestsData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentRequests(sorted.slice(0, 5));
        }

        const ordersData = ordRes?.data || [];
        if (Array.isArray(ordersData)) {
          const sorted = [...ordersData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentOrders(sorted.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDash();
  }, []);

  const requestColumns = [
    { key: 'issueNumber', header: 'Request ID', sortable: false },
    { key: 'title', header: 'Title', sortable: false },
    {
      key: 'status',
      header: 'Status',
      sortable: false,
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'action',
      header: '',
      sortable: false,
      render: (row) => (
        <button onClick={() => navigate(`/employee/requests/${row.id}`)} className="p-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
          <ArrowRight className="h-4 w-4" />
        </button>
      )
    }
  ];

  const orderColumns = [
    { key: 'poNumber', header: 'PO Number', sortable: false },
    {
      key: 'deliveryStatus',
      header: 'Status',
      sortable: false,
      render: (row) => <StatusBadge status={row.deliveryStatus} />
    },
    {
      key: 'action',
      header: '',
      sortable: false,
      render: (row) => (
        <button onClick={() => navigate(`/employee/orders/${row.id}`)} className="p-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
          <ArrowRight className="h-4 w-4" />
        </button>
      )
    }
  ];

  if (loading) {
    return <div className="p-8 text-center text-[var(--muted)]">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          {/* Append employee name to Welcome back */}
          <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Welcome back, {JSON.parse(localStorage.getItem('user'))?.name || 'Employee'}</h2>
          <p className="text-[var(--secondary-foreground)] mt-1">Here is a summary of your procurement activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Requests" 
          value={metrics.totalMyRequests} 
          icon={FileText} 
        />
        <StatCard 
          title="Pending Approval" 
          value={metrics.pendingMyRequests} 
          icon={Clock} 
          color="warning" 
        />
        <StatCard 
          title="Approved" 
          value={metrics.approvedMyRequests} 
          icon={CheckCircle2} 
          color="success" 
        />
        <StatCard 
          title="My Orders" 
          value={metrics.myOrders || 0} 
          icon={Package} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">Recent Requests</h3>
          <div className="card h-[400px] overflow-hidden">
            <DataTable 
              columns={requestColumns} 
              data={recentRequests} 
              searchable={false}
              pagination={false}
              emptyMessage="You have no recent requests."
            />
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)] tracking-tight">Recent Orders</h3>
          <div className="card h-[400px] overflow-hidden">
            <DataTable 
              columns={orderColumns} 
              data={recentOrders} 
              searchable={false}
              pagination={false}
              emptyMessage="You have no recent orders."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
