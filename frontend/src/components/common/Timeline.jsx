import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

export const Timeline = ({ steps }) => {
  if (!steps || steps.length === 0) {
    return <p className="text-slate-500 text-sm">No timeline available.</p>;
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        
        let Icon = Clock;
        let iconColor = 'text-amber-500';
        let bgColor = 'bg-amber-100';

        if (step.status === 'APPROVED' || step.status === 'CLOSED') {
          Icon = CheckCircle2;
          iconColor = 'text-emerald-500';
          bgColor = 'bg-emerald-100';
        } else if (step.status === 'REJECTED') {
          Icon = XCircle;
          iconColor = 'text-red-500';
          bgColor = 'bg-red-100';
        }

        return (
          <div key={step.id || index} className="relative flex gap-4">
            {!isLast && (
              <div className="absolute left-4 top-8 bottom-[-16px] w-0.5 bg-slate-200" />
            )}
            
            <div className={`relative z-10 w-8 h-8 rounded-full ${bgColor} flex items-center justify-center shrink-0 shadow-sm border border-white ring-4 ring-white`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>

            <div className="flex-1 pb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {step.status} {step.approvalRole ? `by ${step.approvalRole}` : ''}
                  </h4>
                  {step.approverName && (
                    <p className="text-xs text-slate-500 font-medium">By: {step.approverName}</p>
                  )}
                </div>
                {step.timestamp && (
                  <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                    {new Date(step.timestamp).toLocaleString()}
                  </span>
                )}
              </div>
              
              {step.remarks && (
                <div className="mt-2 text-sm text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg shadow-2xs">
                  {step.remarks}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
