import { test } from 'node:test';
import assert from 'node:assert/strict';
import { searchRecords, decideApproval, validateTask, getPeriodData } from '../lib/workspace.ts';

test('search matches across modules without case or surrounding-space sensitivity', () => {
  assert.deepEqual(searchRecords('  NORTHSTAR '), searchRecords('northstar'));
  assert.ok(searchRecords('northstar').length > 0);
  assert.deepEqual(searchRecords('     '), []);
  assert.deepEqual(searchRecords('no-such-record-192'), []);
});

test('approval decisions are immutable, scoped, and cannot be repeated', () => {
  const items = [{ id: 'a', title: 'Office equipment', amount: '2,400', owner: 'Riya Shah', initials: 'RS', department: 'Finance', type: 'Purchase', status: 'pending' as const, detail: 'Equipment for new team members.', date: '16 Nov 2026' }];
  const next = decideApproval(items, 'a', 'approved');
  assert.equal(items[0].status, 'pending');
  assert.equal(next[0].status, 'approved');
  assert.deepEqual(decideApproval(next, 'a', 'declined'), next);
  assert.deepEqual(decideApproval(items, 'missing', 'approved'), items);
});

test('task validation rejects whitespace and oversized titles', () => {
  assert.equal(validateTask('   '), 'Enter a task title.');
  assert.equal(validateTask('x'.repeat(121)), 'Keep the title under 121 characters.');
  assert.equal(validateTask('Review the Q4 forecast'), null);
});

test('each period uses matching chart totals and has a distinct reporting window', () => {
  const periods = ['month', 'quarter', 'year'] as const;
  const totals = periods.map(period => {
    const data = getPeriodData(period);
    assert.equal(data.revenue, data.points.reduce((sum, point) => sum + point.revenue, 0));
    assert.equal(data.expenses, data.points.reduce((sum, point) => sum + point.expenses, 0));
    assert.ok(data.points.length >= 6);
    return data.revenue;
  });
  assert.equal(new Set(totals).size, 3);
});
