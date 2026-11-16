import { test } from 'node:test';
import assert from 'node:assert/strict';
import { seedOperations, validateRecord, applyStockMovement, transitionRecord, addRecordNote, decodeOperations, toCsv, summarizeOperations, buildRecord } from '../lib/operations.ts';

test('record validation is department-specific and rejects invalid amounts, email and dates', () => {
  assert.ok(validateRecord('sales', { title: ' ', amount: '10' }).title);
  assert.ok(validateRecord('finance', { title: 'INV-10', company: 'Acme', amount: '-2', due: '2026-02-30' }).amount);
  assert.ok(validateRecord('finance', { title: 'INV-10', company: 'Acme', amount: '200', due: '2026-02-30' }).due);
  assert.ok(validateRecord('people', { title: 'Alex', email: 'invalid', role: 'Designer', department: 'Design' }).email);
  assert.deepEqual(validateRecord('finance', { title: 'INV-10', company: 'Acme', amount: '200', due: '2026-11-30', status: 'Draft', owner: 'Riya Shah' }), {});
});

test('stock movements cannot underflow or accept fractional quantities and keep a history', () => {
  const item = seedOperations().find(r => r.module === 'inventory')!;
  const quantity = Number(item.fields.quantity);
  assert.throws(() => applyStockMovement(item, 'issue', quantity + 1, 'Equipment allocation'), /stock/i);
  assert.throws(() => applyStockMovement(item, 'receive', 1.2, 'Delivery'), /whole/i);
  assert.throws(() => applyStockMovement(item, 'receive', 0, 'Delivery'), /positive/i);
  const next = applyStockMovement(item, 'receive', 3, 'New delivery');
  assert.equal(Number(next.fields.quantity), quantity + 3);
  assert.equal(next.history.length, item.history.length + 1);
  assert.equal(Number(item.fields.quantity), quantity);
});

test('valid transitions are audited, idempotent, and invalid transitions are rejected', () => {
  const invoice = seedOperations().find(r => r.module === 'finance' && r.status === 'Overdue')!;
  const paid = transitionRecord(invoice, 'Paid');
  assert.equal(paid.status, 'Paid');
  assert.equal(paid.history.length, invoice.history.length + 1);
  assert.deepEqual(transitionRecord(paid, 'Paid'), paid);
  assert.throws(() => transitionRecord(invoice, 'Resolved'), /status/i);
});

test('notes are trimmed and empty notes are rejected', () => {
  const record = seedOperations()[0];
  assert.throws(() => addRecordNote(record, '  '), /note/i);
  const next = addRecordNote(record, '  Follow up on Friday.  ');
  assert.equal(next.history[0].text, 'Follow up on Friday.');
  assert.equal(record.history.length + 1, next.history.length);
});

test('untrusted stored data is rejected without crashing the workspace', () => {
  assert.equal(decodeOperations('not json'), null);
  assert.equal(decodeOperations(JSON.stringify({ version: 99, records: [] })), null);
  assert.equal(decodeOperations(JSON.stringify({ version: 1, records: [{ id: 'bad' }] })), null);
  const records = seedOperations();
  assert.deepEqual(decodeOperations(JSON.stringify({ version: 1, records })), records);
  const corrupt = records.map(record=>record.module==='inventory'?{...record,fields:{...record.fields,quantity:'not a number'}}:record);
  assert.equal(decodeOperations(JSON.stringify({version:1,records:corrupt})),null);
  assert.equal(decodeOperations(JSON.stringify({version:1,records:[records[0],records[0]]})),null);
});

test('CSV escapes delimiters, quotes and spreadsheet formulas', () => {
  const csv = toCsv([['Name', 'Value'], ['Acme, Inc.', '=1+1'], ['Quoted "value"', '@SUM(A1)']]);
  assert.ok(csv.includes('"Acme, Inc."'));
  assert.ok(csv.includes("'=1+1"));
  assert.ok(csv.includes('"Quoted ""value"""'));
  assert.ok(csv.includes("'@SUM(A1)"));
});

test('summaries derive current counts from records and respond to decisions', () => {
  const records = seedOperations();
  const before = summarizeOperations(records);
  const overdue = records.find(r => r.module === 'finance' && r.status === 'Overdue')!;
  const next = records.map(r => r.id === overdue.id ? transitionRecord(r, 'Paid') : r);
  assert.equal(summarizeOperations(next).overdueInvoices, before.overdueInvoices - 1);
  assert.equal(before.headcount, records.filter(r => r.module === 'people').length);
});

test('completing a project through the editor also sets progress to 100', () => {
  const project=seedOperations().find(record=>record.module==='projects')!;
  const completed=buildRecord('projects',{...project.fields,title:project.title,status:'Completed',progress:'20'},project);
  assert.equal(completed.fields.progress,'100');
});
