import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const statusConfig: Record<
  StatusType,
  { color: string; bgColor: string; defaultLabel: string }
> = {
  active: {
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    defaultLabel: 'Active',
  },
  inactive: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200',
    defaultLabel: 'Inactive',
  },
  pending: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    defaultLabel: 'Pending',
  },
  completed: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    defaultLabel: 'Completed',
  },
  cancelled: {
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    defaultLabel: 'Cancelled',
  },
  success: {
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    defaultLabel: 'Success',
  },
  error: {
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    defaultLabel: 'Error',
  },
  warning: {
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    defaultLabel: 'Warning',
  },
  info: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    defaultLabel: 'Info',
  },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        config.color,
        config.bgColor,
        className
      )}
    >
      {label || config.defaultLabel}
    </Badge>
  );
}
