import { cn } from '@/lib/utils';
import { Verse } from '@/utils/verse';

interface VerseOfTheDayProps {
  verse: Verse;
  variant?: 'light' | 'dark';
  className?: string;
}

export default function VerseOfTheDay({ verse, variant = 'light', className }: VerseOfTheDayProps) {
  if (variant === 'dark') {
    return (
      <div className={cn('relative text-left', className)}>
        {/* Linie verticală amber */}
        <div className="absolute left-0 top-0 h-full w-[3px] rounded-full bg-secondary/60" />
        <div className="pl-6">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary/70 mb-5">
            Versetul zilei
          </p>
          <p className="text-2xl font-light leading-10 text-slate-100 italic">
            "{verse.text}"
          </p>
          <cite className="mt-5 block text-base font-semibold not-italic text-slate-400">
            — {verse.reference}
          </cite>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm', className)}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary-foreground/60 mb-4">
        Versetul zilei
      </p>
      <p className="text-base leading-8 italic text-slate-700">
        "{verse.text}"
      </p>
      <cite className="mt-4 block text-xs font-bold not-italic text-secondary-foreground/60">
        — {verse.reference}
      </cite>
    </div>
  );
}
