export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseISODate(iso: string, endOfDay = false): Date {
  const datePart = iso.slice(0, 10);
  return new Date(`${datePart}T${endOfDay ? '23:59:59.999' : '00:00:00'}`);
}

export function formatDate(iso: string): string {
  const date = parseISODate(iso);
  return date.toLocaleDateString('pt-BR');
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest}min`;
  }
  return rest === 0 ? `${hours}h` : `${hours}h${rest}`;
}

export function encodeTimeSpent(date: string, minutes: number): string {
  return `${date}T${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:00`;
}

export function decodeTimeSpent(timeSpent: string): number {
  const date = new Date(timeSpent);
  if (Number.isNaN(date.getTime())) {
    return 0;
  }
  return date.getHours() * 60 + date.getMinutes();
}

export function daysUntil(iso: string): number {
  const deadline = parseISODate(iso, true);
  if (Number.isNaN(deadline.getTime())) {
    return 0;
  }
  const now = new Date();
  return Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000);
}
