import React, { useState, useEffect, useMemo } from 'react';
import { procurementService } from '../../services/procurementService';
import { Search, Package, Tag, Building2, ShoppingCart, X, Monitor, Paperclip, Box, Star, Minus, Plus, Info } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const Products = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [sortOrder, setSortOrder] = useState('');
  const [categories, setCategories] = useState([]);

  // Detail modal state
  const [detailProduct, setDetailProduct] = useState(null);

  // Request modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('OFFICE');
  const [quantityError, setQuantityError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, suppRes, catRes] = await Promise.all([
        procurementService.getAllProducts(),
        procurementService.getSuppliers(),
        procurementService.getCategories()
      ]);
      const prodData = prodRes?.data?.content || prodRes?.data || prodRes || [];
      const suppData = suppRes?.data?.content || suppRes?.data || suppRes || [];
      const catData = catRes?.data?.content || catRes?.data || catRes || [];
      
      setAllProducts(Array.isArray(prodData) ? prodData : []);
      setSuppliers(Array.isArray(suppData) ? suppData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      console.error('Error fetching data', err);
      setError(err.message || 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Client-side filtering: search + category + supplier + sort
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search filter
    const trimmed = searchTerm.trim().toLowerCase();
    if (trimmed) {
      result = result.filter(p => 
        (p.productName || '').toLowerCase().includes(trimmed) ||
        (p.sku || '').toLowerCase().includes(trimmed) ||
        (p.productCode || '').toLowerCase().includes(trimmed)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Supplier filter
    if (selectedSuppliers.length > 0) {
      result = result.filter(p => selectedSuppliers.includes(String(p.supplierId)));
    }

    // Sort
    if (sortOrder === 'price_asc') {
      result.sort((a, b) => (a.unitPrice || 0) - (b.unitPrice || 0));
    } else if (sortOrder === 'price_desc') {
      result.sort((a, b) => (b.unitPrice || 0) - (a.unitPrice || 0));
    }

    return result;
  }, [allProducts, searchTerm, selectedCategories, selectedSuppliers, sortOrder]);

  const toggleCategory = (category) => {
    setSelectedCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const toggleSupplier = (supplierId) => {
    setSelectedSuppliers(prev => prev.includes(supplierId) ? prev.filter(s => s !== supplierId) : [...prev, supplierId]);
  };

  const getCategoryIcon = (category) => {
    switch((category || '').toLowerCase()) {
      case 'electronics': return <Monitor className="w-8 h-8" />;
      case 'office supplies': return <Paperclip className="w-8 h-8" />;
      case 'furniture': return <Box className="w-8 h-8" />;
      default: return <Package className="w-8 h-8" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  // Quantity validation helper
  const validateQuantity = (value, maxQty) => {
    if (value === '' || value === null || value === undefined) {
      return 'Quantity is required.';
    }
    const num = Number(value);
    if (!Number.isFinite(num) || !Number.isInteger(num)) {
      return 'Quantity must be a whole number.';
    }
    if (num < 1) {
      return 'Quantity must be at least 1.';
    }
    if (num > maxQty) {
      return 'Requested quantity exceeds available stock.';
    }
    return '';
  };

  const handleQuantityChange = (value) => {
    const maxQty = selectedProduct?.availableQuantity || 0;
    // Allow empty string for typing
    if (value === '') {
      setRequestQuantity('');
      setQuantityError('Quantity is required.');
      return;
    }
    // Strip non-numeric
    const cleaned = String(value).replace(/[^0-9]/g, '');
    if (cleaned === '') {
      setRequestQuantity('');
      setQuantityError('Quantity must be a whole number.');
      return;
    }
    const num = parseInt(cleaned, 10);
    setRequestQuantity(num);
    setQuantityError(validateQuantity(num, maxQty));
  };

  const incrementQuantity = () => {
    const maxQty = selectedProduct?.availableQuantity || 0;
    const current = typeof requestQuantity === 'number' ? requestQuantity : 1;
    if (current < maxQty) {
      const next = current + 1;
      setRequestQuantity(next);
      setQuantityError(validateQuantity(next, maxQty));
    }
  };

  const decrementQuantity = () => {
    const current = typeof requestQuantity === 'number' ? requestQuantity : 1;
    if (current > 1) {
      const next = current - 1;
      setRequestQuantity(next);
      setQuantityError('');
    }
  };

  const openRequestModal = (product) => {
    setSelectedProduct(product);
    setRequestTitle(`Request for ${product.productName}`);
    setRequestDescription(`I would like to request ${product.productName} for official use.`);
    setRequestQuantity(1);
    setQuantityError('');
    setRequestModalOpen(true);
  };

  const handleRaiseRequest = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !requestTitle) return;

    const maxQty = selectedProduct.availableQuantity || 0;
    const err = validateQuantity(requestQuantity, maxQty);
    if (err) {
      setQuantityError(err);
      return;
    }

    setRequestSubmitting(true);
    try {
      await procurementService.createRequest({
        title: requestTitle,
        description: requestDescription,
        category: selectedProduct.category,
        priority: 'MEDIUM',
        productId: selectedProduct.id,
        requestedQuantity: requestQuantity,
        deliveryAddress: deliveryAddress
      });
      alert('Request raised successfully!');
      setRequestModalOpen(false);
      setSelectedProduct(null);
      fetchData(); // Refresh products to reflect any changes
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to raise request');
    } finally {
      setRequestSubmitting(false);
    }
  };

  const isQuantityValid = quantityError === '' && typeof requestQuantity === 'number' && requestQuantity >= 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Products Catalog</h1>
          <p className="text-sm text-[var(--secondary-foreground)] mt-1">Browse and request products for procurement</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-60 shrink-0 space-y-4">
          <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--input)] shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
            <h3 className="font-semibold text-[var(--foreground)] mb-3">Search & Sort</h3>
            <div className="space-y-3">
              <div className="relative">
                <Search className="h-4 w-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-9"
                />
              </div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-input"
              >
                <option value="">Sort by Price</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--input)] shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
            <h3 className="font-semibold text-[var(--foreground)] mb-3">Categories</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {categories.map((cat, idx) => {
                const catName = cat.categoryName || cat.name || '';
                return (
                  <label key={idx} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={selectedCategories.includes(catName)}
                      onChange={() => toggleCategory(catName)}
                      className="w-4 h-4 rounded text-[var(--primary)] bg-[var(--background)] border-[var(--input)] focus:ring-[var(--primary)]"
                    />
                    <span className="text-sm text-[var(--foreground)] truncate">{catName}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--input)] shadow-[0_2px_20px_rgba(0,0,0,0.02)]">
            <h3 className="font-semibold text-[var(--foreground)] mb-3">Suppliers</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {suppliers.map(sup => (
                <label key={sup.id} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={selectedSuppliers.includes(sup.id.toString())}
                    onChange={() => toggleSupplier(sup.id.toString())}
                    className="w-4 h-4 rounded text-[var(--primary)] bg-[var(--background)] border-[var(--input)] focus:ring-[var(--primary)]"
                  />
                  <span className="text-sm text-[var(--foreground)] truncate" title={sup.supplierName}>{sup.supplierName}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="p-12 text-center text-[var(--muted)]">Loading products...</div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-[var(--error)] mb-4">{error}</p>
              <button onClick={fetchData} className="btn-secondary">Retry</button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-[var(--muted)] bg-[var(--card)] rounded-2xl border border-[var(--input)]">
              No products found matching your criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map(product => {
                const isActive = !product.availability || product.availability === 'ACTIVE';

                return (
                  <div 
                    key={product.id} 
                    className="bg-[var(--card)] rounded-2xl border border-[var(--input)] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden flex flex-col"
                    onClick={() => setDetailProduct(product)}
                  >
                    <div className="p-5 flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                          {getCategoryIcon(product.category)}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                          isActive 
                            ? 'bg-[var(--success)]/10 text-[var(--success-foreground)] border-[var(--success)]/20' 
                            : 'bg-[var(--error-bg)] text-[var(--error)] border-[var(--error)]/20'
                        }`}>
                          {isActive ? 'Active' : 'Out of Stock'}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-[var(--foreground)] line-clamp-2" title={product.productName}>
                        {product.productName}
                      </h3>
                      <p className="text-xs text-[var(--muted)] mt-1 font-mono">SKU: {product.sku}</p>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xl font-bold text-[var(--foreground)]">{formatCurrency(product.unitPrice)}</div>
                        {(product.totalRatings > 0) && (
                          <div className="flex items-center gap-1 text-sm font-medium text-[var(--foreground)]">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span>{product.averageRating?.toFixed(1) || '0.0'}</span>
                            <span className="text-[var(--muted)] font-normal">({product.totalRatings})</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 bg-[var(--secondary)] px-2 py-1 rounded-md text-[var(--secondary-foreground)]">
                          <Tag className="w-3 h-3" /> {product.category || 'N/A'}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-[var(--secondary)] px-2 py-1 rounded-md text-[var(--secondary-foreground)] truncate max-w-[120px]" title={product.supplierName}>
                          <Building2 className="w-3 h-3" /> {product.supplierName || 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-[var(--secondary)]/30 border-t border-[var(--input)] flex items-center justify-end gap-3">
                      {isActive && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openRequestModal(product);
                          }}
                          className="btn-primary py-2 px-4 flex-1 justify-center shadow-md shadow-[var(--primary)]/20"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" /> Request
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Product Details Modal */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] rounded-2xl shadow-xl max-w-lg w-full border border-[var(--input)] overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-[var(--input)] flex justify-between items-center bg-[var(--secondary)] shrink-0">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Product Details</h2>
              <button onClick={() => setDetailProduct(null)} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                  {getCategoryIcon(detailProduct.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-[var(--foreground)]">{detailProduct.productName}</h3>
                  <p className="text-sm text-[var(--muted)] font-mono mt-0.5">SKU: {detailProduct.sku}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shrink-0 ${
                  (!detailProduct.availability || detailProduct.availability === 'ACTIVE')
                    ? 'bg-[var(--success)]/10 text-[var(--success-foreground)] border-[var(--success)]/20' 
                    : 'bg-[var(--error-bg)] text-[var(--error)] border-[var(--error)]/20'
                }`}>
                  {(!detailProduct.availability || detailProduct.availability === 'ACTIVE') ? 'Active' : 'Out of Stock'}
                </span>
              </div>

              {detailProduct.description && (
                <div>
                  <h4 className="text-sm font-semibold text-[var(--foreground)] mb-1">Description</h4>
                  <p className="text-sm text-[var(--secondary-foreground)]">{detailProduct.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--input)]">
                  <p className="text-xs text-[var(--muted)]">Unit Price</p>
                  <p className="font-bold text-[var(--primary)] text-lg">{formatCurrency(detailProduct.unitPrice)}</p>
                </div>
                <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--input)]">
                  <p className="text-xs text-[var(--muted)]">Available Qty</p>
                  <p className="font-bold text-[var(--foreground)] text-lg">{detailProduct.availableQuantity ?? 'N/A'}</p>
                </div>
                <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--input)]">
                  <p className="text-xs text-[var(--muted)]">Category</p>
                  <p className="font-semibold text-[var(--foreground)] text-sm">{detailProduct.category || 'N/A'}</p>
                </div>
                <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--input)]">
                  <p className="text-xs text-[var(--muted)]">Supplier</p>
                  <p className="font-semibold text-[var(--foreground)] text-sm truncate" title={detailProduct.supplierName}>{detailProduct.supplierName || 'N/A'}</p>
                </div>
                {detailProduct.gstRate != null && (
                  <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--input)]">
                    <p className="text-xs text-[var(--muted)]">GST Rate</p>
                    <p className="font-semibold text-[var(--foreground)] text-sm">{detailProduct.gstRate}%</p>
                  </div>
                )}
                {detailProduct.minOrderQuantity != null && (
                  <div className="bg-[var(--background)] p-3 rounded-xl border border-[var(--input)]">
                    <p className="text-xs text-[var(--muted)]">Min Order Qty</p>
                    <p className="font-semibold text-[var(--foreground)] text-sm">{detailProduct.minOrderQuantity}</p>
                  </div>
                )}
              </div>

              {(detailProduct.totalRatings > 0) && (
                <div className="flex items-center gap-3 bg-[var(--background)] p-3 rounded-xl border border-[var(--input)]">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-lg text-[var(--foreground)]">{detailProduct.averageRating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span className="text-sm text-[var(--muted)]">({detailProduct.totalRatings} {detailProduct.totalRatings === 1 ? 'rating' : 'ratings'})</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-[var(--background)] border-t border-[var(--input)] flex justify-end gap-3 shrink-0">
              {(!detailProduct.availability || detailProduct.availability === 'ACTIVE') && (
                <button 
                  onClick={() => {
                    const prod = detailProduct;
                    setDetailProduct(null);
                    openRequestModal(prod);
                  }}
                  className="btn-primary"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" /> Request Product
                </button>
              )}
              <button onClick={() => setDetailProduct(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      {requestModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] rounded-2xl shadow-xl max-w-lg w-full border border-[var(--input)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[var(--input)] flex justify-between items-center bg-[var(--secondary)]">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Raise Request</h2>
              <button onClick={() => setRequestModalOpen(false)} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5">
              <div className="mb-5 p-4 bg-[var(--background)] border border-[var(--input)] rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-[var(--foreground)]">{selectedProduct.productName}</h3>
                    <p className="text-sm text-[var(--muted)] mt-0.5 font-mono">SKU: {selectedProduct.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-[var(--primary)]">{formatCurrency(selectedProduct.unitPrice)}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRaiseRequest} className="space-y-4">
                <div>
                  <label className="form-label">Request Title</label>
                  <input
                    type="text"
                    required
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    required
                    rows="2"
                    value={requestDescription}
                    onChange={(e) => setRequestDescription(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Delivery Address</label>
                    <select
                      required
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="form-input"
                    >
                      <option value="OFFICE">Office</option>
                      <option value="HOME">Home</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Quantity</label>
                    <div className="flex items-center gap-0">
                      <button
                        type="button"
                        onClick={decrementQuantity}
                        disabled={typeof requestQuantity !== 'number' || requestQuantity <= 1}
                        className="h-9 w-9 flex items-center justify-center rounded-l-md border border-[var(--input)] bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={requestQuantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className="h-9 w-full border-y border-[var(--input)] bg-[var(--card)] text-center text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={incrementQuantity}
                        disabled={typeof requestQuantity !== 'number' || requestQuantity >= (selectedProduct?.availableQuantity || 0)}
                        className="h-9 w-9 flex items-center justify-center rounded-r-md border border-[var(--input)] bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--secondary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {quantityError && (
                      <p className="text-xs text-[var(--error)] mt-1.5 font-medium">{quantityError}</p>
                    )}
                    <p className="text-xs text-[var(--muted)] mt-1">Available quantity: {selectedProduct.availableQuantity ?? 0}</p>
                  </div>
                </div>

                <div className="pt-4 mt-1 border-t border-[var(--input)]">
                  <div className="flex justify-between font-bold text-lg text-[var(--foreground)] bg-[var(--secondary)] p-3 rounded-xl border border-[var(--input)]">
                    <span>Total Estimated Price</span>
                    <span className="text-[var(--primary)]">{formatCurrency(selectedProduct.unitPrice * (typeof requestQuantity === 'number' ? requestQuantity : 0))}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-1">
                  <button type="button" onClick={() => setRequestModalOpen(false)} className="btn-ghost">Cancel</button>
                  <button type="submit" disabled={requestSubmitting || !isQuantityValid} className="btn-primary">
                    {requestSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
