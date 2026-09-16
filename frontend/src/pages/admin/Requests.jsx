import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, Clock, Box } from 'lucide-react';
import api from '../../services/api';

export const Requests = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [assignedQuantity, setAssignedQuantity] = useState(1);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchIssues = async () => {
    try {
      const response = await api.get('/issues');
      setIssues(response.data?.content || response.data || []);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data?.content || response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchProducts();
  }, []);

  const handleApprove = async (e) => {
    e.preventDefault();

    try {
      await api.patch(`/admin/issues/${selectedIssue.id}/status`, {
        status: 'APPROVED'
      });
      setSelectedIssue(null);
      fetchIssues();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve issue');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason) return alert("Please provide a rejection reason.");

    try {
      await api.patch(`/admin/issues/${selectedIssue.id}/status`, {
        status: 'REJECTED',
        reason: rejectionReason
      });
      setSelectedIssue(null);
      fetchIssues();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject issue');
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading requests...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Requests</h1>
      
      <div className="bg-transparent">
        <div className="list-header text-slate-500 font-semibold px-4">
          <div className="w-1/6">Issue #</div>
          <div className="w-1/4">Title / Product</div>
          <div className="w-1/6">Requested By</div>
          <div className="w-[10%]">Qty</div>
          <div className="w-[10%]">Total ($)</div>
          <div className="w-[10%]">Status</div>
          <div className="w-1/6 text-right">Actions</div>
        </div>
        <div className="flex flex-col">
          {issues.filter(i => i.status === 'OPEN').map((issue) => (
            <div key={issue.id} className="list-row px-4">
              <div className="w-1/6 font-mono text-xs text-slate-400">{issue.issueNumber}</div>
              <div className="w-1/4">
                <p className="font-medium text-white truncate">{issue.title}</p>
                {issue.productName && (
                  <p className="text-xs text-primary mt-1 truncate">📦 {issue.productName}</p>
                )}
              </div>
              <div className="w-1/6 text-sm text-slate-400 truncate">{issue.createdByEmail || issue.createdBy}</div>
              <div className="w-[10%] text-sm text-slate-400">{issue.requestedQuantity}</div>
              <div className="w-[10%] text-sm text-slate-400">{issue.totalPrice ? `$${issue.totalPrice}` : '-'}</div>
              <div className="w-[10%]">
                <span className="badge badge-neutral">
                  {issue.status}
                </span>
              </div>
              <div className="w-1/6 text-right">
                <button
                  onClick={() => {
                    setSelectedIssue(issue);
                    setAssignedQuantity(issue.requestedQuantity || 1);
                    setSelectedProductId(issue.productId || '');
                    setRejectionReason('');
                  }}
                  className="btn btn-secondary text-xs h-8 px-3"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
          {issues.filter(i => i.status === 'OPEN').length === 0 && (
            <div className="py-8 text-center text-slate-500">
              No pending requests in the queue.
            </div>
          )}
        </div>
      </div>

      {selectedIssue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Review Request: {selectedIssue.issueNumber}</h2>
            <p className="text-slate-400 mb-6">{selectedIssue.title} - {selectedIssue.description}</p>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-2">Approve Request</h3>
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">
                    Approving this request will allow you to fulfill it by ordering a product from the Products catalog.
                  </p>
                  <button
                    onClick={handleApprove}
                    className="w-full py-2 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 transition flex justify-center items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve Request
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white border-b border-slate-800 pb-2">Reject Request</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Reason for Rejection</label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows="3"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-sm"
                      placeholder="Explain why this is rejected..."
                    />
                  </div>
                  <button
                    onClick={handleReject}
                    className="w-full py-2 bg-red-500/10 text-red-500 text-sm font-semibold rounded-lg hover:bg-red-500 hover:text-white transition flex justify-center items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Reject Request
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedIssue(null)}
              className="w-full py-2 bg-slate-800 text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-700 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
