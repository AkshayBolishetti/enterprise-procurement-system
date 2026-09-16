import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { procurementService } from '../../services/procurementService';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const formatYAxis = (value) => {
  if (value === 0) return '₹0';
  if (value >= 100000) return `₹${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
        <p className="text-slate-400 text-sm mb-1">{label}</p>
        <p className="font-semibold flex items-center gap-1">
          <span className="text-slate-300 font-normal">Spending:</span>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const SpendingChart = () => {
  const [period, setPeriod] = useState('weekly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await procurementService.getSpendingAnalytics(period);
        if (isMounted) {
          setData(res.data || res);
        }
      } catch (err) {
        console.error('Error fetching spending analytics', err);
        if (isMounted) {
          setError('Failed to load spending data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchAnalytics();
    return () => { isMounted = false; };
  }, [period]);

  const isEmpty = data?.transactionCount === 0;

  return (
    <div className="card mt-6">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Budget & Spending Overview</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Actual spending based on successful payments
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
            {['Weekly', 'Monthly', 'Yearly'].map((p) => {
              const value = p.toLowerCase();
              return (
                <button
                  key={value}
                  onClick={() => setPeriod(value)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                    period === value
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="h-[350px] flex items-center justify-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Spending</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(data?.totalSpending)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Transactions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {data?.transactionCount || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Spend</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(data?.averageSpending)}
                </p>
              </div>
            </div>

            <div className="h-[350px] w-full relative">
              {isEmpty && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-300 text-sm font-medium">
                    No successful payments found for this period
                  </div>
                </div>
              )}
              
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                    minTickGap={20}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={formatYAxis}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '5 5' }} />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                    activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SpendingChart;
