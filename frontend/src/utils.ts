import type { ScoreGrade } from './types';

export function getGrade(score: number): ScoreGrade {
  if (score >= 75) return 'excellent';
  if (score >= 55) return 'average';
  return 'poor';
}

export function getScoreColor(score: number): string {
  if (score >= 75) return '#16a34a';
  if (score >= 55) return '#d97706';
  return '#dc2626';
}

export function getZoneFill(score: number, opacity = 0.15): string {
  const color = getScoreColor(score);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

export function getBadgeStyle(score: number): { background: string; color: string } {
  if (score >= 75) return { background: 'var(--green-bg)', color: 'var(--green)' };
  if (score >= 55) return { background: 'var(--amber-bg)', color: 'var(--amber)' };
  return { background: 'var(--red-bg)', color: 'var(--red)' };
}

export function getBarColor(value: number): string {
  if (value >= 75) return '#4ade80';
  if (value >= 55) return '#fbbf24';
  return '#f87171';
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
