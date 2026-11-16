'use client';

import { useState, type FormEvent } from 'react';
import { ArrowDownLeft, ArrowUpRight, Check, Clock3, FileText, MessageSquare, Pencil, Plus } from 'lucide-react';
import { Overlay } from './overlay';
import { Avatar, Status } from './ui';
import { addRecordNote, applyStockMovement, departmentConfig, recordSubtitle, recordValue, transitionRecord, downloadCsv, type OperationRecord } from '@/lib/operations';

export function RecordDetail({ record, onSave, onEdit, onClose, onNewTask }: { record: OperationRecord; onSave: (record: OperationRecord, message?: string) => void; onEdit: () => void; onClose: () => void; onNewTask: () => void }) {
  const config = departmentConfig[record.module];
  const [tab, setTab] = useState('Details');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [stockMode, setStockMode] = useState<'receive' | 'issue' | null>(null);
  const [payment, setPayment] = useState(false);
  const initials = (record.module === 'people' ? record.title : record.fields.owner ?? 'AM').split(' ').map(word => word[0]).slice(0, 2).join('');
  function changeStatus(status: string) { onSave(transitionRecord(record, status), `Status updated to ${status}.`); }
  function saveNote(event: FormEvent) { event.preventDefault(); try { onSave(addRecordNote(record, note), 'Internal note added.'); setNote(''); setError(''); } catch (err) { setError((err as Error).message); } }
  function moveStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    try { onSave(applyStockMovement(record, stockMode!, Number(form.get('quantity')), String(form.get('reason'))), 'Stock movement recorded.'); setStockMode(null); setError(''); } catch (err) { setError((err as Error).message); }
  }
  return <Overlay title={record.title} eyebrow={`${config.singular} · ${record.id.startsWith(record.module) ? record.id : 'Custom record'}`} onClose={onClose} wide>
    <div className="record-detail-toolbar"><span><Avatar initials={initials} color={config.color} small /><span>{recordSubtitle(record)}</span></span><button className="secondary-button" onClick={onEdit}><Pencil size={14} />Edit details</button></div>
    <div className="detail-hero"><div><span className="small-label">{record.module === 'inventory' ? 'Current stock' : record.module === 'projects' ? 'Completion' : record.module === 'people' ? 'Department' : record.module === 'support' ? 'Priority' : 'Amount · currency-neutral'}</span><strong>{recordValue(record)}</strong></div><Status value={record.status} /></div>
    <div className="detail-actions">
      {record.module !== 'inventory' && <label className="inline-field">{record.module === 'sales' ? 'Pipeline stage' : 'Status'}<select value={record.status} onChange={event => changeStatus(event.target.value)}>{config.statuses.map(status => <option key={status}>{status}</option>)}</select></label>}
      {record.module === 'finance' && !['Paid','Void'].includes(record.status) && (record.status === 'Draft' ? <button className="primary-button" onClick={() => onSave(transitionRecord(record, 'Sent'), 'Recorded as sent in this demo. No email was sent.')}><Check size={15} />Mark as sent</button> : <button className="primary-button" onClick={() => setPayment(!payment)}><Check size={15} />Record payment</button>)}
      {record.module === 'finance' && <button className="secondary-button" onClick={() => downloadCsv(record.title, [['Invoice','Customer','Amount','Due date','Status'], [record.title,record.fields.company,record.fields.amount,record.fields.due,record.status]])}><FileText size={15} />Download invoice CSV</button>}
      {record.module === 'support' && <button className="primary-button" onClick={() => changeStatus(record.status === 'Resolved' ? 'Open' : 'Resolved')}><Check size={15} />{record.status === 'Resolved' ? 'Reopen ticket' : 'Resolve ticket'}</button>}
      {record.module === 'projects' && <button className="primary-button" onClick={onNewTask}><Plus size={15} />Add a task</button>}
      {record.module === 'inventory' && <><button className="primary-button" onClick={() => { setStockMode('receive'); setError(''); }}><ArrowDownLeft size={15} />Receive stock</button><button className="secondary-button" onClick={() => { setStockMode('issue'); setError(''); }}><ArrowUpRight size={15} />Issue stock</button></>}
    </div>
    {payment && <div className="payment-confirm"><strong>Record full payment of {recordValue(record)}?</strong><p>This only marks the demonstration invoice as paid. No money is collected.</p><button className="primary-button" onClick={() => { onSave(transitionRecord(record, 'Paid'), 'Demo invoice marked as paid.'); setPayment(false); }}>Confirm payment recorded</button><button className="text-button" onClick={() => setPayment(false)}>Cancel</button></div>}
    {stockMode && <form className="stock-form" onSubmit={moveStock} noValidate><h3>{stockMode === 'receive' ? 'Receive stock' : 'Issue stock'}</h3><div className="form-two-column"><label>Quantity<input name="quantity" type="number" min="1" step="1" autoFocus /></label><label>Reason / reference<input name="reason" placeholder="e.g. PO-1024 received" maxLength={200} /></label></div>{error && <p className="field-error" role="alert">{error}</p>}<div><button type="button" className="secondary-button" onClick={() => { setStockMode(null); setError(''); }}>Cancel</button><button className="primary-button" type="submit">Record {stockMode === 'receive' ? 'receipt' : 'issue'}</button></div></form>}
    <div className="detail-tabs" role="tablist" aria-label="Record information">{['Details', 'Activity & notes'].map(label => <button role="tab" aria-selected={tab === label} key={label} className={tab === label ? 'active' : ''} onClick={() => setTab(label)}>{label === 'Details' ? <FileText size={15} /> : <MessageSquare size={15} />}{label}{label !== 'Details' && <span>{record.history.length}</span>}</button>)}</div>
    {tab === 'Details' ? <div className="record-fields" role="tabpanel">{config.fields.filter(field => record.fields[field.key]).map(field => <div key={field.key} className={field.type === 'textarea' ? 'full-field' : ''}><span>{field.key === 'quantity' ? 'Current quantity' : field.label}</span><strong>{record.fields[field.key]}</strong></div>)}{record.module === 'projects' && <div className="full-field"><span>Progress</span><div className="progress-track"><i style={{ width: `${record.fields.progress}%` }} /></div></div>}</div> : <div className="record-history" role="tabpanel"><form onSubmit={saveNote}><label>{record.module === 'support' ? 'Add an internal note' : 'Add a note'}<textarea value={note} onChange={event => setNote(event.target.value)} rows={3} maxLength={2000} placeholder="Keep your team in the loop…" /></label>{error && !stockMode && <p className="field-error" role="alert">{error}</p>}<button className="primary-button" type="submit"><Plus size={14} />Add note</button></form><div className="history-list">{record.history.map(event => <div key={event.id}><span className={`history-dot ${event.kind}`}><Clock3 size={12} /></span><div><p>{event.text}</p><small>{event.actor} · {new Date(event.at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</small></div></div>)}</div></div>}
    <div className="dialog-footnote">Demonstration workflow. Changes are saved on this browser only.</div>
  </Overlay>;
}
