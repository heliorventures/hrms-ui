import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { generate } from '@graphql-codegen/cli';
import { ESLint } from 'eslint';

test('updated codegen generates typed clients from an offline schema', async () => {
  const outputs = await generate({
    schema: 'type Query { viewer: Viewer! } type Viewer { id: ID! name: String! }',
    documents: 'query SecurityViewer { viewer { id name } }',
    generates: { 'security-tooling-output/': { preset: 'client' } },
    silent: true,
  }, false);
  assert.ok(outputs.some(output => output.content.includes('SecurityViewerQuery')));
  assert.ok(outputs.some(output => output.content.includes('SecurityViewerDocument')));
});

test('updated TypeScript ESLint loads and checks the current project configuration', async () => {
  const eslint = new ESLint();
  const results = await eslint.lintText('export const securityDependencyProbe = 1;\n', {
    filePath: 'src/routes/AppRoutes.tsx',
  });
  assert.equal(results.length, 1);
  assert.deepEqual(results[0].messages, []);
});

test('patched glob matcher preserves codegen and TypeScript parser matching contracts', () => {
  const require = createRequire(import.meta.url);
  for (const dependency of ['graphql-config', '@typescript-eslint/typescript-estree']) {
    const consumerRequire = createRequire(require.resolve(dependency));
    const { minimatch, Minimatch } = consumerRequire('minimatch');
    assert.equal(minimatch('src/api/query.graphql', 'src/**/*.graphql', { dot: true }), true);
    assert.equal(minimatch('src/api/query.ts', 'src/**/*.graphql', { dot: true }), false);
    const matcher = new Minimatch('src/**/*.tsx', { dot: true });
    assert.equal(matcher.match('src/routes/AppRoutes.tsx'), true);
    assert.equal(matcher.match('node_modules/example/index.tsx'), false);
  }
});
