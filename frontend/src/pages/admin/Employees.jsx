import React, { useState, useEffect } from 'react';
import { procurementService } from '../../services/procurementService';
import { Table } from '../../components/common/Table';
import { Input } from '../../components/common/Input';
import { Search, UserCircle, Briefcase } from 'lucide-react';

export const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await procurementService.getUsers();
      setEmployees(res.data || res);
    } catch (err) {
      console.error('Error fetching employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(e => 
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Emp ID', accessor: 'employeeId' },
    { header: 'Employee', accessor: 'name', cell: (row) => (
      <div className="flex items-center">
        <UserCircle className="h-5 w-5 mr-3 text-slate-400" />
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{row.name}</div>
          <div className="text-xs text-slate-500">{row.email}</div>
        </div>
      </div>
    )},
    { header: 'Role', accessor: 'role', cell: (row) => (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        row.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
        row.role === 'SUPPLIER' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      }`}>
        {row.role}
      </span>
    )},
    { header: 'Department', accessor: 'department', cell: (row) => (
      row.departmentName ? (
        <div className="flex items-center text-sm">
          <Briefcase className="h-4 w-4 mr-2 text-slate-400" />
          {row.departmentName}
        </div>
      ) : (
        <span className="text-slate-400 italic text-sm">N/A</span>
      )
    )},
    { header: 'Designation', accessor: 'designation', cell: (row) => (
      row.designation || '-'
    )},
    { header: 'Status', accessor: 'status', cell: (row) => (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
        Active
      </span>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Employees</h1>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input 
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Table 
          columns={columns} 
          data={filteredEmployees} 
          isLoading={loading} 
          emptyMessage="No employees found."
        />
      </div>
    </div>
  );
};
