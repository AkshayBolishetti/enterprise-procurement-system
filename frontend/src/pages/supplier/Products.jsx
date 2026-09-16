import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/common/DataTable';
import api from '../../services/api';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/supplier/products');
      setProducts(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/supplier/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert(error.message || 'Failed to delete product. It may be associated with an existing order.');
      }
    }
  };

  const handleAvailabilityChange = async (id, newAvailability) => {
    try {
      await api.patch(`/supplier/products/${id}/availability`, { availability: newAvailability });
      fetchProducts();
    } catch (error) {
      console.error('Failed to update availability:', error);
      alert('Failed to update product availability');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const columns = [
    { 
      key: 'sku', 
      header: 'SKU',
      render: (row) => <span className="font-mono text-sm text-[var(--muted)]">{row.sku}</span>
    },
    { 
      key: 'productName', 
      header: 'Product Name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[var(--secondary)] text-[var(--muted)] flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <span className="font-medium text-[var(--foreground)]">{row.productName || row.name}</span>
        </div>
      )
    },
    { 
      key: 'category', 
      header: 'Category',
      render: (row) => row.category || row.categoryName 
    },
    { 
      key: 'unitPrice', 
      header: 'Price',
      render: (row) => formatCurrency(row.unitPrice || row.price || 0)
    },
    { 
      key: 'gstRate', 
      header: 'GST %',
      render: (row) => `${row.gstRate || 0}%` 
    },
    { 
      key: 'availableQuantity', 
      header: 'Stock',
      render: (row) => {
        const qty = row.availableQuantity || row.quantity || 0;
        const minQty = row.minOrderQuantity || 5;
        let badgeClass = 'bg-[var(--success)]/10 text-[var(--success-foreground)] border border-[var(--success)]/20';
        if (qty === 0) badgeClass = 'bg-[var(--error-bg)] text-[var(--error)] border border-[var(--error)]/20';
        else if (qty <= minQty) badgeClass = 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20';
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass}`}>
            {qty}
          </span>
        );
      }
    },
    { 
      key: 'availability', 
      header: 'Availability',
      render: (row) => (
        <select 
           value={row.availability || 'ACTIVE'} 
           onChange={(e) => handleAvailabilityChange(row.id, e.target.value)}
           className={`text-xs font-bold uppercase tracking-wider border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
             row.availability === 'ACTIVE' || !row.availability 
               ? 'bg-[var(--success)]/10 text-[var(--success-foreground)] border-[var(--success)]/30'
               : 'bg-[var(--error-bg)] text-[var(--error)] border-[var(--error)]/30'
           }`}
        >
          <option value="ACTIVE" className="text-black dark:text-white bg-white dark:bg-slate-900">🟢 Active</option>
          <option value="INACTIVE" className="text-black dark:text-white bg-white dark:bg-slate-900">🔴 Inactive</option>
        </select>
      )
    },
    { 
      key: 'actions', 
      header: '',
      sortable: false,
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => navigate(`/supplier/products/${row.id}`)}
            className="p-2 text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition"
            title="Edit Product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-2 text-[var(--muted)] hover:text-[var(--error)] hover:bg-[var(--error-bg)] rounded-lg transition"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">My Products</h1>
          <p className="text-sm text-[var(--secondary-foreground)] mt-1">Manage your catalog and stock levels</p>
        </div>
        <button 
          onClick={() => navigate('/supplier/products/new')} 
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="p-8 text-center text-[var(--muted)]">Loading products...</div>
        ) : (
          <DataTable 
            columns={columns}
            data={products}
            searchPlaceholder="Search by SKU or Product Name..."
            searchableColumns={['sku', 'productName', 'name', 'category']}
            pagination={true}
            emptyMessage="You haven't added any products yet."
          />
        )}
      </div>
    </div>
  );
};

export default Products;
