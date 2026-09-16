import React, { useState, useEffect } from 'react';
import { procurementService } from '../../services/procurementService';
import { Plus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FilterDropdown } from '../../components/common/FilterDropdown';

export const Requests = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', requestedQuantity: 1, priority: 'MEDIUM' });
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Feedback states
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRequest, setFeedbackRequest] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ productRating: 5, serviceRating: 5, review: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await procurementService.getMyRequests();
      const resData = res?.data?.content || res?.data || [];
      if (Array.isArray(resData)) {
        setRequests(resData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await procurementService.createRequest(formData);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', category: '', requestedQuantity: 1, priority: 'MEDIUM' });
      fetchRequests();
    } catch (err) {
      console.error('Failed to create request', err);
      alert('Failed to raise request. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackRequest?.purchaseOrder?.supplierId) return alert('Supplier details missing');
    
    setSubmittingFeedback(true);
    try {
      await procurementService.submitSupplierRating(feedbackRequest.purchaseOrder.supplierId, {
        orderId: feedbackRequest.purchaseOrder.id,
        productRating: feedbackData.productRating,
        serviceRating: feedbackData.serviceRating,
        review: feedbackData.review
      });
      alert('Feedback submitted successfully. Thank you!');
      setFeedbackModalOpen(false);
      fetchRequests(); // Refresh to potentially show it's rated, but we might just close it for now.
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const columns = [
    { key: 'issueNumber', header: 'Request ID' },
    { key: 'title', header: 'Title' },
    { key: 'category', header: 'Category' },
    { 
      key: 'createdAt', 
      header: 'Date Created',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.purchaseOrder?.deliveryStatus === 'DELIVERED' ? 'DELIVERED' : row.status} />
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => {
        if (row.purchaseOrder?.deliveryStatus === 'DELIVERED') {
          return (
            <button
              onClick={() => {
                setFeedbackRequest(row);
                setFeedbackData({ productRating: 5, serviceRating: 5, review: '' });
                setFeedbackModalOpen(true);
              }}
              className="text-sm font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 justify-end"
            >
              <Star className="w-4 h-4" /> Rate Supplier
            </button>
          );
        }
        return null;
      }
    }
  ];

  const filterOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

  const filteredData = requests.filter(req => {
    if (statusFilter === 'ALL') return true;
    const s = (req.status || 'PENDING').toUpperCase();
    if (statusFilter === 'PENDING') return ['PENDING', 'OPEN'].includes(s);
    if (statusFilter === 'APPROVED') return ['APPROVED', 'PAYMENT_PENDING'].includes(s);
    if (statusFilter === 'REJECTED') return ['REJECTED', 'CANCELLED'].includes(s);
    if (statusFilter === 'COMPLETED') return ['COMPLETED', 'DELIVERED', 'PAID', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(s);
    return true;
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--card)] p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-[var(--input)] shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">My Requests</h1>
          <p className="text-sm text-[var(--secondary-foreground)] mt-1">Track and monitor your submitted requests</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)]">Loading requests...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredData} 
            searchable={true}
            searchPlaceholder="Search requests by title or ID..."
            searchableColumns={['title', 'issueNumber', 'description']}
            emptyMessage="No requests found."
            toolbarChildren={
              <FilterDropdown 
                options={filterOptions} 
                value={statusFilter} 
                onChange={setStatusFilter} 
                label="Status"
              />
            }
          />
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] rounded-3xl shadow-xl max-w-md w-full p-8 border border-[var(--input)]">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">Raise Purchase Request</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label">Title (Product/Need)</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                  placeholder="e.g. Dell Latitude 5450"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <input 
                    type="text" 
                    required
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="form-input"
                    placeholder="Electronics"
                  />
                </div>
                <div>
                  <label className="form-label">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={formData.requestedQuantity}
                    onChange={e => setFormData({...formData, requestedQuantity: parseInt(e.target.value) || 1})}
                    className="form-input"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="form-input"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="form-label">Justification / Description</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="form-input py-3 resize-none"
                  placeholder="Reason for this request..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModalOpen && feedbackRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] rounded-3xl shadow-xl max-w-md w-full border border-[var(--input)] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-[var(--input)] bg-[var(--secondary)] flex justify-between items-center">
              <h3 className="text-lg font-bold text-[var(--foreground)]">Rate Supplier</h3>
              <button onClick={() => setFeedbackModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-5">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)] mb-1">Supplier: {feedbackRequest.purchaseOrder?.supplierName}</p>
                <p className="text-xs text-[var(--muted)]">Order Ref: {feedbackRequest.purchaseOrder?.poNumber}</p>
              </div>

              <div>
                <label className="text-sm font-bold text-[var(--foreground)] block mb-2">Product Quality Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={`prod-${star}`}
                      type="button"
                      onClick={() => setFeedbackData({...feedbackData, productRating: star})}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star className={`w-8 h-8 ${star <= feedbackData.productRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-[var(--foreground)] block mb-2">Supplier Service Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={`serv-${star}`}
                      type="button"
                      onClick={() => setFeedbackData({...feedbackData, serviceRating: star})}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star className={`w-8 h-8 ${star <= feedbackData.serviceRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label block mb-2">Review (Optional)</label>
                <textarea
                  value={feedbackData.review}
                  onChange={e => setFeedbackData({...feedbackData, review: e.target.value})}
                  className="form-input py-3 resize-none w-full"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-full py-3.5 text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl disabled:opacity-50 transition shadow-lg shadow-[var(--primary)]/20"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
