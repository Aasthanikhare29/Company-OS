'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, TrendingUp, Wallet, FolderKanban, Users, ChevronRight, CircleCheck, Clock3, Receipt, CalendarDays, ShoppingBag, Headphones, Package, BriefcaseBusiness, CircleDollarSign, CircleHelp, Download } from 'lucide-react';
import { departments, projectRows, type Approval, type Activity, type ModuleId, type Period } from '@/lib/data';
import { compactNumber, formatNumber, getPeriodData } from '@/lib/workspace';
import { Avatar, Change, Metric, PanelHeading, Status } from './ui';

export function RevenueChart({ period }: { period: Period }) {
  const data = getPeriodData(period);
  const [hovered, setHovered] = useState<number | null>(null);
  const [width, setWidth] = useState(700);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(250, entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const ceiling = Math.ceil(Math.max(...data.points.map(point => point.revenue)) / 10000) * 10000;
  const height = 208, pad = 46, top = 18, bottom = 176;
  const x = (i: number) => pad + i * (width - pad - 20) / (data.points.length - 1);
  const y = (value: number) => bottom - value / ceiling * (bottom - top);
  const line = (key: 'revenue' | 'expenses') => data.points.map((point, i, points) => {
    if (i === 0) return `M ${x(i)} ${y(point[key])}`;
    const previous = points[i - 1];
    const mid = (x(i - 1) + x(i)) / 2;
    return `C ${mid} ${y(previous[key])}, ${mid} ${y(point[key])}, ${x(i)} ${y(point[key])}`;
  }).join(' ');
  const index = hovered === null ? data.points.length - 1 : Math.min(hovered, data.points.length - 1);
  const active = data.points[index];

  return <div className="chart-wrap" ref={container}>
    <svg className="revenue-chart" preserveAspectRatio="none" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Revenue ${formatNumber(data.revenue)}, expenses ${formatNumber(data.expenses)} for ${data.label}. Currency-neutral demo figures.`}>
      <defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4c74ed" stopOpacity=".16" /><stop offset="100%" stopColor="#4c74ed" stopOpacity="0" /></linearGradient></defs>
      {[0, .25, .5, .75, 1].map(tick => <g key={tick}><line x1={pad} y1={y(ceiling * tick)} x2={width - 20} y2={y(ceiling * tick)} stroke="#edf0f5" strokeDasharray={tick === 0 ? '0' : '3 5'} /><text x={pad - 13} y={y(ceiling * tick) + 4} textAnchor="end">{compactNumber(ceiling * tick)}</text></g>)}
      <path d={`${line('revenue')} L ${x(data.points.length - 1)} ${bottom} L ${pad} ${bottom} Z`} fill="url(#revenueFill)" />
      <path d={line('expenses')} fill="none" stroke="#a9b7d4" strokeWidth="2.3" strokeDasharray="5 5" />
      <path d={line('revenue')} fill="none" stroke="#456ae4" strokeWidth="2.8" />
      {data.points.map((point, i) => <g key={point.label}>
        {(width >= 480 || i === data.points.length - 1 || (i % Math.ceil(data.points.length / 4) === 0 && i < data.points.length - 2)) && <text x={x(i)} y={height - 6} textAnchor="middle">{point.label}</text>}
        <rect x={x(i) - 20} y={0} width={40} height={bottom} fill="transparent" onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} />
      </g>)}
      <circle cx={x(index)} cy={y(active.revenue)} r="6" fill="#456ae4" stroke="white" strokeWidth="3" />
    </svg>
    {hovered !== null && <div className="chart-tooltip" role="status"><strong>{active.label}</strong><span>Revenue: {formatNumber(active.revenue)}</span><span>Expenses: {formatNumber(active.expenses)}</span></div>}
  </div>;
}

export function Performance({ period, onExport }: { period: Period; onExport: () => void }) {
  const data = getPeriodData(period);
  return <section className="panel performance-panel">
    <div className="panel-heading"><div><h2>Business performance <CircleHelp size={14} className="muted-icon" /></h2><p>Your revenue and expenses, side by side.</p></div><button className="icon-button" onClick={onExport} aria-label="Export performance report"><Download size={17} /></button></div>
    <div className="performance-summary"><div><span className="small-label">Total revenue</span><div className="revenue-total">{formatNumber(data.revenue)} <span className="change"><ArrowUpRight size={13} />{data.change}</span></div></div><div className="chart-legend"><span><i className="legend-dot" />Revenue</span><span><i className="legend-dot expense" />Expenses</span></div></div>
    <RevenueChart period={period} />
    <div className="performance-footer"><div><span className="small-label">Total expenses</span><strong>{formatNumber(data.expenses)}</strong></div><div><span className="small-label">Net profit</span><strong>{formatNumber(data.revenue - data.expenses)}<span className="mini-positive">{((data.revenue - data.expenses) / data.revenue * 100).toFixed(1)}% margin</span></strong></div><span className="reporting-label">{data.label}<br /><span>Demo reporting period</span></span></div>
  </section>;
}

const departmentIcons = { sales: BriefcaseBusiness, finance: CircleDollarSign, people: Users, projects: FolderKanban, support: Headphones, inventory: Package };

export function DepartmentTable({ onNavigate }: { onNavigate: (module: ModuleId) => void }) {
  return <section className="panel department-panel"><PanelHeading title="Across your departments" subtitle="One team. A connected business." action="View reports" onAction={() => onNavigate('reports')} /><div className="table-scroll"><table className="department-table"><thead><tr><th>Department</th><th>Team lead</th><th>Health</th><th>To keep an eye on</th><th><span className="sr-only">Open department</span></th></tr></thead><tbody>{departments.map(d => {
    const Icon = departmentIcons[d.id as keyof typeof departmentIcons];
    return <tr key={d.id}><td><button className="department-name" onClick={() => onNavigate(d.id)}><span className={`department-icon ${d.color}`}><Icon size={17} /></span><span><strong>{d.name}</strong><small>{d.metric} <span>{d.metricLabel}</span></small></span></button></td><td><span className="owner"><Avatar initials={d.initials} color={d.color} small />{d.owner}</span></td><td><Status value={d.status} /></td><td><button className="table-link" onClick={() => onNavigate(d.id)}>{d.action}</button></td><td><button className="icon-button small-button" aria-label={`Open ${d.name}`} onClick={() => onNavigate(d.id)}><ArrowUpRight size={16} /></button></td></tr>;
  })}</tbody></table></div></section>;
}

export function ActivityFeed({ activities, onNavigate, onViewAll }: { activities: Activity[]; onNavigate: (module: ModuleId) => void; onViewAll: () => void }) {
  return <section className="panel activity-panel"><PanelHeading title="Recent activity" action="View all" onAction={onViewAll} /><div className="activity-list">{activities.slice(0, 4).map(activity => <button className="activity-item" key={activity.id} onClick={() => onNavigate(activity.module)}><span className="activity-avatar"><Avatar initials={activity.initials} color={activity.color} small /></span><span className="activity-copy"><strong>{activity.title}</strong><small>{activity.description}</small><time>{activity.time}</time></span></button>)}</div><div className="activity-footer"><span className="live-dot" />Your teams, moving things forward.</div></section>;
}

export function ProjectsPanel({ onNavigate }: { onNavigate: (module: ModuleId) => void }) {
  return <section className="panel projects-panel"><PanelHeading title="Projects in focus" subtitle="The work moving your business forward." action="All projects" onAction={() => onNavigate('projects')} /><div className="project-list">{projectRows.map(project => <button className="project-row" key={project.name} onClick={() => onNavigate('projects')}><span className={`project-mark ${project.color}`}><FolderKanban size={19} /></span><span className="project-name"><strong>{project.name}</strong><small>{project.team}</small></span><span className="project-progress"><span>{project.progress}%</span><span className="progress-track"><i style={{ width: `${project.progress}%` }} /></span></span><span className="avatar-stack">{project.initials.map((initials, i) => <Avatar initials={initials} color={['blue', 'violet', 'orange'][i]} key={initials} small />)}</span><span className="project-due">{project.due}</span><ArrowUpRight size={16} /></button>)}</div></section>;
}

export function Attention({ approvals, onApproval, onViewAll, onNavigate }: { approvals: Approval[]; onApproval: (approval: Approval) => void; onViewAll: () => void; onNavigate: (module: ModuleId) => void }) {
  const pending = approvals.filter(a => a.status === 'pending');
  return <section className="panel attention-panel"><div className="panel-heading"><h2>Needs your attention <span className="count-badge">{pending.length + 2}</span></h2><span className="attention-dot" /></div><p className="attention-description">A few things could use your decision.</p>
    <div className="attention-list">{pending.slice(0, 2).map(approval => <button className="attention-item" key={approval.id} onClick={() => onApproval(approval)}><span className={`attention-icon ${approval.type === 'Leave' ? 'violet' : 'orange'}`}>{approval.type === 'Leave' ? <CalendarDays size={17} /> : <ShoppingBag size={17} />}</span><span><strong>{approval.title}</strong><small>{approval.owner} <span>·</span> {approval.amount}</small></span><ChevronRight size={16} /></button>)}
      {pending.length === 0 && <div className="queue-clear"><CircleCheck size={20} /><span>All approvals are up to date.</span></div>}
      <button className="attention-item" onClick={() => onNavigate('finance')}><span className="attention-icon pink"><Receipt size={17} /></span><span><strong>3 invoices are overdue</strong><small><span className="text-warning">Action needed</span> <span>·</span> Finance</small></span><ChevronRight size={16} /></button>
      <button className="attention-item" onClick={() => onNavigate('support')}><span className="attention-icon blue"><Headphones size={17} /></span><span><strong>2 tickets need a closer look</strong><small>Escalated <span>·</span> Support</small></span><ChevronRight size={16} /></button>
    </div><button className="panel-bottom-action" onClick={onViewAll}>Review approvals <span>{pending.length} pending<ArrowRight size={15} /></span></button>
  </section>;
}

export function Overview({ period, approvals, activities, onNavigate, onApproval, onViewApprovals, onViewActivity, onExport }: { period: Period; approvals: Approval[]; activities: Activity[]; onNavigate: (module: ModuleId) => void; onApproval: (approval: Approval) => void; onViewApprovals: () => void; onViewActivity: () => void; onExport: () => void }) {
  const data = getPeriodData(period);
  return <>
    <div className="metric-grid">
      <Metric title="Total revenue" value={formatNumber(data.revenue)} icon={<Wallet size={18} />} change={data.change} comparison={data.comparison} />
      <Metric title="Sales pipeline" value={compactNumber(data.pipeline)} icon={<TrendingUp size={18} />} change="+8.2%" comparison={data.comparison} />
      <Metric title="Active projects" value={data.projects} icon={<FolderKanban size={18} />} change="+4" comparison={data.comparison}><span className="metric-detail">projects</span></Metric>
      <Metric title="Team attendance" value="92" icon={<Users size={18} />} change="93.9%" comparison="of the team today"><span className="metric-detail">/ 98</span></Metric>
    </div>
    <div className="dashboard-grid"><Performance period={period} onExport={onExport} /><Attention approvals={approvals} onApproval={onApproval} onViewAll={onViewApprovals} onNavigate={onNavigate} /><DepartmentTable onNavigate={onNavigate} /><ActivityFeed activities={activities} onNavigate={onNavigate} onViewAll={onViewActivity} /><ProjectsPanel onNavigate={onNavigate} /><section className="workspace-note"><span className="note-art"><span /><span /><span /><span /></span><div><h2>One workspace. Every team.</h2><p>Your people, projects, and operations work better together.</p><button className="text-button" onClick={() => onNavigate('reports')}>Explore company reports<ArrowUpRight size={15} /></button></div></section></div>
  </>;
}
