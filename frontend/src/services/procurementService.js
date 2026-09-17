import { request } from './api';
import api from './api';

export const procurementService = {
  // Expose the api helper for convenience (used by PaymentSettings, Products, etc.)
  api,

  // ----------------------------------------------------
  // Dashboard Metrics
  // ----------------------------------------------------
  async getUserDashboard() {
    return await request('/users/dashboard', { method: 'GET' });
  },

  async getAdminDashboard() {
    return await request('/admin/dashboard', { method: 'GET' });
  },

  async getSpendingAnalytics(period = 'weekly') {
    return await request(`/admin/spending?period=${period}`, { method: 'GET' });
  },

  async getSupplierDashboard() {
    return await request('/supplier/dashboard', { method: 'GET' });
  },

  // ----------------------------------------------------
  // Issues (Requests)
  // ----------------------------------------------------
  /**
   * Get my issues (employee view)
   */
  async getMyRequests() {
    return await request('/issues/my-issues', { method: 'GET' });
  },

  /**
   * Get my orders (employee view)
   */
  async getMyOrders() {
    return await request('/issues/my-orders', { method: 'GET' });
  },

  /**
   * Get specific issue details
   */
  async getIssueById(id) {
    return await request(`/issues/${id}`, { method: 'GET' });
  },

  /**
   * Get all issues (Admin view)
   */
  async getAllRequests() {
    return await request('/issues', { method: 'GET' });
  },

  /**
   * Create a new issue (Raise Request)
   */
  async createRequest(data) {
    return await request('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Review issue status (Approve/Reject)
   */
  async reviewIssue(id, data) {
    return await request(`/issues/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // ----------------------------------------------------
  // Products
  // ----------------------------------------------------
  async getAllProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.supplierId) query.append('supplierId', params.supplierId);
    if (params.sort) query.append('sort', params.sort);
    
    const queryString = query.toString();
    const url = queryString ? `/products?${queryString}` : '/products';
    return await request(url, { method: 'GET' });
  },

  async createProduct(data) {
    return await request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id, data) {
    return await request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // ----------------------------------------------------
  // Categories
  // ----------------------------------------------------
  async getCategories() {
    return await request('/categories', { method: 'GET' });
  },

  async createCategory(data) {
    return await request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id, data) {
    return await request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // ----------------------------------------------------
  // Departments & Users
  // ----------------------------------------------------
  async getDepartments() {
    return await request('/departments', { method: 'GET' });
  },

  async getUsers() {
    return await request('/users', { method: 'GET' });
  },

  async getSuppliers() {
    return await request('/suppliers', { method: 'GET' });
  },

  async createDepartment(data) {
    return await request('/departments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  // ----------------------------------------------------
  // Orders & Payments
  // ----------------------------------------------------
  async createOrder(issueId, productId, quantity, supplierId) {
    let url = `/admin/purchase-orders/${issueId}/create-po?productId=${productId}`;
    if (quantity) url += `&quantity=${quantity}`;
    if (supplierId) url += `&supplierId=${supplierId}`;
    return await request(url, {
      method: 'POST',
    });
  },

  async processPayment(orderId, data) {
    return await request(`/admin/purchase-orders/${orderId}/payment`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ----------------------------------------------------
  // Supplier Orders
  // ----------------------------------------------------
  async getSupplierOrders() {
    return await request('/supplier/orders', { method: 'GET' });
  },

  async updateSupplierOrderDeliveryStatus(orderId, status) {
    return await request(`/supplier/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: status }),
    });
  },

  async submitSupplierRating(supplierId, data) {
    return await request(`/suppliers/${supplierId}/ratings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ----------------------------------------------------
  // Notifications
  // ----------------------------------------------------
  async getNotifications() {
    return await request('/notifications', { method: 'GET' });
  },

  async markAllNotificationsAsRead() {
    return await request('/notifications/read-all', { method: 'PUT' });
  }
};
