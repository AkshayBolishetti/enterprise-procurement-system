import React, { useState, useEffect } from 'react';
import { Table } from '../../components/common/Table';
import { Input } from '../../components/common/Input';
import { Search, Building2, Truck } from 'lucide-react';
import api from '../../services/api';

export const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error fetching suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(s => 
    s.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Supplier Name', accessor: 'supplierName', cell: (row) => (
      <div className="flex items-center">
        <Truck className="h-5 w-5 mr-3 text-slate-400" />
        <span className="font-medium text-slate-900 dark:text-white">{row.supplierName}</span>
      </div>
    )},
    { header: 'Email', accessor: 'email' },
    { header: 'Status', accessor: 'status', cell: (row) => (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
        Active
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Suppliers</h1>

      <div className="card p-4">
        <div className="relative max-w-sm mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input 
            placeholder="Search suppliers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Table 
          columns={columns} 
          data={filteredSuppliers} 
          isLoading={loading} 
          emptyMessage="No suppliers found."
        />
      </div>
    </div>
  );
};
