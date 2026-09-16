import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import api from '../../services/api';

export const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    sku: '',
    productName: '',
    description: '',
    category: '',
    unitPrice: '',
    gstRate: '',
    availableQuantity: '',
    minOrderQuantity: '',
    status: 'DRAFT',
    availability: 'ACTIVE'
  });

  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const response = await api.get(`/products/${id}`);
          const p = response.data?.data || response.data;
          setFormData({
            sku: p.sku || '',
            productName: p.productName || p.name || '',
            description: p.description || '',
            category: p.category || p.categoryName || '',
            unitPrice: p.unitPrice || p.price || '',
            gstRate: p.gstRate || '',
            availableQuantity: p.availableQuantity || p.quantity || '',
            minOrderQuantity: p.minOrderQuantity || '',
            status: p.status || 'DRAFT',
            availability: p.availability || 'ACTIVE'
          });
        } catch (err) {
          setError('Failed to load product details');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        gstRate: parseFloat(formData.gstRate),
        availableQuantity: parseInt(formData.availableQuantity, 10),
        minOrderQuantity: formData.minOrderQuantity ? parseInt(formData.minOrderQuantity, 10) : null
      };

      if (isEdit) {
        await api.put(`/supplier/products/${id}`, payload);
      } else {
        await api.post('/supplier/products', payload);
      }
      navigate('/supplier/products');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500 text-center py-12">Loading product data...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/supplier/products')}
          className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <div className="card p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="SKU"
              required
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="e.g. MACBOOK-PRO-16"
            />
            <Input
              label="Product Name"
              required
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              placeholder="e.g. MacBook Pro 16-inch"
            />
          </div>

          <Input
            label="Category"
            required
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g. Electronics"
          />

          <div className="space-y-2">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="form-input h-auto resize-y"
              placeholder="Product description..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Unit Price ($)"
              required
              type="number"
              step="0.01"
              min="0"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
            />
            <Input
              label="GST Rate (%)"
              required
              type="number"
              step="0.01"
              min="0"
              name="gstRate"
              value={formData.gstRate}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Available Quantity"
              required
              type="number"
              min="0"
              name="availableQuantity"
              value={formData.availableQuantity}
              onChange={handleChange}
            />
            <Input
              label="Min Order Quantity"
              type="number"
              min="1"
              name="minOrderQuantity"
              value={formData.minOrderQuantity}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="form-label">Lifecycle Status</label>
            <input
              type="text"
              name="status"
              value={formData.status}
              disabled
              className="form-input bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="form-label">Availability</label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="form-input"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <Button type="submit" isLoading={submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? 'Saving...' : 'Save Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
