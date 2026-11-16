'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Activity as ActivityIcon, ArrowDownToLine, ArrowRight, ArrowUpRight, Bell, BriefcaseBusiness, CalendarDays, Check, CheckCheck, ChevronDown, ChevronRight, CircleDollarSign, Command, FileText, FolderKanban, Grid2X2, Headphones, HelpCircle, LayoutDashboard, Menu, Package, Plus, Search, Settings, ShieldCheck, Sparkles, Users, X } from 'lucide-react';
import { initialApprovals, initialActivity, departments, moduleNames, type Activity, type Approval, type ModuleId, type Period, type SearchRecord, type Task, type Preferences } from '@/lib/data';
import { decideApproval, getPeriodData, searchRecords, validateTask } from '@/lib/workspace';
import { Avatar, Status } from './ui';
import { Overlay } from './overlay';
import { Overview } from './overview';
import { ModuleView } from './module-view';

const navItems = [
  { id: 'overview', icon: LayoutDashboard }, { id: 'sales', icon: BriefcaseBusiness }, { id: 'finance', icon: CircleDollarSign },
  { id: 'people', icon: Users }, { id: 'projects', icon: FolderKanban }, { id: 'support', icon: Headphones }, { id: 'inventory', icon: Package },
] as const;
type Modal = 'search' | 'new-task' | 'approvals' | 'activity' | 'profile' | 'workspace' | 'help' | null;
const subtitles: Record<ModuleId, string> = {
  overview: 'A connected view of your business. A clear path forward.',
  sales: 'Build stronger relationships. Keep every opportunity moving.',
  finance: 'A clear view of what comes in, and what goes out.',
  people: 'The people behind everything you do.',
  projects: 'Bring your teams together around the work that matters.',
  support: 'Great experiences start with being there for your customers.',
  inventory: 'Know what you have. Keep your operations moving.',
  reports: 'Turn shared information into better decisions.',
  settings: 'Make this workspace work for your team.',
};

export function Workspace() {
  const [module, setModule] = useState<ModuleId>('overview');
  const [period, setPeriod] = useState<Period>('month');
  const [preferences, setPreferences] = useState<Preferences>({ name: 'Company workspace', timezone: 'Asia/Kolkata', weekStart: 'Monday', approvalNotifications: true, dailyDigest: false });
  const [approvals, setApprovals] = useState(initialApprovals);
  const [activities, setActivities] = useState(initialActivity);
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'task-1', title: 'Review customer portal acceptance criteria', department: 'Projects', priority: 'High', due: '2026-11-20' },
    { id: 'task-2', title: 'Prepare November close checklist', department: 'Finance', priority: 'Normal', due: '2026-11-24' },
  ]);
  const [modal, setModal] = useState<Modal>(null);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [record, setRecord] = useState<{ title: string; details: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unread, setUnread] = useState(3);
  const [query, setQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);
  const [toast, setToast] = useState('');
  const [taskError, setTaskError] = useState<string | null>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mainHeading = useRef<HTMLHeadingElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationTrigger = useRef<HTMLButtonElement>(null);
  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const data = getPeriodData(period);
  const results: SearchRecord[] = query.trim() ? searchRecords(query) : departments.map(d => ({ id: d.id, title: d.name, description: `${d.owner} · ${d.action}`, module: d.id }));

  function notify(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4500);
  }
  function closeOverlay() { setModal(null); setSelectedApproval(null); setRecord(null); }
  function navigate(next: ModuleId) {
    setModule(next); setMobileOpen(false); setNotificationOpen(false); closeOverlay();
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => mainHeading.current?.focus());
  }
  function openSearch() { setQuery(''); setSearchIndex(0); setModal('search'); setNotificationOpen(false); }
  function showRecord(title: string, details: string) { closeOverlay(); setRecord({ title, details }); }

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
      if (event.key === 'Escape') {
        if (notificationRef.current?.contains(document.activeElement)) notificationTrigger.current?.focus();
        setNotificationOpen(false); setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => { document.removeEventListener('keydown', handler); if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);
  useEffect(() => {
    if (modal === 'search') requestAnimationFrame(() => searchInput.current?.focus());
  }, [modal]);
  useEffect(() => {
    if (!notificationOpen) return;
    const handler = (event: PointerEvent) => { if (!notificationRef.current?.contains(event.target as Node)) setNotificationOpen(false); };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [notificationOpen]);

  function onDecision(decision: 'approved' | 'declined') {
    if (!selectedApproval || approvals.find(a => a.id === selectedApproval.id)?.status !== 'pending') return;
    setApprovals(items => decideApproval(items, selectedApproval.id, decision));
    const activity: Activity = { id: `decision-${selectedApproval.id}`, title: `${selectedApproval.title} ${decision}`, description: `Alex Morgan · ${selectedApproval.department}`, time: 'Just now', module: selectedApproval.department === 'People' ? 'people' : 'finance', initials: 'AM', color: 'blue' };
    setActivities(items => [activity, ...items]);
    closeOverlay(); notify(`Request ${decision}. The demo approval queue is up to date.`);
  }
  function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const error = validateTask(title);
    setTaskError(error);
    if (error) return;
    setTasks(items => [{ id: crypto.randomUUID(), title, department: String(form.get('department')), priority: String(form.get('priority')), due: String(form.get('due')) }, ...items]);
    setActivities(items => [{ id: crypto.randomUUID(), title: `New task: ${title}`, description: 'Alex Morgan · Projects', time: 'Just now', module: 'projects', color: 'teal', initials: 'AM' }, ...items]);
    closeOverlay(); notify('Task created. Find it in Projects.');
  }
  function exportReport() {
    const rows = ['Company OS — demonstration report', 'Amounts are currency-neutral', `Period,${data.label}`, 'Date,Revenue,Expenses', ...data.points.map(point => `${point.label},${point.revenue},${point.expenses}`), `Total,${data.revenue},${data.expenses}`];
    const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = `company-os-${period}-report.csv`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); notify('Demonstration report exported.');
  }
  function selectResult(result: SearchRecord) { navigate(result.module); if (!departments.some(d => d.id === result.id)) setRecord({ title: result.title, details: `${result.description}. Demonstration record. Open its department to explore the related records.` }); }

  const navigation = <>
    <button className="brand" onClick={() => navigate('overview')} aria-label="Company OS home"><span className="brand-symbol"><span /><span /><span /><span /></span><span>company<span className="brand-os">os</span><small>Your business, connected.</small></span></button>
    <button className="workspace-switcher" onClick={() => { setMobileOpen(false); setModal('workspace'); }}><span className="workspace-avatar">C</span><span><strong>{preferences.name}</strong><small>Central administration</small></span><ChevronDown size={14} /></button>
    <div className="nav-label">Workspace</div><nav aria-label="Main navigation">{navItems.map(({ id, icon: Icon }) => <button key={id} className={`nav-item ${module === id ? 'active' : ''}`} aria-current={module === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={18} /><span>{moduleNames[id]}</span>{id === 'support' && <span className="nav-count">24</span>}{id === 'overview' && module === id && <span className="nav-active-dot" />}</button>)}</nav>
    <div className="nav-divider" /><nav aria-label="Administration"><button className={`nav-item ${module === 'reports' ? 'active' : ''}`} onClick={() => navigate('reports')}><FileText size={18} /><span>Reports</span></button><button className={`nav-item ${module === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}><Settings size={18} /><span>Settings</span></button></nav>
    <div className="sidebar-bottom"><div className="workspace-health"><span className="live-dot" /><span>Demo workspace</span><button aria-label="About this demo" onClick={() => { setMobileOpen(false); setModal('help'); }}><HelpCircle size={14} /></button></div><button className="sidebar-help" onClick={() => { setMobileOpen(false); setModal('help'); }}><HelpCircle size={18} /><span>Help & getting started</span><ArrowUpRight size={14} /></button><button className="profile-button" onClick={() => { setMobileOpen(false); setModal('profile'); }}><Avatar initials="AM" color="user" /><span><strong>Alex Morgan</strong><small>Company administrator</small></span><ChevronDown size={14} /></button></div>
  </>;

  return <div className="app-shell"><a className="skip-link" href="#main-content">Skip to main content</a><aside className="sidebar">{navigation}</aside>
    {mobileOpen && <Overlay title="Company workspace" onClose={() => setMobileOpen(false)}><div className="mobile-navigation">{navigation}</div></Overlay>}
    <div className="workspace-main"><header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={21} /></button><span className="breadcrumb-home"><Grid2X2 size={16} /><span>Workspace</span></span><ChevronRight size={13} className="breadcrumb-chevron" /><span className="breadcrumb-current">{moduleNames[module]}</span></div><div className="topbar-right"><button aria-label="Search workspace" className="global-search" onClick={openSearch}><Search size={17} /><span>Search anything…</span><kbd>Ctrl K</kbd></button><span className="topbar-divider" /><button className="icon-button task-icon" aria-label="Open my tasks" onClick={() => navigate('projects')}><CheckCheck size={19} /></button><div className="notification-wrap" ref={notificationRef}><button ref={notificationTrigger} className="icon-button notification-button" aria-label={`Notifications, ${unread} unread`} aria-expanded={notificationOpen} onClick={() => setNotificationOpen(!notificationOpen)}><Bell size={19} />{unread > 0 && <span className="notification-dot" />}</button>{notificationOpen && <div className="notification-popover" role="region" aria-label="Notifications"><div className="popover-heading"><h2>Notifications <span>{unread}</span></h2><button className="text-button" onClick={() => setUnread(0)}>Mark all read</button></div>{[{ title: `${pendingCount} requests need approval`, description: 'Your team is waiting for a decision.', action: () => { setNotificationOpen(false); setModal('approvals'); } }, { title: '3 invoices are overdue', description: 'Take a look at accounts receivable.', action: () => navigate('finance') }, { title: 'Welcome to your workspace', description: 'Your company, connected in one place.', action: () => { setNotificationOpen(false); setModal('help'); } }].map(item => <button className="notification-item" key={item.title} onClick={item.action}><span className={unread ? 'unread-indicator' : 'read-indicator'} /><span><strong>{item.title}</strong><small>{item.description}</small></span><ChevronRight size={15} /></button>)}<p className="popover-footer">Notifications use demonstration data.</p></div>}</div><button className="topbar-avatar" aria-label="Open profile" onClick={() => setModal('profile')}><Avatar initials="AM" color="user" small /></button></div></header>
      <main id="main-content" className="content"><div className="page-heading"><div><div className="greeting">Your central workspace<span className="greeting-dot" />Monday, 16 November 2026</div><h1 ref={mainHeading} tabIndex={-1}>{module === 'overview' ? 'Company overview' : moduleNames[module]}</h1><p>{subtitles[module]}</p></div><div className="page-actions"><label className="period-select"><CalendarDays size={16} /><select value={period} aria-label="Reporting period" onChange={event => setPeriod(event.target.value as Period)}><option value="month">This month</option><option value="quarter">This quarter</option><option value="year">This year</option></select><ChevronDown size={14} /></label><button className="primary-button" onClick={() => { setTaskError(null); setModal('new-task'); }}><Plus size={17} />Create new</button></div></div>
      <div className="workspace-tabs"><div><span className="workspace-tab active">{module === 'overview' ? 'Business overview' : `${moduleNames[module]} overview`}</span><button className="workspace-tab" onClick={() => setModal('approvals')}>Approvals<span>{pendingCount}</span></button></div><span className="last-updated"><span className="live-dot" />Demo data<span className="currency-note">· Currency-neutral amounts</span></span></div>
      {module === 'overview' ? <Overview period={period} approvals={approvals} activities={activities} onNavigate={navigate} onApproval={setSelectedApproval} onViewApprovals={() => setModal('approvals')} onViewActivity={() => setModal('activity')} onExport={exportReport} /> : <ModuleView key={module} module={module} period={period} tasks={tasks} preferences={preferences} onSavePreferences={setPreferences} onRecord={showRecord} onNewTask={() => { setTaskError(null); setModal('new-task'); }} onExport={exportReport} onNotify={notify} />}
      <footer className="page-footer"><span>Company OS <span className="footer-separator">/</span> A little more clarity. A lot more possibility.</span><span>UI prototype <span>·</span> {data.label}</span></footer></main>
    </div>
    {modal === 'search' && <Overlay title="Search your workspace" onClose={closeOverlay} wide><div className="search-modal-input"><Search size={21} /><input ref={searchInput} aria-label="Search workspace" placeholder="Search departments, customers, invoices…" value={query} onChange={event => { setQuery(event.target.value); setSearchIndex(0); }} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setSearchIndex(index => Math.min(index + 1, results.length - 1)); } if (event.key === 'ArrowUp') { event.preventDefault(); setSearchIndex(index => Math.max(0, index - 1)); } if (event.key === 'Enter' && results[searchIndex]) { event.preventDefault(); selectResult(results[searchIndex]); } }} /><kbd>esc</kbd></div><div className="search-results"><p className="search-results-label">{query.trim() ? `${results.length} matching results` : 'Explore your departments'}</p>{results.map((result, index) => <button key={result.id} className={`search-result ${index === searchIndex ? 'selected' : ''}`} onClick={() => selectResult(result)}><span className="department-icon blue"><Search size={16} /></span><span><strong>{result.title}</strong><small>{result.description}</small></span><ArrowRight size={17} /></button>)}{results.length === 0 && <div className="empty-state"><Search size={28} /><h3>No results for “{query}”</h3><p>Try a customer name, department, or invoice number.</p></div>}</div><div className="dialog-footnote">Use ↑ ↓ to choose a result and Enter to open it.</div></Overlay>}
    {modal === 'new-task' && <Overlay title="Create a task" eyebrow="A little progress starts here" onClose={closeOverlay}><form onSubmit={createTask} className="task-form"><label>Task title<input name="title" placeholder="What needs to happen?" maxLength={121} aria-invalid={!!taskError} aria-describedby={taskError ? 'task-error' : undefined} autoFocus />{taskError && <span id="task-error" className="field-error" role="alert">{taskError}</span>}</label><div className="form-two-column"><label>Department<select name="department" defaultValue={departments.find(department => department.id === module)?.name ?? 'Projects'}>{departments.map(d => <option key={d.id}>{d.name}</option>)}</select></label><label>Priority<select name="priority" defaultValue="Normal"><option>Low</option><option>Normal</option><option>High</option></select></label></div><label>Due date<input type="date" name="due" min="2026-11-16" /></label><p className="form-note">This task is saved in the current demo session.</p><div className="dialog-actions"><button className="secondary-button" type="button" onClick={closeOverlay}>Cancel</button><button className="primary-button" type="submit"><Plus size={16} />Create task</button></div></form></Overlay>}
    {modal === 'approvals' && <Overlay title="Approval inbox" eyebrow={`${pendingCount} requests awaiting your decision`} onClose={closeOverlay} wide><div className="approval-list">{approvals.map(approval => <button key={approval.id} className="approval-list-item" onClick={() => { setModal(null); setSelectedApproval(approval); }}><Avatar initials={approval.initials} color={approval.department === 'People' ? 'violet' : 'orange'} /><span><strong>{approval.title}</strong><small>{approval.owner} · {approval.type} · {approval.amount}</small></span><Status value={approval.status} /><ChevronRight size={16} /></button>)}</div><div className="dialog-footnote">Decisions update this local demonstration workspace only.</div></Overlay>}
    {selectedApproval && <Overlay title={selectedApproval.title} eyebrow={`${selectedApproval.type} request`} onClose={closeOverlay}><div className="approval-detail"><div className="approval-person"><Avatar initials={selectedApproval.initials} color="orange" /><span><strong>{selectedApproval.owner}</strong><small>{selectedApproval.department}</small></span><Status value={selectedApproval.status} /></div><div className="approval-amount"><span>{selectedApproval.type === 'Leave' ? 'Requested time off' : 'Amount · currency-neutral'}</span><strong>{selectedApproval.amount}</strong></div><p>{selectedApproval.detail}</p><div className="detail-date"><CalendarDays size={15} />Submitted {selectedApproval.date}</div></div>{selectedApproval.status === 'pending' && <div className="dialog-actions"><button className="secondary-button danger-button" onClick={() => onDecision('declined')}>Decline request</button><button className="primary-button" onClick={() => onDecision('approved')}><Check size={16} />Approve request</button></div>}<div className="dialog-footnote">Demo decision only. No funds, leave balances, or company records are changed.</div></Overlay>}
    {modal === 'activity' && <Overlay title="Workspace activity" onClose={closeOverlay} wide><div className="full-activity">{activities.map(activity => <button key={activity.id} className="activity-item" onClick={() => navigate(activity.module)}><Avatar initials={activity.initials} color={activity.color} /><span className="activity-copy"><strong>{activity.title}</strong><small>{activity.description}</small><time>{activity.time}</time></span><ArrowUpRight size={17} /></button>)}</div></Overlay>}
    {record && <Overlay title={record.title} eyebrow={moduleNames[module]} onClose={closeOverlay}><div className="record-detail"><span className="large-department-icon blue"><FileText size={27} /></span><p>{record.details}</p><div className="record-demo-note"><ShieldCheck size={18} /><span>Demonstration record<br /><small>Real company data will be connected through your backend.</small></span></div></div><div className="dialog-actions"><button className="secondary-button" onClick={closeOverlay}>Close</button><button className="primary-button" onClick={() => { setRecord(null); setTaskError(null); setModal('new-task'); }}>Create related task<Plus size={15} /></button></div></Overlay>}
    {modal === 'profile' && <Overlay title="Your profile" onClose={closeOverlay}><div className="profile-detail"><Avatar initials="AM" color="user" /><h3>Alex Morgan</h3><p>Company administrator</p><span className="status neutral"><ShieldCheck size={13} />Demo administrator</span><p className="form-note">This preview uses a fictional profile. Sign-in and access control will be connected to your backend.</p></div><div className="dialog-actions"><button className="secondary-button" onClick={closeOverlay}>Close</button><button className="primary-button" onClick={() => navigate('settings')}>Workspace settings<Settings size={15} /></button></div></Overlay>}
    {modal === 'workspace' && <Overlay title="Your workspace" onClose={closeOverlay}><div className="workspace-choice"><span className="workspace-avatar">C</span><span><strong>{preferences.name}</strong><small>Central administration · Demo workspace</small></span><CircleCheckIcon /></div><p className="workspace-description">One connected home for your sales, finance, people, projects, support, and inventory teams.</p><div className="dialog-actions"><button className="primary-button" onClick={closeOverlay}>Continue to workspace<ArrowRight size={16} /></button></div></Overlay>}
    {modal === 'help' && <Overlay title="Your company, connected." eyebrow="Welcome to Company OS" onClose={closeOverlay}><div className="help-content"><p>A central home for the tools your teams use every day. Start with the company overview, explore a department, or clear a request from your approval inbox.</p><div><span><Search size={20} /></span><p><strong>Find anything, faster.</strong>Use Ctrl K to search departments, customers, and invoices.</p></div><div><span><CheckCheck size={20} /></span><p><strong>Turn decisions into progress.</strong>Review approval details and try approving a request.</p></div><div><span><Plus size={20} /></span><p><strong>Keep the work moving.</strong>Create a task and find it under Projects.</p></div><p className="form-note">This is an interactive UI prototype with fictional data. Node.js, Express, and Supabase integration is future work.</p></div></Overlay>}
    <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">{toast && <><span className="toast-icon"><Check size={15} /></span><span>{toast}</span><button className="icon-button" onClick={() => setToast('')} aria-label="Dismiss notification"><X size={16} /></button></>}</div>
  </div>;
}

function CircleCheckIcon() { return <span className="workspace-selected"><Check size={18} /></span>; }
