export type ModuleId = 'overview' | 'sales' | 'finance' | 'people' | 'projects' | 'support' | 'inventory' | 'reports' | 'settings';
export type Period = 'month' | 'quarter' | 'year';
export type Approval = {
  id: string; title: string; amount: string; owner: string; initials: string;
  department: string; type: string; status: 'pending' | 'approved' | 'declined'; detail: string; date: string;
};
export type Activity = { id: string; title: string; description: string; time: string; module: ModuleId; color: string; initials: string };
export type Task = { id: string; title: string; department: string; priority: string; due: string; status?: 'To do' | 'In progress' | 'Done'; project?: string };
export type Preferences = { name: string; timezone: string; weekStart: string; approvalNotifications: boolean; dailyDigest: boolean };
export type SearchRecord = { id: string; title: string; description: string; module: ModuleId };

export const moduleNames: Record<ModuleId, string> = {
  overview: 'Overview', sales: 'Sales & CRM', finance: 'Finance', people: 'People', projects: 'Projects',
  support: 'Support', inventory: 'Inventory', reports: 'Reports', settings: 'Settings',
};

export const initialApprovals: Approval[] = [
  { id: 'ap-1', title: 'Office equipment purchase', amount: '2,400', owner: 'Riya Shah', initials: 'RS', department: 'Finance', type: 'Purchase', status: 'pending', detail: 'Two monitors and an ergonomic desk setup for the new product team members. Vendor: Modern Workplace.', date: '16 Nov 2026' },
  { id: 'ap-2', title: 'Annual leave request', amount: '3 days', owner: 'Daniel Kim', initials: 'DK', department: 'People', type: 'Leave', status: 'pending', detail: 'Annual leave from 23–25 November. Coverage has been arranged with Maya Patel.', date: '15 Nov 2026' },
  { id: 'ap-3', title: 'Client visit expenses', amount: '685', owner: 'Olivia Chen', initials: 'OC', department: 'Sales', type: 'Expense', status: 'pending', detail: 'Travel and accommodation for the Northstar renewal meeting. Receipts are included in the demonstration record.', date: '15 Nov 2026' },
  { id: 'ap-4', title: 'Software subscription renewal', amount: '1,200', owner: 'Ethan Miller', initials: 'EM', department: 'Operations', type: 'Purchase', status: 'pending', detail: 'Annual renewal for the design team’s collaboration software. Twelve active seats.', date: '14 Nov 2026' },
];

export const departments: { id: ModuleId; name: string; subtitle: string; owner: string; initials: string; color: string; metric: string; metricLabel: string; progress: number; status: string; action: string }[] = [
  { id: 'sales', name: 'Sales & CRM', subtitle: 'Relationships that grow', owner: 'Olivia Chen', initials: 'OC', color: 'blue', metric: '428.5K', metricLabel: 'in pipeline', progress: 76, status: 'On track', action: '8 deals closing soon' },
  { id: 'finance', name: 'Finance', subtitle: 'Every number, connected', owner: 'Riya Shah', initials: 'RS', color: 'violet', metric: '96%', metricLabel: 'collection rate', progress: 96, status: 'Needs attention', action: '3 overdue invoices' },
  { id: 'people', name: 'People', subtitle: 'A team that thrives', owner: 'Maya Patel', initials: 'MP', color: 'orange', metric: '98', metricLabel: 'team members', progress: 94, status: 'On track', action: '2 open positions' },
  { id: 'projects', name: 'Projects', subtitle: 'Ideas into outcomes', owner: 'Ethan Miller', initials: 'EM', color: 'teal', metric: '24', metricLabel: 'active projects', progress: 82, status: 'On track', action: '5 milestones this week' },
  { id: 'support', name: 'Support', subtitle: 'Customers come first', owner: 'Daniel Kim', initials: 'DK', color: 'pink', metric: '4.8/5', metricLabel: 'satisfaction score', progress: 96, status: 'Needs attention', action: '2 escalated tickets' },
  { id: 'inventory', name: 'Inventory', subtitle: 'Keep operations moving', owner: 'Sophie Lee', initials: 'SL', color: 'slate', metric: '1,284', metricLabel: 'items in stock', progress: 88, status: 'On track', action: '4 items to reorder' },
];

export const initialActivity: Activity[] = [
  { id: 'ac-1', title: 'Northstar deal moved to won', description: 'Olivia Chen · Sales & CRM', time: '12 min ago', module: 'sales', color: 'blue', initials: 'OC' },
  { id: 'ac-2', title: 'Invoice INV-2026-048 paid', description: 'Riya Shah · Finance', time: '38 min ago', module: 'finance', color: 'violet', initials: 'RS' },
  { id: 'ac-3', title: 'Website redesign hit a milestone', description: 'Ethan Miller · Projects', time: '1 hour ago', module: 'projects', color: 'teal', initials: 'EM' },
  { id: 'ac-4', title: 'Welcome aboard, Jamie!', description: 'Maya Patel · People', time: '2 hours ago', module: 'people', color: 'orange', initials: 'MP' },
];

export const projectRows = [
  { name: 'Customer portal', team: 'Product & Engineering', progress: 78, due: '20 Nov', status: 'On track', color: 'blue', initials: ['EM', 'DK', 'SL'] },
  { name: 'Website redesign', team: 'Design & Marketing', progress: 64, due: '25 Nov', status: 'On track', color: 'violet', initials: ['OC', 'MP', 'RS'] },
  { name: 'Q4 financial close', team: 'Finance & Operations', progress: 42, due: '30 Nov', status: 'At risk', color: 'orange', initials: ['RS', 'SL', 'EM'] },
];

export const records: SearchRecord[] = [
  ...departments.map(d => ({ id: d.id, title: d.name, description: `${d.owner} · ${d.action}`, module: d.id })),
  { id: 'northstar', title: 'Northstar Technologies', description: 'Customer · Enterprise renewal · 48,000', module: 'sales' },
  { id: 'invoice-048', title: 'INV-2026-048', description: 'Northstar Technologies · Paid · 12,500', module: 'finance' },
  { id: 'invoice-052', title: 'INV-2026-052', description: 'Aperture Studio · Overdue · 8,400', module: 'finance' },
  { id: 'portal', title: 'Customer portal', description: 'Product & Engineering · 78% complete', module: 'projects' },
  { id: 'jamie', title: 'Jamie Wilson', description: 'Product designer · People', module: 'people' },
  { id: 'support-218', title: 'Ticket #218: Account access', description: 'Escalated · Northstar Technologies', module: 'support' },
];

export const moduleRecords: Partial<Record<ModuleId, { title: string; subtitle: string; value: string; status: string; owner: string }[]>> = {
  sales: [
    { title: 'Northstar Technologies', subtitle: 'Enterprise platform renewal', value: '48,000', status: 'Won', owner: 'Olivia Chen' },
    { title: 'Meridian Group', subtitle: 'Operations platform rollout', value: '32,500', status: 'Negotiation', owner: 'Alex Morgan' },
    { title: 'Aperture Studio', subtitle: 'Team workspace expansion', value: '18,000', status: 'Proposal', owner: 'Olivia Chen' },
    { title: 'Vertex Labs', subtitle: 'Annual software agreement', value: '64,000', status: 'Discovery', owner: 'Daniel Kim' },
  ],
  finance: [
    { title: 'INV-2026-052', subtitle: 'Aperture Studio · Due 10 Nov', value: '8,400', status: 'Overdue', owner: 'Riya Shah' },
    { title: 'INV-2026-050', subtitle: 'Cedar Works · Due 8 Nov', value: '3,600', status: 'Overdue', owner: 'Sophie Lee' },
    { title: 'INV-2026-051', subtitle: 'Atlas Partners · Due 9 Nov', value: '5,200', status: 'Overdue', owner: 'Riya Shah' },
    { title: 'INV-2026-048', subtitle: 'Northstar Technologies · Due 15 Nov', value: '12,500', status: 'Paid', owner: 'Riya Shah' },
    { title: 'INV-2026-054', subtitle: 'Meridian Group · Due 22 Nov', value: '24,000', status: 'Pending', owner: 'Sophie Lee' },
    { title: 'INV-2026-055', subtitle: 'Vertex Labs · Due 28 Nov', value: '16,000', status: 'Pending', owner: 'Riya Shah' },
  ],
  people: [
    { title: 'Maya Patel', subtitle: 'Head of People · Joined Jan 2023', value: 'People', status: 'Available', owner: 'Full time' },
    { title: 'Jamie Wilson', subtitle: 'Product designer · Joined Nov 2026', value: 'Design', status: 'Onboarding', owner: 'Full time' },
    { title: 'Ethan Miller', subtitle: 'Engineering lead · Joined Mar 2022', value: 'Engineering', status: 'Available', owner: 'Full time' },
    { title: 'Daniel Kim', subtitle: 'Customer success lead · Joined Jun 2024', value: 'Support', status: 'Available', owner: 'Full time' },
  ],
  support: [
    { title: '#218 · Account access', subtitle: 'Northstar Technologies · 25 min ago', value: 'High', status: 'Escalated', owner: 'Daniel Kim' },
    { title: '#219 · Data import', subtitle: 'Atlas Partners · 45 min ago', value: 'High', status: 'Escalated', owner: 'Sophie Lee' },
    { title: '#217 · Export request', subtitle: 'Meridian Group · 1 hour ago', value: 'Normal', status: 'In progress', owner: 'Sophie Lee' },
    { title: '#216 · Invoice question', subtitle: 'Aperture Studio · 2 hours ago', value: 'Normal', status: 'Resolved', owner: 'Daniel Kim' },
    { title: '#215 · Workspace setup', subtitle: 'Vertex Labs · 3 hours ago', value: 'Low', status: 'Resolved', owner: 'Jamie Wilson' },
  ],
  inventory: [
    { title: 'MacBook Pro 14″', subtitle: 'IT-001 · Office equipment', value: '12 units', status: 'In stock', owner: 'Sophie Lee' },
    { title: 'Dell UltraSharp 27″', subtitle: 'IT-014 · Displays', value: '3 units', status: 'Low stock', owner: 'Sophie Lee' },
    { title: 'Ergonomic office chair', subtitle: 'OF-008 · Furniture', value: '24 units', status: 'In stock', owner: 'Ethan Miller' },
    { title: 'USB-C docking station', subtitle: 'IT-022 · Accessories', value: '2 units', status: 'Low stock', owner: 'Sophie Lee' },
  ],
};
