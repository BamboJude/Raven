import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">{title}</h1>
        {description && <p className="text-base text-gray-600 max-w-3xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center space-x-3 ml-6">{actions}</div>}
    </div>
  );
}
