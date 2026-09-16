import React, { useState, useEffect } from 'react';
import { Clock, Search } from 'lucide-react';
import { procurementService } from '../../services/procurementService';
import api from '../../services/api';

export const RequestBoard = ({ scope, onCardClick }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let data = [];
      if (scope === 'employee') {
        const res = await procurementService.getMyRequests();
        const resData = res?.data?.content || res?.data || res || [];
        data = Array.isArray(resData) ? resData : [];
      } else if (scope === 'admin') {
        const res = await procurementService.getAllRequests();
        const resData = res?.data?.content || res?.data || res || [];
        data = Array.isArray(resData) ? resData : [];
      } else if (scope === 'supplier') {
        const res = await procurementService.getSupplierOrders();
        const resData = res?.data?.content || res?.data || res || [];
        data = Array.isArray(resData) ? resData : [];
      }
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests for board:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [scope]);

  const filteredRequests = requests.filter(req => 
    req.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.issueNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { id: 'PENDING', title: 'Pending', color: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    { id: 'APPROVED', title: 'Approved', color: 'border-blue-200 dark:border-blue-800', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { id: 'REJECTED', title: 'Rejected', color: 'border-red-200 dark:border-red-800', bg: 'bg-red-50 dark:bg-red-950/20' },
    { id: 'COMPLETED', title: 'Completed', color: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950/20' }
  ];

  const mapStatusToColumn = (status) => {
    if (!status) return 'PENDING';
    const s = status.toUpperCase();
    if (['PENDING', 'OPEN'].includes(s)) return 'PENDING';
    if (['APPROVED', 'PAYMENT_PENDING'].includes(s)) return 'APPROVED';
    if (['REJECTED'].includes(s)) return 'REJECTED';
    if (['COMPLETED', 'DELIVERED'].includes(s)) return 'COMPLETED';
    
    if (['PAID', 'SHIPPED', 'PACKED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(s)) return 'APPROVED';
    
    return 'PENDING';
  };

  const grouped = { PENDING: [], APPROVED: [], REJECTED: [], COMPLETED: [] };
  filteredRequests.forEach(req => {
    const col = mapStatusToColumn(req.status);
    if (grouped[col]) grouped[col].push(req);
  });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 w-full overflow-hidden">
      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Requests Board</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by ID or Title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 text-sm dark:text-white"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map(col => (
            <div key={col.id} className={`w-80 flex flex-col rounded-xl border ${col.color} ${col.bg} overflow-hidden h-full`}>
              <div className="p-4 border-b border-inherit bg-white/50 dark:bg-black/20 flex justify-between items-center shrink-0">
                <h3 className="font-semibold text-slate-900 dark:text-white">{col.title}</h3>
                <span className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                  {grouped[col.id].length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {loading && requests.length === 0 ? (
                  <div className="text-center p-4 text-sm text-slate-500">Loading...</div>
                ) : grouped[col.id].length === 0 ? (
                  <div className="text-center p-8 text-sm text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl m-2">
                    No requests
                  </div>
                ) : (
                  grouped[col.id].map(req => (
                    <div 
                      key={req.id}
                      onClick={() => onCardClick(req)}
                      className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {req.issueNumber || req.orderNumber || `#${req.id}`}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {req.status}
                        </span>
                      </div>
                      <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {req.title || (req.requester ? `Request from ${req.requester.name}` : 'Procurement Request')}
                      </h4>
                      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                        {req.totalAmount > 0 && (
                          <span className="font-semibold text-slate-900 dark:text-white">
                            ${req.totalAmount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
