import {
  daysUntil,
  decodeTimeSpent,
  encodeTimeSpent,
  formatDuration,
  toISODate,
} from './date.util';

describe('date.util', () => {
  describe('toISODate', () => {
    it('should format a date as yyyy-MM-dd', () => {
      expect(toISODate(new Date(2026, 0, 7))).toBe('2026-01-07');
    });
  });

  describe('formatDuration', () => {
    it('should format minutes only', () => {
      expect(formatDuration(30)).toBe('30min');
    });

    it('should format full hours', () => {
      expect(formatDuration(120)).toBe('2h');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h30');
    });
  });

  describe('encodeTimeSpent', () => {
    it('should encode minutes as a datetime in 30-min increments', () => {
      expect(encodeTimeSpent('2026-08-07', 90)).toBe('2026-08-07T01:30:00');
    });
  });

  describe('decodeTimeSpent', () => {
    it('should decode the datetime back into minutes', () => {
      expect(decodeTimeSpent('2026-08-07T01:30:00')).toBe(90);
    });
  });

  describe('daysUntil', () => {
    it('should return a positive number for a future date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      const iso = future.toISOString().slice(0, 10);
      expect(daysUntil(iso)).toBeGreaterThanOrEqual(5);
    });

    it('should accept the backend LocalDateTime deadline format', () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      const deadline = `${future.toISOString().slice(0, 10)}T12:30:00`;
      expect(daysUntil(deadline)).toBeGreaterThanOrEqual(5);
    });

    it('should return a negative number for a past date', () => {
      const past = new Date();
      past.setDate(past.getDate() - 3);
      const iso = past.toISOString().slice(0, 10);
      expect(daysUntil(iso)).toBeLessThan(0);
    });
  });
});
