import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, X } from 'lucide-react';
import api from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FilterDropdown } from '../../components/common/FilterDropdown';

export const UnifiedSupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Dispatch modal state
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [carrierName, setCarrierName] = useState('Ekart Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/supplier/orders?status=ALL`);
      const allOrders = response.data?.content || response.data || [];
      const sorted = Array.isArray(allOrders) ? allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
      setOrders(sorted);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDispatch = async () => {
    if (!selectedOrder) return;
    try {
      await api.put(`/supplier/orders/${selectedOrder.id}/dispatch`, {
        carrierName,
        trackingNumber
      });
      setShowDispatchModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Dispatch failed');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/supplier/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Failed to update status');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const renderAction = (row) => {
    const status = row.deliveryStatus || row.status || 'PROCESSING';
    
    if (status === 'PROCESSING') {
      return <button onClick={() => handleStatusUpdate(row.id, 'ACCEPTED')} className="btn-primary py-1 px-3 text-xs">Accept Order</button>;
    }
    if (status === 'ACCEPTED') {
      return <button onClick={() => handleStatusUpdate(row.id, 'PACKED')} className="btn-primary py-1 px-3 text-xs bg-amber-600 hover:bg-amber-700">Mark as Packed</button>;
    }
    if (status === 'PACKED') {
      return <button onClick={() => { setSelectedOrder(row); setShowDispatchModal(true); }} className="btn-primary py-1 px-3 text-xs bg-blue-600 hover:bg-blue-700">Mark as Shipped</button>;
    }
    if (status === 'SHIPPED') {
      return <button onClick={() => handleStatusUpdate(row.id, 'NEAR_HUB')} className="btn-primary py-1 px-3 text-xs bg-indigo-600 hover:bg-indigo-700">Mark Near Your Hub</button>;
    }
    if (status === 'NEAR_HUB') {
      return <button onClick={() => handleStatusUpdate(row.id, 'OUT_FOR_DELIVERY')} className="btn-primary py-1 px-3 text-xs bg-purple-600 hover:bg-purple-700">Mark Out for Delivery</button>;
    }
    if (status === 'OUT_FOR_DELIVERY') {
      return <button onClick={() => handleStatusUpdate(row.id, 'DELIVERED')} className="btn-primary py-1 px-3 text-xs bg-emerald-600 hover:bg-emerald-700">Mark Delivered</button>;
    }
    if (status === 'DELIVERED') {
      return <div className="text-emerald-500 font-semibold text-xs flex items-center justify-end gap-1"><CheckCircle className="w-3 h-3"/> Completed</div>;
    }
    return null;
  };

  const columns = [
    { 
      key: 'poNumber', 
      header: 'PO Number',
      render: (row) => (
        <button onClick={() => setSelectedOrder(row)} className="font-mono text-sm font-semibold text-[var(--primary)] hover:underline">
          {row.poNumber || row.orderNumber}
        </button>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
    { 
      key: 'productName', 
      header: 'Product Details',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--foreground)]">{row.productName || (row.items && row.items[0]?.productName) || 'Unknown'}</span>
          <span className="text-xs text-[var(--muted)]">Qty: {row.quantity || (row.items && row.items[0]?.quantity) || 1}</span>
        </div>
      )
    },
    { 
      key: 'totalAmount', 
      header: 'Total Value',
      render: (row) => <span className="font-bold text-[var(--foreground)]">{formatCurrency(row.totalAmount)}</span>
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (row) => <StatusBadge status={row.deliveryStatus || row.status} />
    },
    { 
      key: 'actions', 
      header: 'Action',
      sortable: false,
      align: 'right',
      render: (row) => renderAction(row)
    }
  ];

  const filterOptions = [
    { label: 'All Orders', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'To Dispatch', value: 'PAID' },
    { label: 'Shipped', value: 'SHIPPING' },
    { label: 'Delivered', value: 'DELIVERED' },
  ];

  const filteredData = orders.filter(o => {
    if (statusFilter === 'ALL') return true;
    const ds = (o.deliveryStatus || o.status || 'PENDING').toUpperCase();
    const ps = (o.paymentStatus || 'PENDING').toUpperCase();
    if (statusFilter === 'PENDING') return ['PENDING', 'ACCEPTED', 'NEW'].includes(ds) && ps !== 'PAID';
    if (statusFilter === 'PAID') return (ps === 'PAID' || ['PACKED', 'PAYMENT_SUCCESS'].includes(ds)) && !['SHIPPING', 'SHIPPED', 'DELIVERED'].includes(ds);
    if (statusFilter === 'SHIPPING') return ['SHIPPING', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(ds);
    if (statusFilter === 'DELIVERED') return ['DELIVERED', 'COMPLETED'].includes(ds);
    return true;
  });

  const getOrderStatus = () => {
    if (selectedOrder?.deliveryStatus === 'NEW' || selectedOrder?.deliveryStatus === 'PENDING') {
      return selectedOrder?.paymentStatus === 'PAID' ? 'PAID' : 'PENDING';
    }
    return selectedOrder?.deliveryStatus || selectedOrder?.status || 'PENDING';
  };
  
  const canDispatch = ['PAID', 'PACKED', 'PAYMENT_SUCCESS', 'ACCEPTED', 'PROCESSING'].includes(getOrderStatus().toUpperCase());

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Supplier Orders</h1>
          <p className="text-sm text-[var(--secondary-foreground)] mt-1">Manage and fulfill incoming purchase orders</p>
        </div>
      </div>

      <div className="flex justify-end shrink-0">
        <FilterDropdown 
          options={filterOptions} 
          value={statusFilter} 
          onChange={setStatusFilter} 
        />
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)]">Loading orders...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredData} 
            searchPlaceholder="Search by PO Number or Product..."
            searchableColumns={['poNumber', 'orderNumber', 'productName']}
            emptyMessage="No orders found."
            pagination={true}
          />
        )}
      </div>

      {/* Inspector Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[var(--card)] border border-[var(--input)] shadow-2xl rounded-3xl h-[80vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 border-b border-[var(--input)] bg-[var(--secondary)] flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-3">
                  {selectedOrder.poNumber || selectedOrder.orderNumber}
                  <StatusBadge status={getOrderStatus()} />
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Ordered on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-[var(--background)] rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-[var(--background)] border-b border-[var(--input)] flex gap-2 justify-end shrink-0">
              {canDispatch && (
                <button onClick={() => setShowDispatchModal(true)} className="btn-primary flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4" /> Dispatch Order
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[var(--card)]">
              <div className="border border-[var(--input)] rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-[var(--input)] bg-[var(--background)]">
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">Items to Fulfill</h3>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--card)] text-[var(--muted)]">
                    <tr>
                      <th className="px-5 py-3 font-medium">Product</th>
                      <th className="px-5 py-3 font-medium text-right">Qty</th>
                      <th className="px-5 py-3 font-medium text-right">Price</th>
                      <th className="px-5 py-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--input)] bg-[var(--card)]">
                    <tr>
                      <td className="px-5 py-4 font-medium text-[var(--foreground)]">
                        {selectedOrder.productName || (selectedOrder.items && selectedOrder.items[0]?.productName)}
                      </td>
                      <td className="px-5 py-4 text-right text-[var(--foreground)]">
                        {selectedOrder.quantity || (selectedOrder.items && selectedOrder.items[0]?.quantity)}
                      </td>
                      <td className="px-5 py-4 text-right text-[var(--foreground)]">
                        {formatCurrency(selectedOrder.totalAmount / (selectedOrder.quantity || 1))}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-[var(--foreground)]">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </td>
                    </tr>
                    <tr className="bg-[var(--background)] font-semibold">
                      <td colSpan="3" className="px-5 py-4 text-right text-[var(--foreground)]">Total Value</td>
                      <td className="px-5 py-4 text-right text-[var(--primary)] text-lg">{formatCurrency(selectedOrder.totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-[var(--card)] border border-[var(--input)] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center border-b border-[var(--input)]">
              <div className="w-16 h-16 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Dispatch Order</h2>
              <p className="text-sm text-[var(--muted)] mt-1">Provide tracking details.</p>
            </div>
            
            <div className="p-8 space-y-5">
              <div>
                <label className="form-label">Carrier Name</label>
                <input
                  type="text"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Tracking Number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="EKART-123456789"
                  className="form-input"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatch}
                  className="btn-primary flex-1"
                >
                  Confirm Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedSupplierOrders;
