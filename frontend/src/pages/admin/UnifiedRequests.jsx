import React, { useState, useEffect } from 'react';
import { Search, Clock, CheckCircle, XCircle, X } from 'lucide-react';
import { procurementService } from '../../services/procurementService';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FilterDropdown } from '../../components/common/FilterDropdown';
import { StatCard } from '../../components/common/StatCard';
import { ShieldCheck, Landmark, CreditCard, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const UnifiedRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // Stats
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  // Payment states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [credential, setCredential] = useState('');
  const [paymentSettings, setPaymentSettings] = useState({ savedCards: [] });
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', exp: '', cvv: '' });
  const [selectedBank, setSelectedBank] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchPaymentPrerequisites();
  }, []);

  const fetchPaymentPrerequisites = async () => {
    try {
      const [suppRes, settingsRes] = await Promise.all([
        procurementService.getSuppliers(),
        procurementService.api.get('/admin/payment-settings').catch(() => ({ data: { savedCards: [] } }))
      ]);
      setSuppliers(suppRes.data?.content || suppRes.data || []);
      setPaymentSettings(settingsRes.data || { savedCards: [] });
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await procurementService.getAllRequests();
      const allIssues = Array.isArray(response?.data?.content) ? response.data.content : (Array.isArray(response?.data) ? response.data : []);
      
      const sorted = allIssues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRequests(sorted);

      // Compute stats
      setStats({
        total: sorted.length,
        pending: sorted.filter(r => r.status === 'PENDING').length,
        approved: sorted.filter(r => r.status === 'APPROVED' || r.status === 'PAYMENT_PENDING').length
      });
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChangeInline = async (request, status) => {
    if (status === 'REJECTED') {
      const confirmReject = window.confirm(`Are you sure you want to reject request ${request.issueNumber}?`);
      if (!confirmReject) return;
    }

    try {
      const payload = { status };
      if (status === 'REJECTED') {
        const remarks = window.prompt("Enter rejection remarks (required):");
        if (!remarks) return alert("Remarks are required for rejection.");
        payload.rejectionReason = remarks;
      }
      await procurementService.reviewIssue(request.id, payload);
      alert(`Request successfully ${status.toLowerCase()}.`);
      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleStatusChange = async (status) => {
    if (!selectedRequest) return;
    await handleStatusChangeInline(selectedRequest, status);
    setSelectedRequest(null);
  };

  const handlePaymentConfirm = async (e) => {
    e.preventDefault();
    if (!paymentMethod) return alert('Select a payment method');
    if (paymentMethod === 'CARD' && (!cardDetails.name || !cardDetails.number || !cardDetails.exp || !cardDetails.cvv)) return alert('Please fill in all card details');
    if (paymentMethod === 'NET_BANKING' && !selectedBank) return alert('Select a bank');

    setPaymentError('');
    setOrderSubmitting(true);
    try {
      const payload = {
        issueId: selectedRequest.id,
        productId: selectedRequest.productId,
        quantity: selectedRequest.requestedQuantity || 1,
        paymentMethod,
        credential: 'DEMO'
      };

      const payRes = await procurementService.api.post('/payments/process-simulated', payload);

      setPaymentSuccessData({
        amount: payRes?.data?.amount,
        poNumber: payRes?.data?.poNumber,
        txnId: payRes?.data?.txnId,
        supplierName: selectedRequest.product?.supplier?.supplierName || 'Auto-Assigned Supplier',
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
      setPaymentError(err.response?.data?.message || 'Payment could not be processed. Please try again.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const columns = [
    { key: 'issueNumber', header: 'Request ID' },
    { key: 'title', header: 'Title' },
    { 
      key: 'requester', 
      header: 'Requester',
      render: (row) => row.createdByName || 'Unknown'
    },
    { 
      key: 'department', 
      header: 'Department',
      render: (row) => row.departmentName || 'N/A'
    },
    { 
      key: 'createdAt', 
      header: 'Date',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      align: 'right',
      render: (row) => (
        <div className="flex justify-end items-center gap-3">
          {(row.status === 'PENDING' || row.status === 'OPEN') && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedRequest(row); handleStatusChangeInline(row, 'APPROVED'); }}
                className="text-[var(--success)] hover:bg-[var(--success)]/10 p-1.5 rounded-full transition-colors"
                title="Approve"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedRequest(row); handleStatusChangeInline(row, 'REJECTED'); }}
                className="text-[var(--error)] hover:bg-[var(--error)]/10 p-1.5 rounded-full transition-colors"
                title="Reject"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </>
          )}
          {row.status === 'PAYMENT_PENDING' && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedRequest(row); setPaymentModalOpen(true); }}
              className="px-3 py-1.5 rounded-full bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
            >
              Pay Now
            </button>
          )}
          <button
            onClick={() => { setSelectedRequest(row); setPaymentModalOpen(false); }}
            className="text-sm font-semibold text-[var(--primary)] hover:underline ml-2"
          >
            Review
          </button>
        </div>
      )
    }
  ];

  const filterOptions = [
    { label: 'All Requests', value: 'ALL' },
    { label: 'Pending Review', value: 'PENDING' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  const filteredData = requests.filter(req => {
    if (statusFilter === 'ALL') return true;
    const s = (req.status || 'PENDING').toUpperCase();
    if (statusFilter === 'PENDING') return ['PENDING', 'OPEN'].includes(s);
    if (statusFilter === 'APPROVED') return ['APPROVED', 'PAYMENT_PENDING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'PAID'].includes(s);
    if (statusFilter === 'REJECTED') return ['REJECTED', 'CANCELLED'].includes(s);
    return true;
  });

  return (
    <div className="space-y-6">


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        <StatCard title="Total Requests" value={stats.total} />
        <StatCard title="Pending Review" value={stats.pending} color="warning" />
        <StatCard title="Approved" value={stats.approved} color="success" />
      </div>

      <div className="flex justify-end shrink-0">
        <FilterDropdown 
          options={filterOptions} 
          value={statusFilter} 
          onChange={setStatusFilter} 
        />
      </div>

      <div className="w-full">
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)]">Loading requests...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={filteredData} 
            searchPlaceholder="Search by ID, title, or requester..."
            searchableColumns={['title', 'issueNumber', 'description', 'requester']}
            emptyMessage="No requests found."
          />
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && !paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--card)] rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-[var(--input)] animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-[var(--input)] flex justify-between items-start bg-[var(--secondary)]">
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Review Request</h3>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Request <span className="font-semibold text-[var(--foreground)]">{selectedRequest.issueNumber}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Title</label>
                  <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{selectedRequest.title}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Requester</label>
                  <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
                    {selectedRequest.createdByName} 
                    <span className="text-[var(--muted)] ml-2 text-xs">({selectedRequest.departmentName || 'No Dept'})</span>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Category</label>
                  <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{selectedRequest.category}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Requested Quantity</label>
                  <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{selectedRequest.requestedQuantity}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Priority</label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      selectedRequest.priority === 'HIGH' || selectedRequest.priority === 'CRITICAL' 
                        ? 'bg-[var(--error-bg)] text-[var(--error)] border-[var(--error)]/20'
                        : 'bg-[var(--secondary)] text-[var(--foreground)] border-[var(--input)]'
                    }`}>
                      {selectedRequest.priority}
                    </span>
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Justification</label>
                  <p className="mt-2 text-sm text-[var(--secondary-foreground)] leading-relaxed bg-[var(--background)] p-4 rounded-2xl border border-[var(--input)]">
                    {selectedRequest.description || 'No justification provided.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-[var(--background)] border-t border-[var(--input)] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-[var(--muted)] uppercase tracking-wider font-semibold mb-2">Current Status</span>
                <StatusBadge status={selectedRequest.status} />
              </div>
              <div className="flex gap-3 items-center">
                {(selectedRequest.status === 'PENDING' || selectedRequest.status === 'OPEN') ? (
                  <>
                    <button 
                      onClick={() => handleStatusChange('REJECTED')}
                      className="px-6 py-2 rounded-xl font-semibold bg-transparent border-2 border-[var(--error)] text-[var(--error)] hover:bg-[var(--error)] hover:text-white transition-colors"
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleStatusChange('APPROVED')}
                      className="px-6 py-2 rounded-xl font-semibold bg-[var(--success)] text-white hover:bg-[var(--success)]/90 transition-colors shadow-sm"
                    >
                      Approve
                    </button>
                  </>
                ) : selectedRequest.status === 'PAYMENT_PENDING' ? (
                  <button 
                    onClick={() => setPaymentModalOpen(true)}
                    className="px-6 py-2 rounded-xl font-semibold bg-[var(--success)] text-white hover:bg-[var(--success)]/90 transition-colors shadow-sm"
                  >
                    Proceed to Payment
                  </button>
                ) : (
                  <span className="text-sm text-[var(--muted)] italic">
                    No further approve/reject actions.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedRequest && paymentModalOpen && !paymentSuccessData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] rounded-3xl shadow-xl max-w-md w-full border border-[var(--input)] overflow-hidden animate-in slide-in-from-right-8 duration-300">
            <div className="p-5 border-b border-[var(--input)] flex justify-between items-center bg-[var(--secondary)]">
              <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
                Simulated Checkout
              </h2>
              <button onClick={() => setPaymentModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[75vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide">Total Amount</div>
                <div className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
                  ₹{selectedRequest.totalPrice || 0}
                </div>
              </div>

              <form onSubmit={handlePaymentConfirm} className="space-y-6">
                


                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-[var(--muted)] block">Select Payment Method</label>
                  
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'QR' ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--input)] bg-[var(--background)] hover:border-[var(--primary)]/30'}`}>
                    <input type="radio" name="paymentMethod" value="QR" checked={paymentMethod === 'QR'} onChange={() => { setPaymentMethod('QR'); setPaymentError(''); }} className="w-4 h-4 text-[var(--primary)]" />
                    <QrCode className={`w-5 h-5 ${paymentMethod === 'QR' ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`} />
                    <span className="font-medium text-[var(--foreground)]">QR Payment</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--input)] bg-[var(--background)] hover:border-[var(--primary)]/30'}`}>
                    <input type="radio" name="paymentMethod" value="CARD" checked={paymentMethod === 'CARD'} onChange={() => { setPaymentMethod('CARD'); setPaymentError(''); }} className="w-4 h-4 text-[var(--primary)]" />
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'CARD' ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`} />
                    <span className="font-medium text-[var(--foreground)]">Card Payment</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'NET_BANKING' ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--input)] bg-[var(--background)] hover:border-[var(--primary)]/30'}`}>
                    <input type="radio" name="paymentMethod" value="NET_BANKING" checked={paymentMethod === 'NET_BANKING'} onChange={() => { setPaymentMethod('NET_BANKING'); setPaymentError(''); }} className="w-4 h-4 text-[var(--primary)]" />
                    <Landmark className={`w-5 h-5 ${paymentMethod === 'NET_BANKING' ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`} />
                    <span className="font-medium text-[var(--foreground)]">Net Banking</span>
                  </label>
                </div>

                {paymentMethod === 'QR' && (
                  <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-[var(--background)] rounded-xl border border-[var(--input)] text-center">
                    <div className="text-xs font-bold text-red-500 mb-4 tracking-wider uppercase">DEMO PAYMENT — NO REAL TRANSACTION</div>
                    <div className="bg-white p-4 inline-block rounded-xl mx-auto mb-2 shadow-sm border border-slate-200">
                      <QRCodeSVG 
                        value={JSON.stringify({
                          id: selectedRequest?.id,
                          supplier: selectedRequest?.product?.supplier?.supplierName,
                          amount: selectedRequest?.totalPrice,
                          type: 'DEMO'
                        })} 
                        size={160} 
                      />
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-2">Simulate scanning to pay</p>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-[var(--background)] rounded-xl border border-[var(--input)]">
                    <div className="text-xs font-bold text-red-500 mb-4 tracking-wider uppercase text-center">DEMO PAYMENT — NO REAL TRANSACTION</div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-[var(--muted)] block mb-1">Cardholder Name</label>
                        <input required type="text" className="form-input w-full" placeholder="John Doe" value={cardDetails.name} onChange={e => setCardDetails({...cardDetails, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase text-[var(--muted)] block mb-1">Card Number</label>
                        <input required type="text" maxLength={19} className="form-input w-full font-mono" placeholder="XXXX XXXX XXXX XXXX" value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value.replace(/\D/g, '')})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase text-[var(--muted)] block mb-1">Expiry (MM/YY)</label>
                          <input required type="text" maxLength={5} className="form-input w-full" placeholder="12/25" value={cardDetails.exp} onChange={e => setCardDetails({...cardDetails, exp: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-[var(--muted)] block mb-1">CVV</label>
                          <input required type="password" maxLength={4} className="form-input w-full font-mono" placeholder="•••" value={cardDetails.cvv} onChange={e => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NET_BANKING' && (
                  <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-[var(--background)] rounded-xl border border-[var(--input)]">
                    <div className="text-xs font-bold text-red-500 mb-4 tracking-wider uppercase text-center">DEMO PAYMENT — NO REAL TRANSACTION</div>
                    <label className="text-xs font-bold uppercase text-[var(--muted)] block mb-2">Select Bank</label>
                    <select required value={selectedBank} onChange={e => setSelectedBank(e.target.value)} className="form-input w-full">
                      <option value="">-- Choose a Bank --</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="AXIS">Axis Bank</option>
                      <option value="KOTAK">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentError && (
                  <div className="p-3 bg-[var(--error-bg)] border border-[var(--error)] rounded-xl text-sm font-medium text-[var(--error)] text-center animate-in fade-in">
                    {paymentError}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={orderSubmitting || !paymentMethod}
                    className="w-full py-3.5 text-sm font-bold text-white bg-[var(--success)] hover:bg-[var(--success)]/90 rounded-xl disabled:opacity-50 transition shadow-lg shadow-[var(--success)]/20"
                  >
                    {orderSubmitting ? 'Processing Securely...' : `Simulate Payment ₹${selectedRequest.totalPrice || 0}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {paymentSuccessData && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] rounded-3xl shadow-xl max-w-sm w-full p-8 text-center border border-[var(--input)] animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-[var(--success)]/10 text-[var(--success-foreground)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_0_8px_var(--card),0_0_0_10px_var(--success)]">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2 tracking-tight">Payment Successful</h2>
            <p className="text-sm text-[var(--secondary-foreground)] mb-8">The simulated payment was processed securely.</p>
            
            <div className="text-left bg-[var(--background)] p-5 rounded-2xl border border-[var(--input)] mb-8 text-sm text-[var(--foreground)] space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-[var(--input)]">
                <span className="text-[var(--muted)] font-medium">Amount Paid</span>
                <span className="font-bold text-lg text-[var(--foreground)]">₹{paymentSuccessData.amount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted)]">Transaction Ref</span>
                <span className="font-semibold font-mono text-xs">{paymentSuccessData.txnId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--muted)]">Order Ref</span>
                <span className="font-semibold font-mono text-xs">{paymentSuccessData.poNumber}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setPaymentSuccessData(null);
                setPaymentModalOpen(false);
                setSelectedRequest(null);
              }}
              className="w-full py-3 text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-2xl transition shadow-lg shadow-[var(--primary)]/20"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedRequests;
