import { formatEventDateRange } from '@/utils/date';
import { Card } from '@/components/ui/card';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  endDate: string | null;
  time: string | null;
  description: string;
  registrationUrl: string | null;
}

export default function EventCard({ title, date, endDate, time, description, registrationUrl }: EventCardProps) {
  const dateDisplay = formatEventDateRange(date, endDate);

  return (
    <Card className="overflow-hidden border-slate-200 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="space-y-2 p-5">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-secondary">
          {dateDisplay}
        </p>
        {time && (
          <p className="text-xs font-semibold text-slate-400">{time}</p>
        )}
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
        {registrationUrl && (
          <a
            href={registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full bg-secondary px-4 py-1.5 text-xs font-bold text-secondary-foreground transition hover:bg-secondary/90"
          >
            Înregistrare
          </a>
        )}
      </div>
    </Card>
  );
}
