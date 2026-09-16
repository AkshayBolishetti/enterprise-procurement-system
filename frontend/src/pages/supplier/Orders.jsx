import React, { useState, useEffect } from 'react';
import { procurementService } from '../../services/procurementService';
import { Table } from '../../components/common/Table';
import { Truck } from 'lucide-react';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await procurementService.getSupplierOrders();
      setOrders(res.data?.content || res.data || []);
    } catch (err) {
      console.error('Error fetching supplier orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await procurementService.updateSupplierOrderDeliveryStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update delivery status');
    }
  };

  const columns = [
    { header: 'PO Number', accessor: 'poNumber', cell: (row) => (
      <span className="font-mono text-sm font-semibold">{row.poNumber}</span>
    )},
    { header: 'Product', accessor: 'productName', cell: (row) => (
      <div className="flex flex-col">
        <span className="font-medium text-slate-900 dark:text-white">{row.productName}</span>
        <span className="text-xs text-slate-500">Qty: {row.quantity}</span>
      </div>
    )},
    { header: 'Amount', accessor: 'totalAmount', cell: (row) => (
      <span className="font-medium">
        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(row.totalAmount)}
      </span>
    )},
    { header: 'Payment', accessor: 'paymentStatus', cell: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${
        row.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
      }`}>
        {row.paymentStatus}
      </span>
    )},
    { header: 'Delivery Status', accessor: 'deliveryStatus', cell: (row) => {
      const getNextStatus = (current) => {
        if (!current || current === 'PENDING') return 'ACCEPTED';
        if (current === 'ACCEPTED') return 'PACKED';
        if (current === 'PACKED') return 'SHIPPED';
        if (current === 'SHIPPED') return 'NEAR_HUB';
        if (current === 'NEAR_HUB') return 'OUT_FOR_DELIVERY';
        if (current === 'OUT_FOR_DELIVERY') return 'DELIVERED';
        return null;
      };
      
      const nextStatus = getNextStatus(row.deliveryStatus);
      
      return (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            row.deliveryStatus === 'DELIVERED' ? 'bg-[var(--success)]/10 text-[var(--success)]' :
            row.deliveryStatus === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
            row.deliveryStatus === 'NEAR_HUB' ? 'bg-purple-100 text-purple-800' :
            row.deliveryStatus === 'ACCEPTED' ? 'bg-indigo-100 text-indigo-800' :
            'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
          }`}>
            {(row.deliveryStatus || 'PENDING').replace(/_/g, ' ')}
          </span>
          {nextStatus && (
            <button
              onClick={() => handleStatusChange(row.id, nextStatus)}
              className="text-xs px-2 py-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded transition shadow-sm"
            >
              Mark {nextStatus.replace(/_/g, ' ')}
            </button>
          )}
        </div>
      );
    }}
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
          Manage Delivery
        </h2>
      </div>
      
      <div className="card p-4">
        <Table 
          columns={columns}
          data={orders}
          isLoading={loading}
          emptyMessage="No orders found."
        />
      </div>
    </div>
  );
};

export default Orders;
