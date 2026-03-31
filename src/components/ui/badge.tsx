import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export default function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-secondary/15 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-secondary-foreground border border-secondary/20',
        className,
      )}
    >
      {children}
    </span>
  );
}
