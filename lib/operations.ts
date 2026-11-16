import { moduleRecords, projectRows } from './data.ts';

export type DepartmentId = 'sales' | 'finance' | 'people' | 'projects' | 'support' | 'inventory';
export type RecordEvent = { id: string; text: string; at: string; actor: string; kind: 'note' | 'change' | 'stock' };
export type OperationRecord = { id: string; module: DepartmentId; title: string; status: string; fields: Record<string, string>; history: RecordEvent[] };
export type FieldDefinition = { key: string; label: string; type?: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea'; options?: string[]; required?: boolean; min?: number; max?: number };
export type DepartmentConfig = { singular: string; plural: string; description: string; color: string; statuses: string[]; fields: FieldDefinition[]; titleLabel: string; defaultOwner: string };

export const departmentIds: DepartmentId[] = ['sales', 'finance', 'people', 'projects', 'support', 'inventory'];
export const isDepartment = (value: string): value is DepartmentId => departmentIds.includes(value as DepartmentId);
const owner: FieldDefinition = { key: 'owner', label: 'Owner', required: true };
const amount: FieldDefinition = { key: 'amount', label: 'Amount (currency-neutral)', type: 'number', min: 0.01, required: true };
const company: FieldDefinition = { key: 'company', label: 'Company / customer', required: true };
const priority: FieldDefinition = { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Normal', 'High', 'Urgent'] };
export const departmentConfig: Record<DepartmentId, DepartmentConfig> = {
  sales: { singular: 'opportunity', plural: 'Opportunities', titleLabel: 'Opportunity name', description: 'From first conversation to the next big win.', color: 'blue', defaultOwner: 'Olivia Chen', statuses: ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'], fields: [company, { key: 'contact', label: 'Contact person', required: true }, { key: 'email', label: 'Contact email', type: 'email' }, amount, owner, { key: 'due', label: 'Expected close', type: 'date' }, { key: 'probability', label: 'Probability (%)', type: 'number', min: 0, max: 100 }, { key: 'description', label: 'Opportunity notes', type: 'textarea' }] },
  finance: { singular: 'invoice', plural: 'Invoices', titleLabel: 'Invoice number', description: 'Every invoice has a clear next step.', color: 'violet', defaultOwner: 'Riya Shah', statuses: ['Draft', 'Sent', 'Overdue', 'Paid', 'Void'], fields: [company, amount, { key: 'due', label: 'Due date', type: 'date', required: true }, owner, { key: 'description', label: 'Services / line description', type: 'textarea' }, { key: 'email', label: 'Billing email', type: 'email' }] },
  people: { singular: 'employee', plural: 'Team directory', titleLabel: 'Full name', description: 'A place for every person on your team.', color: 'orange', defaultOwner: 'Maya Patel', statuses: ['Active', 'Onboarding', 'On leave', 'Inactive'], fields: [{ key: 'role', label: 'Job title', required: true }, { key: 'department', label: 'Department', type: 'select', options: ['Sales', 'Finance', 'People', 'Engineering', 'Design', 'Support', 'Operations'], required: true }, { key: 'email', label: 'Work email', type: 'email', required: true }, { key: 'joinDate', label: 'Joining date', type: 'date' }, { key: 'location', label: 'Location' }, { key: 'employment', label: 'Employment type', type: 'select', options: ['Full time', 'Part time', 'Contract'] }, { ...owner, label: 'Manager' }] },
  projects: { singular: 'project', plural: 'Projects', titleLabel: 'Project name', description: 'Clear ownership. Visible progress.', color: 'teal', defaultOwner: 'Ethan Miller', statuses: ['Planning', 'In progress', 'At risk', 'Completed', 'On hold'], fields: [{ key: 'department', label: 'Team / department', required: true }, owner, { key: 'due', label: 'Target date', type: 'date', required: true }, { key: 'progress', label: 'Progress (%)', type: 'number', min: 0, max: 100, required: true }, { key: 'description', label: 'Project brief', type: 'textarea' }, { key: 'milestone', label: 'Next milestone' }] },
  support: { singular: 'ticket', plural: 'Support tickets', titleLabel: 'Ticket subject', description: 'Every customer conversation, in good hands.', color: 'pink', defaultOwner: 'Daniel Kim', statuses: ['Open', 'In progress', 'Waiting on customer', 'Escalated', 'Resolved'], fields: [company, { key: 'contact', label: 'Requester', required: true }, { key: 'email', label: 'Requester email', type: 'email' }, { ...owner, label: 'Assigned to' }, priority, { key: 'description', label: 'Issue description', type: 'textarea', required: true }, { key: 'category', label: 'Category', type: 'select', options: ['Account', 'Billing', 'Technical', 'General'] }] },
  inventory: { singular: 'item', plural: 'Inventory items', titleLabel: 'Item name', description: 'The right stock, in the right place.', color: 'slate', defaultOwner: 'Sophie Lee', statuses: ['In stock', 'Low stock', 'Out of stock'], fields: [{ key: 'sku', label: 'SKU / asset code', required: true }, { key: 'category', label: 'Category', type: 'select', options: ['Computers', 'Displays', 'Furniture', 'Accessories', 'Other'] }, { key: 'quantity', label: 'Opening quantity', type: 'number', min: 0, required: true }, { key: 'reorder', label: 'Reorder level', type: 'number', min: 0, required: true }, { key: 'location', label: 'Storage location', required: true }, owner, { key: 'description', label: 'Item description', type: 'textarea' }] },
};

const initialTime = '2026-11-16T09:00:00.000Z';
export function seedOperations(): OperationRecord[] {
  const records: OperationRecord[] = [];
  for (const module of departmentIds) {
    if (module === 'projects') {
      projectRows.forEach((project, i) => records.push({ id: `project-${i + 1}`, module, title: project.name, status: project.status === 'At risk' ? 'At risk' : 'In progress', fields: { department: project.team, owner: 'Ethan Miller', progress: String(project.progress), due: `2026-11-${[20,25,30][i]}`, milestone: ['Acceptance testing', 'Design sign-off', 'Reconciliation complete'][i], description: ['A self-service portal for customer accounts, documents, and support.', 'A refreshed company website with a clearer product story.', 'Month-end reconciliation and quarterly reporting.'][i] }, history: [{ id: `project-seed-${i}`, text: 'Project workspace created.', at: initialTime, actor: 'Ethan Miller', kind: 'change' }] }));
      continue;
    }
    (moduleRecords[module] ?? []).forEach((row, i) => {
      let fields: Record<string, string> = { owner: row.owner };
      let title = row.title;
      let status = row.status;
      if (module === 'finance' && status === 'Pending') status = 'Sent';
      if (module === 'sales') { title = row.subtitle; fields = { owner: row.owner, company: row.title, contact: ['Jordan Ellis', 'Morgan Blake', 'Sam Rivera', 'Casey Taylor'][i], email: `contact${i + 1}@example.com`, amount: row.value.replaceAll(',', ''), probability: ['100','80','50','20'][i], due: `2026-11-${[18,22,25,30][i]}`, description: 'Account opportunity prepared for the demonstration workspace.' }; }
      if (module === 'finance') fields = { owner: row.owner, company: row.subtitle.split(' · ')[0], amount: row.value.replaceAll(',', ''), due: `2026-11-${String([10,8,9,15,22,28][i]).padStart(2,'0')}`, description: 'Professional services and workspace implementation.', email: `billing${i + 1}@example.com` };
      if (module === 'people') { status = row.status === 'Available' ? 'Active' : row.status; fields = { owner: 'Maya Patel', role: row.subtitle.split(' · ')[0], department: row.value, email: `${row.title.toLowerCase().replaceAll(' ', '.')}@example.com`, joinDate: '2026-01-05', location: 'Bengaluru / Hybrid', employment: 'Full time' }; }
      if (module === 'support') { title = row.title.split(' · ')[1]; fields = { owner: row.owner, company: row.subtitle.split(' · ')[0], contact: ['Jordan Ellis','Alex Parker','Morgan Blake','Sam Rivera','Casey Taylor'][i], priority: row.value, description: `${title}. Please investigate the customer's workspace and provide an update.`, category: ['Account','Technical','General','Billing','Account'][i], email: `requester${i + 1}@example.com` }; }
      if (module === 'inventory') fields = { owner: row.owner, sku: row.subtitle.split(' · ')[0], category: ['Computers','Displays','Furniture','Accessories'][i], quantity: row.value.split(' ')[0], reorder: '5', location: 'Main office · Store A', description: 'Company equipment tracked in the demonstration inventory.' };
      records.push({ id: `${module}-${i + 1}`, module, title, status, fields, history: [{ id: `${module}-seed-${i}`, text: 'Record added to the demonstration workspace.', at: initialTime, actor: fields.owner, kind: 'change' }] });
    });
  }
  return records;
}

export function validateRecord(module: DepartmentId, fields: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!fields.title?.trim()) errors.title = 'Enter a name or title.';
  else if (fields.title.trim().length > 120) errors.title = 'Use 120 characters or fewer.';
  for (const field of departmentConfig[module].fields) {
    const value = (fields[field.key] ?? '').trim();
    if (field.required && !value) { errors[field.key] = `Enter ${field.label.toLowerCase()}.`; continue; }
    if (!value) continue;
    if (value.length > (field.type === 'textarea' ? 2000 : 160)) errors[field.key] = 'This value is too long.';
    if (field.type === 'number') {
      const number = Number(value);
      if (!Number.isFinite(number) || (field.min !== undefined && number < field.min) || (field.max !== undefined && number > field.max)) errors[field.key] = `Enter a number${field.min !== undefined ? ` from ${field.min}` : ''}${field.max !== undefined ? ` to ${field.max}` : ''}.`;
      if (['quantity','reorder'].includes(field.key) && !Number.isInteger(number)) errors[field.key] = 'Use a whole number.';
    }
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors[field.key] = 'Enter a valid email address.';
    if (field.type === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) errors[field.key] = 'Choose a valid date.';
    if (field.options && !field.options.includes(value)) errors[field.key] = 'Choose an available option.';
  }
  if (fields.status && !departmentConfig[module].statuses.includes(fields.status)) errors.status = 'Choose an available status.';
  return errors;
}

export function buildRecord(module: DepartmentId, values: Record<string, string>, existing?: OperationRecord): OperationRecord {
  if (Object.keys(validateRecord(module, values)).length) throw new Error('Check the highlighted fields.');
  const { title, status, ...fields } = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
  const next: OperationRecord = { id: existing?.id ?? crypto.randomUUID(), module, title, status: status || departmentConfig[module].statuses[0], fields, history: existing?.history ?? [] };
  if (module === 'projects' && next.status === 'Completed') next.fields.progress = '100';
  if (module === 'inventory') next.status = Number(fields.quantity) === 0 ? 'Out of stock' : Number(fields.quantity) <= Number(fields.reorder) ? 'Low stock' : 'In stock';
  return withEvent(next, existing ? 'Record details updated.' : `${departmentConfig[module].singular[0].toUpperCase()}${departmentConfig[module].singular.slice(1)} created.`, 'change');
}

function withEvent(record: OperationRecord, text: string, kind: RecordEvent['kind']): OperationRecord {
  return { ...record, history: [{ id: crypto.randomUUID(), text, kind, at: new Date().toISOString(), actor: 'Alex Morgan' }, ...record.history] };
}
export function transitionRecord(record: OperationRecord, status: string): OperationRecord {
  if (!departmentConfig[record.module].statuses.includes(status)) throw new Error('Invalid status for this record.');
  if (record.status === status) return record;
  return withEvent({ ...record, status, fields: record.module === 'projects' && status === 'Completed' ? { ...record.fields, progress: '100' } : record.fields }, `Status changed from ${record.status} to ${status}.`, 'change');
}
export function addRecordNote(record: OperationRecord, note: string): OperationRecord {
  if (!note.trim() || note.trim().length > 2000) throw new Error('Enter a note of 1–2,000 characters.');
  return withEvent(record, note.trim(), 'note');
}
export function applyStockMovement(record: OperationRecord, direction: 'receive' | 'issue', quantity: number, reason: string): OperationRecord {
  if (record.module !== 'inventory') throw new Error('Choose an inventory item.');
  if (!Number.isInteger(quantity)) throw new Error('Enter a whole number.');
  if (quantity <= 0) throw new Error('Enter a positive quantity.');
  if (!reason.trim()) throw new Error('Enter a reason for this movement.');
  const nextQuantity = Number(record.fields.quantity) + (direction === 'receive' ? quantity : -quantity);
  if (nextQuantity < 0) throw new Error('Not enough stock for this issue.');
  const status = nextQuantity === 0 ? 'Out of stock' : nextQuantity <= Number(record.fields.reorder) ? 'Low stock' : 'In stock';
  return withEvent({ ...record, status, fields: { ...record.fields, quantity: String(nextQuantity) } }, `${direction === 'receive' ? 'Received' : 'Issued'} ${quantity} units. ${reason.trim()} Balance: ${nextQuantity}.`, 'stock');
}

export function decodeOperations(raw: string): OperationRecord[] | null {
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || !Array.isArray(value.records) || value.records.length > 2000) return null;
    const ids = new Set<string>();
    for (const row of value.records) {
      if (!row || typeof row.id !== 'string' || ids.has(row.id) || !isDepartment(row.module) || typeof row.title !== 'string' || row.title.length > 120 || !departmentConfig[row.module as DepartmentId].statuses.includes(row.status) || !row.fields || typeof row.fields !== 'object' || Array.isArray(row.fields) || !Object.values(row.fields).every(v => typeof v === 'string') || !Array.isArray(row.history)) return null;
      if (row.history.some((event: RecordEvent) => !event || typeof event.id !== 'string' || typeof event.text !== 'string' || typeof event.actor !== 'string' || typeof event.at !== 'string' || !['note','change','stock'].includes(event.kind))) return null;
      if (Object.keys(validateRecord(row.module, { ...row.fields, title:row.title, status:row.status })).length) return null;
      ids.add(row.id);
    }
    return value.records;
  } catch { return null; }
}

export function summarizeOperations(records: OperationRecord[]) {
  const inModule = (module: DepartmentId) => records.filter(record => record.module === module);
  return {
    pipeline: inModule('sales').filter(r => !['Won','Lost'].includes(r.status)).reduce((sum, r) => sum + Number(r.fields.amount || 0), 0),
    overdueInvoices: inModule('finance').filter(r => r.status === 'Overdue').length,
    receivable: inModule('finance').filter(r => ['Sent','Overdue'].includes(r.status)).reduce((sum, r) => sum + Number(r.fields.amount || 0), 0),
    paid: inModule('finance').filter(r => r.status === 'Paid').reduce((sum, r) => sum + Number(r.fields.amount || 0), 0),
    headcount: inModule('people').filter(r => r.status !== 'Inactive').length,
    present: inModule('people').filter(r => r.status === 'Active').length,
    activeProjects: inModule('projects').filter(r => r.status !== 'Completed').length,
    openTickets: inModule('support').filter(r => r.status !== 'Resolved').length,
    escalatedTickets: inModule('support').filter(r => r.status === 'Escalated').length,
    lowStock: inModule('inventory').filter(r => r.status !== 'In stock').length,
    stock: inModule('inventory').reduce((sum, r) => sum + Number(r.fields.quantity || 0), 0),
  };
}

export function recordSubtitle(record: OperationRecord): string {
  return record.module === 'people' ? `${record.fields.role} · ${record.fields.department}` : record.module === 'inventory' ? `${record.fields.sku} · ${record.fields.location}` : record.module === 'projects' ? record.fields.department : `${record.fields.company}${record.fields.contact ? ` · ${record.fields.contact}` : ''}`;
}
export type OperationalSummary = ReturnType<typeof summarizeOperations>;
export function recordValue(record: OperationRecord): string {
  if (['sales','finance'].includes(record.module)) return Number(record.fields.amount || 0).toLocaleString('en-US');
  if (record.module === 'people') return record.fields.department;
  if (record.module === 'projects') return `${record.fields.progress || 0}%`;
  if (record.module === 'inventory') return `${record.fields.quantity} units`;
  return record.fields.priority;
}
export function toCsv(rows: (string | number)[][]) {
  return rows.map(row => row.map(cell => {
    let value = String(cell);
    if (/^[=+\-@\t\r]/.test(value)) value = `'${value}`;
    return /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
  }).join(',')).join('\r\n');
}
export function downloadCsv(name: string, rows: (string | number)[][]) {
  const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = `${name}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
