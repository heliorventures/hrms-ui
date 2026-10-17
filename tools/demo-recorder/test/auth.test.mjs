import assert from 'node:assert/strict';
import test from 'node:test';

import { createRoleSession, jsonResponse, resolveRuntime } from '../src/auth.mjs';

const response = value => ({ ok: () => true, status: () => 200, text: async () => JSON.stringify(value) });

test('runtime JSON supports the UTF-8 BOM present on the deployed demo site', async () => {
  const value = await jsonResponse({ ok: () => true, status: () => 200, text: async () => '\uFEFF{"authUrl":"https://api.heliorsoft.com"}' }, 'TEST');
  assert.equal(value.authUrl, 'https://api.heliorsoft.com');
});

test('unapproved runtime auth origin stops before tenant resolution or credential transmission', async () => {
  let calls = 0;
  const api = { get: async () => { calls++; return response({ authUrl: 'https://unexpected.invalid', gatewayUrl: 'https://api.heliorsoft.com/graphql' }); } };
  await assert.rejects(resolveRuntime({ baseUrl: 'https://heliorprd.heliorsoft.com', allowedApiOrigins: ['https://api.heliorsoft.com'] }, api), { code: 'API_NOT_ALLOWED' });
  assert.equal(calls, 1);
});

test('role sessions reject another tenant and required password changes before exposing an authenticated context', async t => {
  const keys = ['DEMO_EMPLOYEE_USERNAME', 'DEMO_EMPLOYEE_PASSWORD', 'DEMO_EMPLOYEE_STATE'];
  const before = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  t.after(() => { for (const key of keys) { if (before[key] === undefined) delete process.env[key]; else process.env[key] = before[key]; } });
  process.env.DEMO_EMPLOYEE_USERNAME = 'fixture-user';
  process.env.DEMO_EMPLOYEE_PASSWORD = 'fixture-secret';
  delete process.env.DEMO_EMPLOYEE_STATE;
  const runtime = { tenantId: 'ours', origin: 'https://demo.invalid', authUrl: 'https://api.demo.invalid' };
  const pair = { tenantId: 'other', refresh: 'fixture-token', userId: 'fixture-user', mustChangePassword: false };
  const api = { post: async () => response(pair) };
  await assert.rejects(createRoleSession('employee', runtime, api), { code: 'SESSION_MISMATCH' });
  pair.tenantId = 'ours';
  pair.mustChangePassword = true;
  await assert.rejects(createRoleSession('employee', runtime, api), { code: 'PASSWORD_CHANGE_REQUIRED' });
  pair.mustChangePassword = false;
  const session = await createRoleSession('employee', runtime, api);
  assert.equal(session.storageState.origins[0].origin, runtime.origin);
  assert.equal(session.storageState.origins[0].localStorage[0].name, 'kabipay.client.refresh.ours');
});
