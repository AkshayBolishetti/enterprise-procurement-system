import React, { useState, useEffect } from 'react';
import { procurementService } from '../../services/procurementService';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Plus, Search, Building2 } from 'lucide-react';
import api from '../../services/api';

export const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await procurementService.getDepartments();
      setDepartments(res.data || res);
    } catch (err) {
      console.error('Error fetching departments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await api.post('/departments', {
        departmentName: formData.name, // Ensure payload uses departmentName as per DTO
        description: formData.description
      });
      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      fetchDepartments();
    } catch (err) {
      setError(err.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDepartments = departments.filter(d => 
    (d.departmentName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'ID', accessor: 'id' },
    { header: 'Department Name', accessor: 'departmentName', cell: (row) => (
      <div className="flex items-center">
        <Building2 className="h-4 w-4 mr-2 text-slate-400" />
        <span className="font-medium text-slate-900 dark:text-white">{row.departmentName}</span>
      </div>
    )},
    { header: 'Description', accessor: 'description' },
    { header: 'Admin', accessor: 'admin', cell: (row) => (
      row.adminName ? (
        <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
          {row.adminName}
        </span>
      ) : (
        <span className="text-slate-400 italic text-xs">Unassigned</span>
      )
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Departments</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input 
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Table 
          columns={columns} 
          data={filteredDepartments} 
          isLoading={loading} 
          emptyMessage="No departments found."
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Department"
      >
        <form id="create-dept-form" onSubmit={handleCreateDepartment} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}
          <Input 
            label="Department Name" 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. IT Operations"
          />
          <Input 
            label="Description" 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Maintains internal IT infrastructure"
          />
        </form>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-4">
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button type="submit" form="create-dept-form" isLoading={isSubmitting}>
            Create Department
          </Button>
        </div>
      </Modal>
    </div>
  );
};
