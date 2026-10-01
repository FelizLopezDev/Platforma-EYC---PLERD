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
          bg: 'bg-[#f0f7fb]',
          text: 'text-[#005580]',
          border: 'border-[#bde0f2]',
          dot: 'bg-[#0099CC]',
        };
      case 'submitted_to_undersecretary':
        return {
          bg: 'bg-[#e6f3f9]',
          text: 'text-[#006699]',
          border: 'border-[#b0dbf5]',
          dot: 'bg-[#006699]',
        };
      case 'forwarded_to_secretary_general':
        return {
          bg: 'bg-[#e6f8f8]',
          text: 'text-[#008080]',
          border: 'border-[#b2e5e5]',
          dot: 'bg-[#00B2B2]',
        };
      case 'reviewed':
        return {
          bg: 'bg-[#e8f7f1]',
          text: 'text-[#0e835c]',
          border: 'border-[#b8e6d5]',
          dot: 'bg-[#0e835c]',
        };
    }
  };

  const style = getStyles();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      id={`status-chip-${status}`}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border whitespace-nowrap tabular-nums ${style.bg} ${style.text} ${style.border} ${padding} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
};
