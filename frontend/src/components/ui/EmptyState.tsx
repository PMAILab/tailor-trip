import type { ReactNode } from 'react';
import Icon from '../Icon';

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <Icon name={icon} className="mb-4 text-4xl text-on-surface-variant" />
      <h3 className="mb-2 font-display text-headline-sm text-primary">{title}</h3>
      {description && <p className="mb-6 max-w-sm text-body-md text-on-surface-variant">{description}</p>}
      {action}
    </div>
  );
}
