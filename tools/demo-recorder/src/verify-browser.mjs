import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';

import './config.mjs';
import { captureMutation } from './mutations.mjs';
import { safeFailure } from './contracts.mjs';

let writes = 0;
const server = createServer((request, response) => {
  if (request.url !== '/graphql') {
    response.setHeader('Content-Type', 'text/html');
    response.end(`<button id="approve">Approve fixture request</button><script>window.target='wrong';document.querySelector('#approve').onclick=()=>fetch('/graphql',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'mutation ApproveExpense($expenseId:ID!){approveExpense(expenseId:$expenseId){id status}}',variables:{expenseId:window.target}})}).catch(()=>{});</script>`);
    return;
  }
  let body = '';
  request.on('data', data => { body += data; });
  request.on('end', () => {
    writes++;
    const payload = JSON.parse(body);
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ data: { approveExpense: { id: payload.variables.expenseId, status: 'PENDING' } } }));
  });
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  const { chromium } = await import('playwright');
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(origin);
  const ctx = { page, runtime: { gatewayUrl: `${origin}/graphql` }, config: { timeoutMs: 1000 }, state: { writes: [], resources: {} }, checkpoint() {} };
  await assert.rejects(captureMutation(ctx, { field: 'approveExpense', idVariable: 'expenseId', expectedId: 'ours', click: () => page.locator('#approve').click() }));
  assert.equal(writes, 0, 'A mismatched approval must never reach the API.');
  await page.evaluate(() => { window.target = 'ours'; });
  const result = await captureMutation(ctx, { field: 'approveExpense', idVariable: 'expenseId', expectedId: 'ours', click: () => page.locator('#approve').click() });
  assert.equal(writes, 1);
  assert.equal(result.id, 'ours');
  assert.equal(result.status, 'PENDING');
  assert.equal(ctx.state.writes.at(-1).state, 'confirmed');
  console.log(JSON.stringify({ status: 'passed', checks: ['wrong approval ID blocked before API', 'correct approval ID confirmed', 'pending workflow preserved'] }));
} catch (error) {
  console.error(JSON.stringify(safeFailure(error)));
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.close();
  await once(server, 'close');
}
