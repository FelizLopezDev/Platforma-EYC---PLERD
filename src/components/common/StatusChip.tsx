import React from 'react';
import { ReportStatus, STATUS_LABELS } from '../../types';

interface StatusChipProps {
  status: ReportStatus;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const getStyles = () => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-[#fdf4e0]',
          text: 'text-[#97650b]',
          border: 'border-[#f0d9a3]',
          dot: 'bg-[#97650b]',
        };
      case 'submitted_to_undersecretary':
        return {
          bg: 'bg-[#eff7fd]',
          text: 'text-[#0f68a4]',
          border: 'border-[#b0dbf5]',
          dot: 'bg-[#0f68a4]',
        };
      case 'forwarded_to_secretary_general':
        return {
          bg: 'bg-[#e6f7ef]',
          text: 'text-[#0e7a52]',
          border: 'border-[#b6e4ce]',
          dot: 'bg-[#0e7a52]',
        };
      case 'reviewed':
        return {
          bg: 'bg-[#f1f5f9]',
          text: 'text-[#0c1f33]',
          border: 'border-[#cbd5e1]',
          dot: 'bg-[#0c1f33]',
        };
    }
  };

  const style = getStyles();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-[13px]';

  return (
    <span
      id={`status-chip-${status}`}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border whitespace-nowrap tabular-nums ${style.bg} ${style.text} ${style.border} ${padding} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
};
