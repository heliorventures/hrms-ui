export const formatWorkDuration = (startValue: string, endValue?: string | null): string => {
  const start = new Date(`${startValue.slice(0, 10)}T00:00:00`);
  const end = endValue ? new Date(`${endValue.slice(0, 10)}T00:00:00`) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return '—';
  let months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
  if (end.getDate() < start.getDate()) months -= 1;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} ${remainingMonths === 1 ? 'mo' : 'mos'}`;
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'yr' : 'yrs'}`;
  return `${years} ${years === 1 ? 'yr' : 'yrs'} ${remainingMonths} ${remainingMonths === 1 ? 'mo' : 'mos'}`;
};
