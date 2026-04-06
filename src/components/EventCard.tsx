import { formatEventDateRange } from '@/utils/date';
import { Card } from '@/components/ui/card';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  endDate: string | null;
  time: string | null;
  description: string;
  isLive?: boolean;
  isToday?: boolean;
}

export default function EventCard({ title, date, endDate, time, description, isLive, isToday }: EventCardProps) {
  const dateDisplay = formatEventDateRange(date, endDate);

  return (
    <Card className={`overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg ${isToday ? 'border-secondary/40 bg-secondary/10 shadow-md shadow-secondary/15' : 'border-slate-100 bg-slate-50'}`}>
      <div className="space-y-2 p-5">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-secondary">
          {dateDisplay}
        </p>
        {time && (
          <p className="text-xs font-semibold text-slate-400">{time}</p>
        )}
        {isLive && (
          <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            live
          </p>
        )}
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </Card>
  );
}
