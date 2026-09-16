import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, TrendingUp, ChevronRight, ShoppingBag } from 'lucide-react';
import { Table } from '../../components/common/Table';
import api from '../../services/api';
import { procurementService } from '../../services/procurementService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useNavigate } from 'react-router-dom';

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
  const [dashData, setDashData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productsRes, dashboardRes, ordersRes] = await Promise.all([
          api.get('/supplier/products'),
          procurementService.getSupplierDashboard(),
          procurementService.getSupplierOrders()
        ]);
        const prodData = productsRes?.data?.content || productsRes?.data || productsRes || [];
        setProducts(Array.isArray(prodData) ? prodData : []);
        
        setDashData(dashboardRes?.data || dashboardRes || {});

        const ordData = ordersRes?.data?.content || ordersRes?.data || ordersRes || [];
        if (Array.isArray(ordData)) {
          const sorted = [...ordData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setOrders(sorted.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch supplier dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const columns = [
    { header: 'SKU', accessor: 'sku', cell: (row) => (
      <span className="font-mono text-xs text-slate-500">{row.sku}</span>
    )},
    { header: 'Product Name', accessor: 'productName', cell: (row) => (
      <span className="font-medium text-slate-900 dark:text-white">{row.productName || row.name}</span>
    )},
    { header: 'Category', accessor: 'category', cell: (row) => row.category || row.categoryName },
    { header: 'Price', accessor: 'unitPrice', cell: (row) => (
      `₹${(row.unitPrice || row.price || 0).toFixed(2)}`
    )},
    { header: 'Stock', accessor: 'availableQuantity', cell: (row) => {
      const qty = row.availableQuantity || row.quantity || 0;
      let badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      if (qty === 0) badgeClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      else if (qty < 10) badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
          {qty} units
        </span>
      );
    }},
    { header: 'Status', accessor: 'status', cell: (row) => (
      <span className="inline-flex items-center rounded bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-300">
        {row.status || 'ACTIVE'}
      </span>
    )}
  ];

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await procurementService.updateSupplierOrderDeliveryStatus(orderId, newStatus);
      const ordersRes = await procurementService.getSupplierOrders();
      const ordData = ordersRes?.data?.content || ordersRes?.data || ordersRes || [];
      if (Array.isArray(ordData)) {
        const sorted = [...ordData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(sorted.slice(0, 4));
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update order status');
    }
  };

  const renderAction = (row) => {
    const status = row.deliveryStatus || row.status || 'PROCESSING';
    
    if (status === 'PROCESSING') {
      return <button onClick={() => handleStatusUpdate(row.id, 'ACCEPTED')} className="btn-primary py-1 px-3 text-xs">Accept</button>;
    }
    if (status === 'ACCEPTED') {
      return <button onClick={() => handleStatusUpdate(row.id, 'PACKED')} className="btn-primary py-1 px-3 text-xs bg-amber-600 hover:bg-amber-700">Mark Packed</button>;
    }
    if (status === 'PACKED') {
      return <button onClick={() => navigate(`/supplier/orders`)} className="btn-primary py-1 px-3 text-xs bg-blue-600 hover:bg-blue-700">Dispatch</button>;
    }
    if (status === 'SHIPPED') {
      return <button onClick={() => handleStatusUpdate(row.id, 'NEAR_HUB')} className="btn-primary py-1 px-3 text-xs bg-indigo-600 hover:bg-indigo-700">Near Hub</button>;
    }
    if (status === 'NEAR_HUB') {
      return <button onClick={() => handleStatusUpdate(row.id, 'OUT_FOR_DELIVERY')} className="btn-primary py-1 px-3 text-xs bg-purple-600 hover:bg-purple-700">Out for Delivery</button>;
    }
    if (status === 'OUT_FOR_DELIVERY') {
      return <button onClick={() => handleStatusUpdate(row.id, 'DELIVERED')} className="btn-primary py-1 px-3 text-xs bg-emerald-600 hover:bg-emerald-700">Delivered</button>;
    }
    if (status === 'DELIVERED') {
      return <div className="text-emerald-500 font-semibold text-xs flex items-center justify-end gap-1"><CheckCircle className="w-3 h-3"/> Done</div>;
    }
    return null;
  };

  const orderColumns = [
    { header: 'PO Number', accessor: 'poNumber', cell: (row) => <span className="font-mono text-sm">{row.poNumber}</span> },
    { header: 'Status', accessor: 'deliveryStatus', cell: (row) => <StatusBadge status={row.deliveryStatus} /> },
    { header: 'Action', accessor: 'id', cell: (row) => renderAction(row) }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Supplier Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Products" 
          value={dashData?.totalProducts ?? products.length} 
          icon={Package} 
          colorClass="bg-[var(--primary)]/10 text-[var(--primary)]" 
        />
        <StatCard 
          title="Active Products" 
          value={dashData?.activeProducts ?? 0} 
          icon={CheckCircle} 
          colorClass="bg-[var(--success)]/10 text-[var(--success)]" 
        />
        <StatCard 
          title="Low Stock" 
          value={dashData?.lowStock ?? 0} 
          icon={TrendingUp} 
          colorClass="bg-[var(--warning)]/10 text-[var(--warning)]" 
        />
        <StatCard 
          title="Out of Stock" 
          value={dashData?.outOfStock ?? 0} 
          icon={AlertTriangle} 
          colorClass="bg-[var(--error)]/10 text-[var(--error)]" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[var(--foreground)]">Inventory Alerts</h3>
          <div className="card h-[350px] overflow-hidden">
            <Table 
              columns={columns}
              data={products.filter(p => (p.availableQuantity || 0) < 10)}
              emptyMessage="No low stock alerts."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[var(--foreground)]">Recent Orders</h3>
            <button onClick={() => navigate('/supplier/orders')} className="text-sm font-semibold text-[var(--primary)] hover:underline flex items-center">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="card h-[350px] overflow-hidden">
            <Table 
              columns={orderColumns}
              data={orders}
              emptyMessage="No recent orders."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
