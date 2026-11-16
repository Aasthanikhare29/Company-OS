import { records } from './data.ts';
import type { Approval, Period } from './data.ts';

export function searchRecords(query: string) {
  const term = query.trim().toLowerCase();
  return term ? records.filter(record => `${record.title} ${record.description}`.toLowerCase().includes(term)) : [];
}

export function decideApproval(items: Approval[], id: string, decision: 'approved' | 'declined'): Approval[] {
  return items.map(item => item.id === id && item.status === 'pending' ? { ...item, status: decision } : item);
}

export function validateTask(title: string): string | null {
  if (!title.trim()) return 'Enter a task title.';
  if (title.trim().length > 120) return 'Keep the title under 121 characters.';
  return null;
}

export function getPeriodData(period: Period) {
  const config = {
    month: { labels: ['01 Nov', '03 Nov', '05 Nov', '07 Nov', '09 Nov', '11 Nov', '13 Nov', '16 Nov'], revenue: [18000, 25500, 23000, 35000, 29500, 41000, 35500, 41000], expenses: [14500, 19000, 16500, 24500, 21000, 27800, 24500, 25000], label: 'November 2026', comparison: 'vs. October', change: '+12.8%', pipeline: 428500, projects: 24 },
    quarter: { labels: ['01 Oct', '08 Oct', '16 Oct', '24 Oct', '01 Nov', '08 Nov', '16 Nov', '24 Nov'], revenue: [65000, 78000, 72000, 96000, 84000, 110000, 98000, 125000], expenses: [48000, 53000, 49000, 64000, 58000, 76000, 68000, 81000], label: 'Q4 2026', comparison: 'vs. Q3', change: '+18.4%', pipeline: 1248000, projects: 42 },
    year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], revenue: [155000, 172000, 164000, 198000, 221000, 205000, 234000, 218000, 241000, 220300, 248500, 270000], expenses: [110000, 118000, 112000, 132000, 147000, 142000, 159000, 151000, 164000, 168000, 172800, 185000], label: '2026', comparison: 'vs. 2025', change: '+24.6%', pipeline: 4820000, projects: 86 },
  }[period];
  const points = config.labels.map((label, i) => ({ label, revenue: config.revenue[i], expenses: config.expenses[i] }));
  return { ...config, points, revenue: config.revenue.reduce((a, b) => a + b, 0), expenses: config.expenses.reduce((a, b) => a + b, 0) };
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
