import React from 'react';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getPriorityStyles = () => {
    switch (priority) {
      case Priority.LOW:
        return 'bg-gray-100 text-gray-700';
      case Priority.MEDIUM:
        return 'bg-blue-100 text-blue-700';
      case Priority.HIGH:
        return 'bg-orange-100 text-orange-700';
      case Priority.URGENT:
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityStyles()}`}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

export default PriorityBadge;
