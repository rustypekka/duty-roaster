
export const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { weekday: 'long' });
};

export const isSameDate = (d1: string, d2: string): boolean => {
  return d1.split('T')[0] === d2.split('T')[0];
};

export const getNextDays = (numDays: number): string[] => {
  const days: string[] = [];
  const start = new Date();
  for (let i = 0; i < numDays; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

export const isWithinRange = (date: string, start: string, end: string): boolean => {
  const d = new Date(date).getTime();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return d >= s && d <= e;
};
