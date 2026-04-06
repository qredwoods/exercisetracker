import { describe, expect, it, vi, afterEach } from 'vitest';
import { computePRs, getAdaptiveCount, getCountVariants, getGreeting } from './pr';

afterEach(() => {
  vi.useRealTimers();
});

function withMockedToday(isoDate, fn) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${isoDate}T12:00:00`));
  return fn();
}

describe('pr utils', () => {
  it('computes current and historic PRs and latest PR', () => {
    const exercises = [
      { _id: 'a1', name: 'Bench Press', weight: 135, reps: 8, unit: 'lbs', date: '2026-03-01' },
      { _id: 'a2', name: 'Bench Press', weight: 155, reps: 6, unit: 'lbs', date: '2026-03-20' },
      { _id: 'a3', name: 'Bench Press', weight: 155, reps: 5, unit: 'lbs', date: '2026-04-02' },
      { _id: 'b1', name: 'Pull-ups', weight: 0, reps: 10, unit: 'bodyweight', date: '2026-03-10' },
      { _id: 'b2', name: 'Pull-ups', weight: 0, reps: 12, unit: 'bodyweight', date: '2026-04-01' },
    ];

    const result = computePRs(exercises);

    expect(result.historicPRs.has('a1')).toBe(true);
    expect(result.historicPRs.has('a2')).toBe(true);
    expect(result.historicPRs.has('b1')).toBe(true);
    expect(result.historicPRs.has('b2')).toBe(true);
    expect(result.currentPRs.has('a3')).toBe(true);
    expect(result.currentPRs.has('b2')).toBe(true);
    expect(result.latestPR?.exercise._id).toBe('a3');
  });

  it('returns non-zero count variants in increasing window order', () => {
    withMockedToday('2026-04-06', () => {
      const exercises = [
        { date: '2026-04-06' },
        { date: '2026-04-04' },
        { date: '2026-03-20' },
      ];

      expect(getCountVariants(exercises)).toEqual([
        { key: '24-hours', count: 1, title: 'Exercises', periodLabel: 'last 24 hours' },
        { key: '7-days', count: 2, title: 'Exercises', periodLabel: 'last 7 days' },
        { key: '30-days', count: 3, title: 'Exercises', periodLabel: 'last 30 days' },
        { key: 'all-time', count: 3, title: 'Exercises', periodLabel: 'all time' },
      ]);
    });
  });

  it('prefers the shortest period with at least two exercises', () => {
    withMockedToday('2026-04-06', () => {
      const exercises = [
        { date: '2026-04-06' },
        { date: '2026-04-04' },
        { date: '2026-03-12' },
      ];

      expect(getAdaptiveCount(exercises)).toEqual({
        key: '7-days',
        count: 2,
        title: 'Exercises',
        periodLabel: 'last 7 days',
      });
    });
  });

  it('falls back to all time when no shorter period has two exercises', () => {
    withMockedToday('2026-04-06', () => {
      const exercises = [{ date: '2026-01-01' }];

      expect(getAdaptiveCount(exercises)).toEqual({
        key: 'all-time',
        count: 1,
        title: 'Exercises',
        periodLabel: 'all time',
      });
    });
  });

  it('returns greeting based on recency', () => {
    withMockedToday('2026-04-06', () => {
      expect(getGreeting([{ date: '2026-04-06' }])).toBe('On a roll.');
      expect(getGreeting([{ date: '2026-04-05' }])).toBe('Right where you left off.');
      expect(getGreeting([{ date: '2026-04-02' }])).toBe('Good to see you.');
      expect(getGreeting([{ date: '2026-03-20' }])).toBe('Welcome back.');
      expect(getGreeting([{ date: '2026-01-15' }, { date: '2026-01-15' }])).toMatch(/Still here/);
    });
  });
});
