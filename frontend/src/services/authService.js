import { request } from './api';

export const authService = {
  /**
   * Register a new user or admin
   */
  async register(data) {
    const payload = {
      employeeId: data.employeeId?.trim(),
      name: data.name?.trim(),
      email: data.email?.trim(),
      password: data.password,
      phoneNumber: data.phoneNumber?.trim() || null,
      designation: data.designation?.trim() || null,
      role: data.role || 'EMPLOYEE',
      departmentId: data.departmentId ? Number(data.departmentId) : null,
    };
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Register a new supplier
   */
  async registerSupplier(data) {
    const payload = {
      supplierId: data.supplierId?.trim(),
      name: data.name?.trim(),
      email: data.email?.trim(),
      password: data.password,
    };
    return await request('/auth/register-supplier', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Login user or admin
   */
  async login(email, password) {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: email?.trim(),
        password,
      }),
    });
  },

  /**
   * Logout authenticated user
   */
  async logout() {
    return await request('/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Get current authenticated user details from session
   */
  async getCurrentUser() {
    return await request('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Fetch list of departments for user registration
   */
  async getDepartments() {
    return await request('/departments', {
      method: 'GET',
    });
  },
};
