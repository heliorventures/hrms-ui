import { readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'graphql';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(root, 'src');
const generatedDirectories = new Set(
  ['graphql', 'attendance', 'leave-queue', 'loans'].map((directory) => resolve(sourceRoot, 'api', directory))
);
const violations = [];
let inspectedFiles = 0;

function isOperation(node) {
  const text = node.text;
  if (!/^\s*(?:query\b|mutation\b|subscription\b|fragment\b|\{|#)/.test(text)) return false;
  try {
    return parse(text).definitions.some((definition) => {
      if (definition.kind === 'FragmentDefinition') return true;
      if (definition.kind !== 'OperationDefinition') return false;
      if (definition.name) return true;
      // UI template tokens such as "{employee_name}" also parse as anonymous queries.
      let parent = node.parent;
      while (parent && !ts.isStatement(parent)) {
        if (
          ts.isCallExpression(parent) &&
          /(?:request|graphql|gql)$/.test(parent.expression.getText())
        )
          return true;
        if (
          (ts.isVariableDeclaration(parent) || ts.isPropertyAssignment(parent)) &&
          /(?:query|document|mutation|operation)/i.test(parent.name.getText())
        )
          return true;
        parent = parent.parent;
      }
      return false;
    });
  } catch {
    return false;
  }
}

function inspectFile(file) {
  inspectedFiles++;
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
  const tags = new Set(['gql', 'graphql']);
  for (const statement of source.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const bindings = statement.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const element of bindings.elements) {
      if (tags.has((element.propertyName ?? element.name).text)) tags.add(element.name.text);
    }
  }
  function visit(node) {
    const literal = ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
    const tagged = ts.isTaggedTemplateExpression(node) && tags.has(node.tag.getText(source));
    const dynamic =
      ts.isTemplateExpression(node) &&
      /^\s*(?:query|mutation|subscription|fragment)\b[^]*[({]/.test(node.head.text);
    if ((literal && isOperation(node)) || tagged || dynamic) {
      const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
      violations.push(`${relative(root, file)}:${line}`);
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}

function inspectDirectory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      if (!generatedDirectories.has(file) && entry.name !== '__tests__') inspectDirectory(file);
    } else if (/\.tsx?$/.test(entry.name) && !/\.(?:test|spec)\./.test(entry.name)) {
      inspectFile(file);
    }
  }
}

inspectDirectory(sourceRoot);
if (violations.length) {
  console.error(
    'Move GraphQL operations into src/api/documents/*.graphql and import generated documents:'
  );
  for (const violation of violations) console.error(violation);
  process.exitCode = 1;
} else {
  console.log(
    `No handwritten GraphQL operations in ${inspectedFiles} production TypeScript files.`
  );
}
