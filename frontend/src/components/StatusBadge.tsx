import React from 'react';
import { ComplaintStatus } from '../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case ComplaintStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case ComplaintStatus.ASSIGNED:
        return 'bg-blue-100 text-blue-800';
      case ComplaintStatus.IN_PROGRESS:
        return 'bg-purple-100 text-purple-800';
      case ComplaintStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case ComplaintStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case ComplaintStatus.IN_PROGRESS:
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}
    >
      {getStatusLabel()}
    </span>
  );
};

export default StatusBadge;
