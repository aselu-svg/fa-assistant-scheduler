export function toISODate(date: Date) { const d = new Date(date); d.setHours(0,0,0,0); return d.toISOString() }
export function addMinutes(date: Date, minutes: number) { return new Date(date.getTime() + minutes * 60000) }
export function rangeTimes(start: Date, end: Date, stepMinutes: number) {
  const slots: Date[] = []; let cursor = new Date(start);
  while (cursor <= end) { slots.push(new Date(cursor)); cursor = addMinutes(cursor, stepMinutes) }
  return slots
}
export function formatLocal(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}
