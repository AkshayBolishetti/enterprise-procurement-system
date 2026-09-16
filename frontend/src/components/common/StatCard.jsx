import React from 'react';

export const StatCard = ({ title, value, subtitle, trend, trendValue, icon: Icon, color = "primary" }) => {
  return (
    <div className="card">
      <div className="card-content pt-6 flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--secondary-foreground)]">{title}</p>
          <p className="text-3xl font-bold text-[var(--foreground)]">{value}</p>
          
          {(trend || subtitle) && (
            <div className="flex items-center gap-2 mt-2">
              {trend === 'up' && <span className="text-[var(--success)] text-sm font-semibold flex items-center gap-0.5">↑ {trendValue}</span>}
              {trend === 'down' && <span className="text-[var(--error)] text-sm font-semibold flex items-center gap-0.5">↓ {trendValue}</span>}
              {subtitle && <span className="text-[var(--muted)] text-sm">{subtitle}</span>}
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-full bg-[var(--secondary)] flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-[var(--primary)]" />
          </div>
        )}
      </div>
    </div>
  );
};
