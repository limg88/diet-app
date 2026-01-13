const ROME_TZ = 'Europe/Rome';

type DateParts = {
  year: number;
  month: number;
  day: number;
};

function getRomeDateParts(date: Date): DateParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: ROME_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const values: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  }
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function toUtcDateFromParts(parts: DateParts) {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
}

export function getCurrentRomeDate(): Date {
  return toUtcDateFromParts(getRomeDateParts(new Date()));
}

export function getIsoWeekStart(date: Date): Date {
  const utcDay = date.getUTCDay();
  const isoDay = utcDay === 0 ? 7 : utcDay;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - (isoDay - 1));
  return monday;
}

export function formatDateToIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}
