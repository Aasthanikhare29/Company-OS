import { decodeOperations } from './operations.ts';
import { moduleNames } from './data.ts';

function rows(value: unknown): value is Record<string, unknown>[] { return Array.isArray(value) && value.length <= 2000 && value.every(row => row && typeof row === 'object' && !Array.isArray(row)); }
function strings(row: Record<string, unknown>, keys: string[]) { return keys.every(key => typeof row[key] === 'string' && (row[key] as string).length <= 4000); }
export function validOperations(value: unknown) { return decodeOperations(JSON.stringify({ version:1,records:value })) !== null; }
export function validTasks(value: unknown) { return rows(value) && value.every(row => strings(row,['id','title','department','priority','due']) && (row.status === undefined || ['To do','In progress','Done'].includes(String(row.status))) && (row.project === undefined || typeof row.project === 'string')); }
export function validApprovals(value: unknown) { return rows(value) && value.every(row => strings(row,['id','title','amount','owner','initials','department','type','detail','date']) && ['pending','approved','declined'].includes(String(row.status))); }
export function validActivities(value: unknown) { return rows(value) && value.every(row => strings(row,['id','title','description','time','color','initials']) && typeof row.module === 'string' && Object.hasOwn(moduleNames,row.module)); }
export function validPreferences(value: unknown) { const row=value as Record<string,unknown>;return !!row && typeof row === 'object' && strings(row,['name','timezone','weekStart']) && typeof row.approvalNotifications === 'boolean' && typeof row.dailyDigest === 'boolean'; }
