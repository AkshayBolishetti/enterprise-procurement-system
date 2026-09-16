import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  
  const s = status.toUpperCase();
  let badgeClass = "badge-neutral";
  
  // Requests
  if (['PENDING', 'OPEN'].includes(s)) badgeClass = "badge-warning";
  else if (['APPROVED', 'PROCESSING'].includes(s)) badgeClass = "badge-primary"; // Changed to primary (purple) for APPROVED per some enterprise standards, or success. Let's use primary for active states.
  else if (['REJECTED', 'FAILED', 'CANCELLED'].includes(s)) badgeClass = "badge-error";
  else if (['COMPLETED', 'SUCCESS', 'DELIVERED', 'PAID'].includes(s)) badgeClass = "badge-success";
  
  // Orders
  else if (['SHIPPING', 'SHIPPED', 'IN_TRANSIT'].includes(s)) badgeClass = "badge-primary";
  else if (['OUT_FOR_DELIVERY'].includes(s)) badgeClass = "badge-warning";

  return (
    <span className={`badge ${badgeClass} uppercase tracking-wider`}>
      {s.replace(/_/g, ' ')}
    </span>
  );
};
