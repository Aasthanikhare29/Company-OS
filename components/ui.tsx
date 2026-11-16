import type { ReactNode } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';

export function Avatar({ initials, color = 'blue', small = false }: { initials: string; color?: string; small?: boolean }) {
  return <span className={`avatar ${color} ${small ? 'small' : ''}`}>{initials}</span>;
}

export function Status({ value }: { value: string }) {
  const warning = /risk|attention|overdue|escalated|low stock|out of stock|lost|void|urgent|high/i.test(value);
  const neutral = /pending|proposal|discovery|negotiation|onboarding|progress|qualified|draft|sent|open|waiting|planning|hold/i.test(value);
  return <span className={`status ${warning ? 'warning' : neutral ? 'neutral' : 'positive'}`}><span />{value}</span>;
}

export function Change({ value, label }: { value: string; label: string }) {
  const down = value.startsWith('-');
  return <span className="change-line"><span className={`change ${down ? 'negative' : ''}`}>{down ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{value}</span><span>{label}</span></span>;
}

export function PanelHeading({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return <div className="panel-heading"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action && <button className="text-button" onClick={onAction}>{action}<ChevronRight size={15} /></button>}</div>;
}

export function Metric({ title, value, icon, change, comparison, children }: { title: string; value: ReactNode; icon: ReactNode; change?: string; comparison: string; children?: ReactNode }) {
  return <div className="metric"><div className="metric-label"><span>{title}</span><span className="metric-icon">{icon}</span></div><div className="metric-value">{value}{children}</div>{change ? <Change value={change} label={comparison} /> : <span className="metric-context">{comparison}</span>}</div>;
}
