import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceRoot = path.join(root, 'src');
const sourceCache = new Map();
const relative = (filename) => path.relative(root, filename).replaceAll('\\', '/');
function source(filename) {
  if (!sourceCache.has(filename))
    sourceCache.set(
      filename,
      ts.createSourceFile(
        filename,
        fs.readFileSync(filename, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        filename.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
      )
    );
  return sourceCache.get(filename);
}
function literal(node) {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text
    : null;
}
function property(node, name) {
  return node.properties?.find(
    (item) => ts.isPropertyAssignment(item) && item.name.getText().replaceAll(/['"]/g, '') === name
  )?.initializer;
}
function at(file, node) {
  return {
    file: relative(file.fileName),
    line: file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1,
  };
}
function resolveImport(filename, specifier) {
  if (!specifier.startsWith('.')) return null;
  const candidate = path.resolve(path.dirname(filename), specifier);
  return (
    [
      candidate + '.tsx',
      candidate + '.ts',
      path.join(candidate, 'index.tsx'),
      path.join(candidate, 'index.ts'),
    ].find((file) => fs.existsSync(file) && !file.includes(`${path.sep}api${path.sep}`)) ?? null
  );
}
function dependencies(filename, seen = new Set()) {
  if (seen.has(filename)) return seen;
  seen.add(filename);
  for (const statement of source(filename).statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const target = resolveImport(filename, literal(statement.moduleSpecifier) ?? '');
    if (
      target &&
      !/Page\.tsx$/.test(target) &&
      (target.includes(`${path.sep}modules${path.sep}`) ||
        target.includes(`${path.sep}appearance${path.sep}`)) &&
      !target.includes(`${path.sep}guidance${path.sep}`) &&
      !target.includes(`${path.sep}help${path.sep}`)
    )
      dependencies(target, seen);
  }
  return seen;
}
function attributes(node) {
  return new Map(
    node.attributes.properties
      .filter(ts.isJsxAttribute)
      .map((item) => [item.name.getText(), item.initializer])
  );
}
function attributeText(value) {
  return literal(value) ?? (value && ts.isJsxExpression(value) ? literal(value.expression) : null);
}
function buttonText(node) {
  const parent = node.parent;
  if (!ts.isJsxElement(parent)) return '';
  return parent.children
    .filter(ts.isJsxText)
    .map((item) => item.getText().trim())
    .filter(Boolean)
    .join(' ');
}
function inventory(filename) {
  const file = source(filename);
  const anchors = [];
  const tabs = [];
  const actions = [];
  const dynamic = [];
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const id = literal(property(node, 'id')) ?? literal(property(node, 'key'));
      const label = literal(property(node, 'label'));
      let parent = node.parent;
      while (parent && !ts.isVariableDeclaration(parent) && !ts.isCallExpression(parent))
        parent = parent.parent;
      if (
        id &&
        label &&
        parent &&
        (/tab(?:s|_defs)/i.test(ts.isVariableDeclaration(parent) ? parent.name.getText() : '') ||
          (ts.isCallExpression(parent) && parent.expression.getText() === 'usePageTabs'))
      )
        tabs.push({ id, label, source: at(file, node), requiresReview: true });
      const anchor = literal(property(node, 'tourAnchor'));
      if (anchor) anchors.push({ id: anchor, source: at(file, node) });
    }
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const attrs = attributes(node);
      const anchorValue =
        attrs.get('data-tour-anchor') ?? attrs.get('tourAnchor') ?? attrs.get('actionAnchor');
      const anchor = attributeText(anchorValue);
      if (anchor) anchors.push({ id: anchor, source: at(file, node) });
      else if (anchorValue)
        dynamic.push({
          kind: 'anchor',
          expression: anchorValue.getText(file).slice(0, 180),
          source: at(file, node),
        });
      if (node.tagName.getText() === 'PageTabPanel') {
        const id = attributeText(attrs.get('id'));
        if (id) tabs.push({ id, label: null, source: at(file, node), requiresReview: true });
      }
      const handler = attrs.get('onClick') ?? attrs.get('onSubmit');
      if (
        handler &&
        /^(Button|IconButton|button|form|ActionMenu|Link)$/.test(node.tagName.getText())
      ) {
        const disabled = attrs.get('disabled');
        const expression = handler.getText(file).slice(0, 180);
        actions.push({
          anchor,
          label:
            attributeText(attrs.get('label')) ??
            attributeText(attrs.get('title')) ??
            buttonText(node),
          handler: expression,
          source: at(file, node),
          operational: disabled?.getText(file) !== '{true}',
          requiresReview: true,
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return { anchors, tabs, actions, dynamic };
}
const configuration = source(path.join(sourceRoot, 'routes/appRouteConfig.tsx'));
const routes = [];
function collectRoutes(node) {
  if (ts.isObjectLiteralExpression(node) && literal(property(node, 'kind')) === 'page') {
    const routePath = literal(property(node, 'path'));
    const title = literal(property(node, 'title'));
    const load = property(node, 'load');
    let owner = null;
    function findImport(child) {
      if (ts.isCallExpression(child) && child.expression.kind === ts.SyntaxKind.ImportKeyword)
        owner = resolveImport(configuration.fileName, literal(child.arguments[0]) ?? '');
      ts.forEachChild(child, findImport);
    }
    if (load) findImport(load);
    if (routePath && owner) {
      const files = [...dependencies(owner)];
      const items = files.map(inventory);
      routes.push({
        routePath,
        title,
        owner: relative(owner),
        declarations: files.map(relative),
        anchors: items.flatMap((item) => item.anchors),
        tabs: [...new Map(items.flatMap((item) => item.tabs).map((tab) => [tab.id, tab])).values()],
        actions: items.flatMap((item) => item.actions),
        dynamic: items.flatMap((item) => item.dynamic),
        source: at(configuration, node),
      });
    }
  }
  ts.forEachChild(node, collectRoutes);
}
collectRoutes(configuration);
const output = {
  schemaVersion: 1,
  source: 'TypeScript compiler AST; declarations require manual access and behavior review',
  routes,
};
const target = path.join(root, 'docs/guidance/coverage.json');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, JSON.stringify(output, null, 2) + '\n');
process.stdout.write(
  JSON.stringify({
    routes: routes.length,
    sourceFiles: sourceCache.size,
    tabs: routes.reduce((count, route) => count + route.tabs.length, 0),
    anchors: routes.reduce((count, route) => count + route.anchors.length, 0),
    actions: routes.reduce((count, route) => count + route.actions.length, 0),
    output: relative(target),
  }) + '\n'
);
