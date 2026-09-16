import React, { useState, useEffect } from 'react';
import { procurementService } from '../../services/procurementService';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ShieldCheck, Landmark, CreditCard, QrCode, X, CheckCircle } from 'lucide-react';

export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Payment states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [credential, setCredential] = useState('');
  const [paymentSettings, setPaymentSettings] = useState({ savedCards: [] });
  const [selectedCardId, setSelectedCardId] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const [paymentsRes, issuesRes] = await Promise.all([
        procurementService.api.get('/payments'),
        procurementService.getAllRequests()
      ]);
      
      const successData = paymentsRes.data?.content || paymentsRes.data || [];
      const successPayments = Array.isArray(successData) ? successData.map(p => ({
        ...p,
        isPendingIssue: false,
      })) : [];

      const issuesData = issuesRes.data?.content || issuesRes.data || [];
      const pendingIssues = Array.isArray(issuesData) ? issuesData
        .filter(i => i.status === 'PAYMENT_PENDING')
        .map(i => ({
          isPendingIssue: true,
          id: i.id,
          transactionReference: i.issueNumber,
          paymentDate: i.createdAt,
          productName: i.productName || i.title,
          paymentStatus: 'PENDING',
          amount: i.totalPrice,
          originalRequest: i
        })) : [];

      const combined = [...successPayments, ...pendingIssues];
      const sorted = combined.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
      setPayments(sorted);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err.response?.data?.message || 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentPrerequisites = async () => {
    try {
      const [suppRes, settingsRes] = await Promise.all([
        procurementService.getSuppliers(),
        procurementService.api.get('/admin/payment-settings').catch(() => ({ data: { data: { savedCards: [], hasMpin: false } } }))
      ]);
      setSuppliers(suppRes.data?.content || suppRes.data || []);
      const settingsData = settingsRes.data?.data || settingsRes.data || { savedCards: [], hasMpin: false };
      setPaymentSettings(settingsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchPaymentPrerequisites();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const handlePaymentConfirm = async (e) => {
    e.preventDefault();
    if (!paymentMethod) return alert('Select a payment method');
    
    if ((paymentMethod === 'UPI' || paymentMethod === 'NET_BANKING') && !paymentSettings.hasMpin) {
      setPaymentError('You must set up an MPIN in Settings before using this payment method.');
      return;
    }
    
    if (paymentMethod === 'CARD' && !selectedCardId) return alert('Select a saved card');
    if (credential.length !== 4) return alert('Enter 4-digit PIN');

    setPaymentError('');
    setOrderSubmitting(true);
    try {
      const payload = {
        issueId: selectedRequest.id,
        productId: selectedRequest.productId,
        quantity: selectedRequest.requestedQuantity || 1,
        paymentMethod,
        credential,
        ...(paymentMethod === 'CARD' && { cardId: selectedCardId })
      };

      const payRes = await procurementService.api.post('/payments/process-simulated', payload);

      setPaymentSuccessData({
        amount: payRes?.data?.amount,
        poNumber: payRes?.data?.poNumber,
        txnId: payRes?.data?.txnId,
        supplierName: selectedRequest.product?.supplier?.supplierName || 'Auto-Assigned Supplier',
      });
      fetchPayments();
    } catch (err) {
      console.error(err);
      setPaymentError(err.response?.data?.message || 'Payment could not be processed. Please try again.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'transactionReference',
      header: 'Order Request ID',
      render: (row) => <span className="font-mono text-sm font-semibold">{row.transactionReference || 'N/A'}</span>
    },
    {
      key: 'paymentDate',
      header: 'Date',
      render: (row) => new Date(row.paymentDate).toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      })
    },
    {
      key: 'productName',
      header: 'Product',
      render: (row) => <span className="font-semibold text-[var(--foreground)]">{row.productName || 'N/A'}</span>
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (row) => <StatusBadge status={row.paymentStatus || 'PAID'} />
    },
    {
      key: 'amount',
      header: 'Supplier Amount',
      align: 'right',
      render: (row) => <span className="font-bold text-[var(--primary)]">{formatCurrency(row.amount)}</span>
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => row.isPendingIssue ? (
        <button
          onClick={() => {
            setSelectedRequest(row.originalRequest);
            setPaymentMethod('');
            setCredential('');
            setPaymentError('');
            setSelectedCardId('');
            setPaymentModalOpen(true);
          }}
          className="px-3 py-1.5 rounded-full bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
        >
          Pay
        </button>
      ) : null
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Payments</h1>
        </div>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)]">Loading payment history...</div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-[var(--error)] mb-2">{error}</p>
            <button onClick={fetchPayments} className="btn-secondary">Retry</button>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={payments}
            searchPlaceholder="Search by request ID or product..."
            searchableColumns={['transactionReference', 'productName']}
            emptyMessage="No payments found."
          />
        )}
      </div>

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
                  
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--input)] bg-[var(--background)] hover:border-[var(--primary)]/30'}`}>
                    <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => { setPaymentMethod('UPI'); setCredential(''); setPaymentError(''); }} className="w-4 h-4 text-[var(--primary)]" />
                    <QrCode className={`w-5 h-5 ${paymentMethod === 'UPI' ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`} />
                    <span className="font-medium text-[var(--foreground)]">UPI (MPIN)</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--input)] bg-[var(--background)] hover:border-[var(--primary)]/30'}`}>
                    <input type="radio" name="paymentMethod" value="CARD" checked={paymentMethod === 'CARD'} onChange={() => { setPaymentMethod('CARD'); setCredential(''); setPaymentError(''); }} className="w-4 h-4 text-[var(--primary)]" />
                    <CreditCard className={`w-5 h-5 ${paymentMethod === 'CARD' ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`} />
                    <span className="font-medium text-[var(--foreground)]">Saved Card</span>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'NET_BANKING' ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--input)] bg-[var(--background)] hover:border-[var(--primary)]/30'}`}>
                    <input type="radio" name="paymentMethod" value="NET_BANKING" checked={paymentMethod === 'NET_BANKING'} onChange={() => { setPaymentMethod('NET_BANKING'); setCredential(''); setPaymentError(''); }} className="w-4 h-4 text-[var(--primary)]" />
                    <Landmark className={`w-5 h-5 ${paymentMethod === 'NET_BANKING' ? 'text-[var(--primary)]' : 'text-[var(--muted)]'}`} />
                    <span className="font-medium text-[var(--foreground)]">Net Banking</span>
                  </label>
                </div>

                {paymentMethod === 'CARD' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold uppercase text-[var(--muted)] block mb-2">Select Card</label>
                    <select required value={selectedCardId} onChange={e => setSelectedCardId(e.target.value)} className="form-input w-full">
                      <option value="">-- Choose a Card --</option>
                      {paymentSettings.savedCards.map(c => (
                        <option key={c.id} value={c.id}>{c.maskedNumber} - {c.cardholderName}</option>
                      ))}
                    </select>
                  </div>
                )}

                {paymentMethod && (
                  <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-[var(--background)] rounded-xl border border-[var(--input)]">
                    <label className="text-xs font-bold uppercase text-[var(--muted)] block mb-2 text-center">
                      {paymentMethod === 'UPI' ? 'Enter 4-Digit MPIN' : paymentMethod === 'CARD' ? 'Enter 4-Digit Card PIN' : 'Enter 4-Digit Bank PIN'}
                    </label>
                    <input 
                      type="password" 
                      maxLength={4}
                      required
                      value={credential}
                      onChange={e => setCredential(e.target.value.replace(/\D/g, ''))}
                      className="form-input text-center tracking-[1em] text-2xl font-mono block w-full max-w-[200px] mx-auto py-3"
                      placeholder="••••"
                    />
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
                    disabled={orderSubmitting || !paymentMethod || (paymentMethod === 'CARD' && !selectedCardId) || credential.length !== 4}
                    className="w-full py-3.5 text-sm font-bold text-white bg-[var(--success)] hover:bg-[var(--success)]/90 rounded-xl disabled:opacity-50 transition shadow-lg shadow-[var(--success)]/20"
                  >
                    {orderSubmitting ? 'Processing Securely...' : 'Process Payment'}
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

export default Payments;
