import { DemoError, requireDemo, verifiedMutation } from './contracts.mjs';

function payload(request) {
  try { return request.postDataJSON(); } catch { return null; }
}

export async function captureMutation(ctx, { field, idVariable, expectedId, click, resource, marker }) {
  const { page, runtime } = ctx;
  const matches = request => request.url() === runtime.gatewayUrl && request.method() === 'POST' && new RegExp(`\\b${field}\\s*\\(`).test(payload(request)?.query ?? '');
  const guard = async route => {
    const request = route.request();
    if (matches(request) && expectedId && idVariable && payload(request)?.variables?.[idVariable] !== expectedId) {
      await route.abort('blockedbyclient');
      return;
    }
    await route.fallback();
  };
  await page.route(runtime.gatewayUrl, guard);
  const responsePromise = page.waitForResponse(response => matches(response.request()), { timeout: ctx.config.timeoutMs }).catch(() => null);
  const intent = { field, expectedId: expectedId ?? null, state: 'uncertain', requestSent: false };
  const observeRequest = request => { if (matches(request)) { intent.requestSent = true; ctx.checkpoint(); } };
  page.on('request', observeRequest);
  ctx.state.writes.push(intent);
  ctx.checkpoint();
  try {
    await click();
    const response = await responsePromise;
    requireDemo(response?.ok(), 'MUTATION_UNCONFIRMED', 'The request result was not confirmed. Reconcile demo records before another submission.');
    const result = verifiedMutation(await response.json(), field, expectedId);
    intent.state = 'confirmed';
    intent.id = result.id;
    intent.status = result.status ?? null;
    if (resource) ctx.state.resources[resource] = { id: result.id, marker, status: result.status ?? null, runTag: ctx.state.runTag };
    ctx.checkpoint();
    return result;
  } catch (error) {
    if (!intent.requestSent) intent.state = 'not-submitted';
    ctx.checkpoint();
    if (error instanceof DemoError) throw error;
    throw new DemoError('MUTATION_UNCONFIRMED', 'The workflow could not confirm its request result. No automatic write retry was performed.');
  } finally {
    page.off('request', observeRequest);
    await page.unroute(runtime.gatewayUrl, guard);
  }
}

export async function enabled(locator, timeout) {
  await locator.waitFor({ state: 'visible' });
  try {
    await locator.page().waitForFunction(element => !element.disabled, await locator.elementHandle(), { timeout });
  } catch { throw new DemoError('ACTION_UNAVAILABLE', 'The action is disabled. Check required data, business policy, or assigned approval scope.'); }
}
