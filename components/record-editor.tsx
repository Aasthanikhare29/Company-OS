'use client';

import { useState, type FormEvent } from 'react';
import { Check, Plus } from 'lucide-react';
import { Overlay } from './overlay';
import { buildRecord, departmentConfig, validateRecord, type DepartmentId, type OperationRecord } from '@/lib/operations';

export function RecordEditor({ module, record, onSave, onClose }: { module: DepartmentId; record?: OperationRecord; onSave: (record: OperationRecord) => void; onClose: () => void }) {
  const config = departmentConfig[module];
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<Record<string, string>>(() => ({ title: record?.title ?? (module === 'finance' ? `INV-${Date.now().toString().slice(-6)}` : ''), status: record?.status ?? config.statuses[0], owner: config.defaultOwner, progress: '0', quantity: '0', reorder: '5', probability: '50', ...Object.fromEntries(config.fields.filter(f => f.options).map(f => [f.key, f.options![0]])), ...record?.fields }));
  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateRecord(module, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(buildRecord(module, values, record));
  }
  function fieldError(key: string) { return errors[key] ? <span className="field-error" id={`error-${key}`} role="alert">{errors[key]}</span> : null; }
  const change = (key: string, value: string) => setValues(previous => ({ ...previous, [key]: value }));
  return <Overlay title={`${record ? 'Edit' : 'New'} ${config.singular}`} eyebrow={`${config.plural} · Browser-local demo`} onClose={onClose} wide>
    <form className="record-form" onSubmit={submit} noValidate>
      <label className="full-field">{config.titleLabel}<span className="required-label">Required</span><input autoFocus value={values.title} maxLength={120} onChange={event => change('title', event.target.value)} aria-invalid={!!errors.title} aria-describedby={errors.title ? 'error-title' : undefined} />{fieldError('title')}</label>
      <div className="record-form-grid">{config.fields.map(field => <label key={field.key} className={field.type === 'textarea' ? 'full-field' : ''}>{record && module === 'inventory' && field.key === 'quantity' ? 'Current quantity (use Receive / Issue to change)' : field.label}{field.required && <span className="required-label">Required</span>}{field.options ? <select value={values[field.key] ?? ''} onChange={event => change(field.key, event.target.value)} aria-invalid={!!errors[field.key]} aria-describedby={errors[field.key] ? `error-${field.key}` : undefined}>{field.options.map(option => <option key={option}>{option}</option>)}</select> : field.type === 'textarea' ? <textarea value={values[field.key] ?? ''} onChange={event => change(field.key, event.target.value)} rows={3} maxLength={2000} aria-invalid={!!errors[field.key]} aria-describedby={errors[field.key] ? `error-${field.key}` : undefined} /> : <input type={field.type ?? 'text'} value={values[field.key] ?? ''} min={field.min} max={field.max} step={['quantity','reorder'].includes(field.key) ? '1' : 'any'} readOnly={!!record && module === 'inventory' && field.key === 'quantity'} onChange={event => change(field.key, event.target.value)} aria-invalid={!!errors[field.key]} aria-describedby={errors[field.key] ? `error-${field.key}` : undefined} />}{fieldError(field.key)}</label>)}{module !== 'inventory' && <label>Status<select value={values.status} onChange={event => change('status', event.target.value)}>{config.statuses.map(status => <option key={status}>{status}</option>)}</select>{fieldError('status')}</label>}</div>
      <p className="form-note">Saved only on this browser. This form does not send emails or modify real company records.</p>
      <div className="dialog-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">{record ? <Check size={16} /> : <Plus size={16} />}{record ? 'Save changes' : `Create ${config.singular}`}</button></div>
    </form>
  </Overlay>;
}
