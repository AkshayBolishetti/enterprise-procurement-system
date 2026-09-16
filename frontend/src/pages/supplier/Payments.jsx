import React, { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import api from '../../services/api';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';

export const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/payments');
        setPayments(response.data?.content || response.data || []);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const columns = [
    { 
      key: 'paymentDate', 
      header: 'Date',
      render: (row) => new Date(row.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    },
    { 
      key: 'transactionReference', 
      header: 'Reference',
      render: (row) => <span className="font-mono text-sm text-[var(--muted)]">{row.transactionReference}</span>
    },
    { 
      key: 'productName', 
      header: 'Product',
      render: (row) => <span className="font-medium text-[var(--foreground)]">{row.productName || 'N/A'}</span>
    },
    { 
      key: 'amount', 
      header: 'Amount',
      render: (row) => <span className="font-bold text-[var(--foreground)]">{formatCurrency(row.amount)}</span>
    },
    { 
      key: 'paymentStatus', 
      header: 'Status',
      render: (row) => <StatusBadge status={row.paymentStatus} />
    }
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-[var(--primary)]" />
            Payments History
          </h1>
          <p className="text-sm text-[var(--secondary-foreground)] mt-1">Review all your received payments and transactions.</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)]">Loading payments...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={payments} 
            searchPlaceholder="Search payments by reference..."
            searchableColumns={['transactionReference', 'productName']}
            pagination={true}
            emptyMessage="No payments found."
          />
        )}
      </div>
    </div>
  );
};

export default Payments;
