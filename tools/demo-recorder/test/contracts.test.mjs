import assert from 'node:assert/strict';
import test from 'node:test';

import { validateConfig, validateScenarioData } from '../src/config.mjs';
import { scenesForExport, safeFailure, verifiedMutation, approvalOutcome, parseSceneWindows } from '../src/contracts.mjs';
import { extractSource } from '../src/discover.mjs';

const config = {
  baseUrl: 'https://heliorprd.heliorsoft.com',
  allowedOrigins: ['https://heliorprd.heliorsoft.com'], environment: 'demo',
  viewport: { width: 1920, height: 1080 }, maxSeconds: 60, paceMs: 1200, timeoutMs: 20000,
  approvalRole: 'manager',
};

test('target validation rejects credential URLs, lookalike origins, non-demo environments and invalid limits', () => {
  assert.equal(validateConfig(config).baseUrl, config.baseUrl);
  for (const change of [
    { baseUrl: 'https://heliorprd.heliorsoft.com.evil.invalid' },
    { baseUrl: 'https://user:secret@heliorprd.heliorsoft.com' },
    { environment: 'production' }, { maxSeconds: 0 }, { maxSeconds: 61 },
    { paceMs: -1 }, { viewport: { width: 0, height: 1080 } },
  ]) assert.throws(() => validateConfig({ ...config, ...change }));
});

test('scenario configuration rejects missing amounts, impossible dates and backwards ranges without defaults', () => {
  const expense = { categoryLabel: 'Meals', title: 'Demo', amount: '120.50', currency: 'INR', date: '2026-10-17', receipt: 'receipt.png' };
  assert.doesNotThrow(() => validateScenarioData('expense-submit', { expense }));
  for (const amount of ['', null, '0', '-1', 'NaN', 'Infinity', '12x']) {
    assert.throws(() => validateScenarioData('expense-submit', { expense: { ...expense, amount } }));
  }
  assert.throws(() => validateScenarioData('expense-submit', { expense: { ...expense, date: '2026-02-30' } }));
  assert.throws(() => validateScenarioData('leave-apply', { leave: { typeLabel: 'Casual', fromDate: '2026-10-20', toDate: '2026-10-19', reason: 'Demo' } }));
});

test('export retains all complete scenes and rejects over-budget footage instead of truncating the outcome', () => {
  const scenes = [{ start: 2, end: 10 }, { start: 30, end: 40 }];
  assert.equal(scenesForExport(scenes, 60, 45).duration, 18);
  assert.throws(() => scenesForExport([{ start: 0, end: 61 }], 60, 62));
  assert.throws(() => scenesForExport([{ start: 8, end: 4 }], 60, 20));
  assert.throws(() => scenesForExport([{ start: 2, end: 40 }], 60, 20));
});

test('encoded scene boundaries retain outcome frames independent of browser clock drift', () => {
  const windows = parseSceneWindows('[blackdetect] black_start:1.04 black_end:3.28 black_duration:2.24\n[blackdetect] black_start:10.4 black_end:12.8 black_duration:2.4');
  assert.deepEqual(windows, [{ start: 1.04, end: 3.28 }, { start: 10.4, end: 12.8 }]);
  assert.throws(() => parseSceneWindows('no complete markers'));
});

test('GraphQL errors and missing/mismatched identities cannot be reported as a verified mutation', () => {
  assert.equal(verifiedMutation({ data: { submitExpense: { id: 'ours', status: 'PENDING' } } }, 'submitExpense').id, 'ours');
  assert.throws(() => verifiedMutation({ data: { submitExpense: { id: 'ours' } }, errors: [{ message: 'Denied' }] }, 'submitExpense'));
  assert.throws(() => verifiedMutation({ data: { submitExpense: null } }, 'submitExpense'));
  assert.throws(() => verifiedMutation({ data: { approveExpense: { id: 'someone-else' } } }, 'approveExpense', 'ours'));
});

test('intermediate workflow approval is distinct from final approval and rejection never passes', () => {
  assert.equal(approvalOutcome('PENDING').final, false);
  assert.equal(approvalOutcome('APPROVED').final, true);
  assert.equal(approvalOutcome('PARTIAL_APPROVED').final, true);
  assert.throws(() => approvalOutcome('REJECTED'));
  assert.throws(() => approvalOutcome(null));
});

test('failure reports never include arbitrary exception messages containing credentials', () => {
  const report = safeFailure(new Error('request password=super-secret access=private-token'));
  assert.equal(JSON.stringify(report).includes('super-secret'), false);
  assert.equal(JSON.stringify(report).includes('private-token'), false);
});

test('AST extraction reads actual UI attributes/routes and ignores text in comments', () => {
  const source = `// label="Pretend field"\n const routes=[{path:'attendance',title:'Attendance'}];\nconst X=()=> <Input label="Expense Date" data-tour-anchor="expense.date" required />;`;
  const facts = extractSource('example.tsx', source);
  assert.equal(facts.attributes.some(x => x.value === 'Pretend field'), false);
  assert.equal(facts.attributes.some(x => x.value === 'Expense Date'), true);
  assert.equal(facts.routes.some(x => x.path === 'attendance'), true);
});
