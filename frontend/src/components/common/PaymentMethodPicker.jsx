import React, { useState } from 'react';
import { CreditCard, QrCode, Smartphone, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export const PaymentMethodPicker = ({ order, onPaymentSuccess, onCancel }) => {
  const [method, setMethod] = useState(null); // 'UPI' | 'QR_CODE'
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [upiId, setUpiId] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const handleConfirm = async () => {
    if (method === 'UPI' && !upiId) {
      alert("Please enter a valid UPI ID");
      return;
    }
    
    setSubmitting(true);
    try {
      // API call to mock payment provider
      await api.post(`/v1/payments/process`, {
        orderId: order.id,
        paymentMethod: method,
        referenceNumber: method + '-' + Date.now(),
        upiId: method === 'UPI' ? upiId : null
      });
      
      setSuccessData({
        receipt: `RCPT-${Date.now().toString().slice(-6)}`,
        amount: order.totalAmount,
        method: method
      });
      
    } catch (error) {
      alert(error.response?.data?.message || 'Payment processing failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center max-w-sm mx-auto shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Successful</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Your transaction has been processed securely.</p>
        
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-left mb-8 space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Receipt No.</span>
            <span className="font-semibold text-slate-900 dark:text-white font-mono">{successData.receipt}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Amount Paid</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(successData.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-sm">Method</span>
            <span className="font-semibold text-slate-900 dark:text-white">{successData.method}</span>
          </div>
        </div>
        
        <button 
          onClick={() => onPaymentSuccess(successData)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pay Supplier</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Order {order.orderNumber} • {formatCurrency(order.totalAmount)}
        </p>
      </div>

      {!method ? (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => setMethod('QR_CODE')}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition group"
          >
            <QrCode className="w-10 h-10 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
            <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">Scan QR</span>
          </button>
          
          <button 
            onClick={() => setMethod('UPI')}
            className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition group"
          >
            <Smartphone className="w-10 h-10 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
            <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">UPI ID</span>
          </button>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 mb-6">
          {method === 'QR_CODE' ? (
            <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="p-3 bg-white rounded-xl shadow-sm mb-4">
                {/* Mock QR Code SVG */}
                <svg width="180" height="180" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="#fff" />
                  <rect x="10" y="10" width="80" height="80" fill="none" stroke="#000" strokeWidth="2" />
                  <path d="M 20 20 h 15 v 15 h -15 Z M 65 20 h 15 v 15 h -15 Z M 20 65 h 15 v 15 h -15 Z" fill="#000" />
                  <rect x="40" y="40" width="20" height="20" fill="#000" />
                  <path d="M 20 40 h 10 v 10 h -10 Z M 70 40 h 10 v 10 h -10 Z M 40 70 h 10 v 10 h -10 Z" fill="#000" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 text-center">
                Scan with any supported UPI app to pay {formatCurrency(order.totalAmount)}
              </p>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Enter UPI ID</label>
              <input 
                type="text" 
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@upi"
                className="w-full form-input mb-2"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">A payment request will be sent to this UPI ID.</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button 
          onClick={() => method ? setMethod(null) : onCancel()}
          className="flex-1 py-2.5 rounded-lg font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          {method ? 'Back' : 'Cancel'}
        </button>
        {method && (
          <button 
            onClick={handleConfirm}
            disabled={submitting || (method === 'UPI' && !upiId)}
            className="flex-1 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {submitting ? 'Processing...' : 'Confirm Payment'}
          </button>
        )}
      </div>
    </div>
  );
};
