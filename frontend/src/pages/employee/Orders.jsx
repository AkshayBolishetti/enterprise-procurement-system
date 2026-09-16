import React, { useState, useEffect } from 'react';
import { Package, Truck, MapPin, CheckCircle2, ChevronRight, X, Star } from 'lucide-react';
import { procurementService } from '../../services/procurementService';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [productRating, setProductRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [review, setReview] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (productRating === 0 || serviceRating === 0) {
      alert("Please provide both product and service ratings");
      return;
    }
    setRatingSubmitting(true);
    try {
      await procurementService.submitSupplierRating(selectedOrder.supplierId, {
        orderId: selectedOrder.id,
        productRating,
        serviceRating,
        review
      });
      alert('Thank you for your feedback!');
      setRatingModalOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await procurementService.getMyOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'productName', 
      header: 'Order Details',
      render: (row) => (
        <div>
          <div className="font-semibold text-[var(--foreground)]">
            {row.productName}
          </div>
          <div className="text-xs text-[var(--muted)] mt-1">
            {row.poNumber} • Qty: {row.quantity}
          </div>
        </div>
      )
    },
    { 
      key: 'createdAt', 
      header: 'Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
    { 
      key: 'supplierName', 
      header: 'Supplier',
      render: (row) => row.supplierName || 'Unknown'
    },
    {
      key: 'deliveryStatus',
      header: 'Status',
      render: (row) => <StatusBadge status={row.deliveryStatus || 'PENDING'} />
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      align: 'right',
      render: (row) => (
        <button
          onClick={() => setSelectedOrder(row)}
          className="inline-flex items-center text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
        >
          Track <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[var(--card)] p-5 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-[var(--input)] shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">My Orders</h1>
          <p className="text-sm text-[var(--secondary-foreground)] mt-1">Track your requested items and delivery status</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)]">Loading orders...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={orders} 
            searchable={false}
            pagination={true}
            emptyMessage="No orders found."
          />
        )}
      </div>

      {/* Tracking Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--card)] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[var(--input)]">
            <div className="p-5 border-b border-[var(--input)] flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">Track Delivery</h3>
                <p className="text-sm text-[var(--secondary-foreground)] mt-1">
                  Order <span className="font-semibold text-[var(--foreground)]">{selectedOrder.poNumber}</span>
                </p>
                <p className="text-xs font-mono text-[var(--muted)] mt-2 flex items-center gap-2">
                  <span>Tracking ID: <span className="text-[var(--foreground)] font-semibold">{selectedOrder.trackingNumber || 'Not available yet'}</span></span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5">
              <div className="relative">
                {/* Visual Timeline Line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[var(--input)]"></div>
                
                {/* Order Placed */}
                <div className="relative flex items-start gap-4 mb-5">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-[var(--success)] text-[var(--primary-foreground)] flex items-center justify-center shadow-[0_0_0_4px_var(--card)]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="pt-1.5">
                    <h4 className="text-sm font-bold text-[var(--foreground)]">Order Placed</h4>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Accepted */}
                <div className="relative flex items-start gap-4 mb-5">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_0_4px_var(--card)] ${
                    ['ACCEPTED', 'SHIPPING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.deliveryStatus)
                      ? 'bg-[var(--success)] text-[var(--primary-foreground)]'
                      : 'bg-[var(--secondary)] text-[var(--muted)] border border-[var(--input)]'
                  }`}>
                    {['ACCEPTED', 'SHIPPING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.deliveryStatus) ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Package className="w-4 h-4" />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <h4 className={`text-sm font-bold ${
                      ['ACCEPTED', 'SHIPPING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.deliveryStatus)
                        ? 'text-[var(--foreground)]' 
                        : 'text-[var(--muted)]'
                    }`}>
                      Supplier Accepted
                    </h4>
                  </div>
                </div>

                {/* Shipped */}
                <div className="relative flex items-start gap-4 mb-5">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_0_4px_var(--card)] ${
                    ['SHIPPING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.deliveryStatus)
                      ? 'bg-[var(--success)] text-[var(--primary-foreground)]'
                      : 'bg-[var(--secondary)] text-[var(--muted)] border border-[var(--input)]'
                  }`}>
                    {['SHIPPING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.deliveryStatus) ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <h4 className={`text-sm font-bold ${
                      ['SHIPPING', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.deliveryStatus)
                        ? 'text-[var(--foreground)]' 
                        : 'text-[var(--muted)]'
                    }`}>
                      Shipped
                    </h4>
                  </div>
                </div>

                {/* Out for Delivery */}
                <div className="relative flex items-start gap-5 mb-8">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_0_4px_var(--card)] ${
                    ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.deliveryStatus)
                      ? 'bg-[var(--success)] text-[var(--primary-foreground)]'
                      : selectedOrder.deliveryStatus === 'SHIPPING'
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                        : 'bg-[var(--secondary)] text-[var(--muted)] border border-[var(--input)]'
                  }`}>
                    {['DELIVERED'].includes(selectedOrder.deliveryStatus) ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : selectedOrder.deliveryStatus === 'OUT_FOR_DELIVERY' ? (
                      <Truck className="w-4 h-4 animate-pulse" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <h4 className={`text-sm font-bold ${
                      ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedOrder.deliveryStatus)
                        ? 'text-[var(--foreground)]' 
                        : 'text-[var(--muted)]'
                    }`}>
                      Out for Delivery
                    </h4>
                    {selectedOrder.deliveryStatus === 'OUT_FOR_DELIVERY' && (
                      <p className="text-xs text-[var(--primary)] font-semibold mt-1">Arriving today</p>
                    )}
                  </div>
                </div>

                {/* Delivered */}
                <div className="relative flex items-start gap-4">
                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_0_4px_var(--card)] ${
                    selectedOrder.deliveryStatus === 'DELIVERED'
                      ? 'bg-[var(--success)] text-[var(--primary-foreground)]'
                      : 'bg-[var(--secondary)] text-[var(--muted)] border border-[var(--input)]'
                  }`}>
                    {selectedOrder.deliveryStatus === 'DELIVERED' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <h4 className={`text-sm font-bold ${
                      selectedOrder.deliveryStatus === 'DELIVERED'
                        ? 'text-[var(--success-foreground)]' 
                        : 'text-[var(--muted)]'
                    }`}>
                      Delivered
                    </h4>
                    {selectedOrder.deliveryStatus === 'DELIVERED' && selectedOrder.actualDeliveryDate && (
                      <p className="text-xs text-[var(--muted)] mt-1">
                        {new Date(selectedOrder.actualDeliveryDate).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[var(--background)] border-t border-[var(--input)] flex justify-end gap-3">
              {selectedOrder.deliveryStatus === 'DELIVERED' && !selectedOrder.isRated && (
                <button
                  onClick={() => {
                    setProductRating(0);
                    setServiceRating(0);
                    setReview('');
                    setRatingModalOpen(true);
                  }}
                  className="btn-primary"
                >
                  <Star className="w-4 h-4 mr-2" /> Rate Product
                </button>
              )}
              {selectedOrder.deliveryStatus === 'DELIVERED' && selectedOrder.isRated && (
                <button disabled className="btn-secondary opacity-50 cursor-not-allowed">
                  <Star className="w-4 h-4 mr-2" /> Rated
                </button>
              )}
              <button 
                onClick={() => setSelectedOrder(null)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--card)] rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-[var(--input)] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[var(--input)] flex justify-between items-center bg-[var(--secondary)]">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Rate Product & Service</h2>
              <button 
                onClick={() => setRatingModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleRatingSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Product Quality</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`prod-${star}`}
                        type="button"
                        onClick={() => setProductRating(star)}
                        className={`transition-colors ${star <= productRating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <Star className={`w-8 h-8 ${star <= productRating ? 'fill-yellow-400' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Supplier Service</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={`srv-${star}`}
                        type="button"
                        onClick={() => setServiceRating(star)}
                        className={`transition-colors ${star <= serviceRating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        <Star className={`w-8 h-8 ${star <= serviceRating ? 'fill-yellow-400' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Review (Optional)</label>
                  <textarea
                    rows="3"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="form-input w-full"
                    placeholder="Tell us about your experience..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--input)]">
                <button type="button" onClick={() => setRatingModalOpen(false)} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={ratingSubmitting} className="btn-primary">
                  {ratingSubmitting ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
