import {
  createSourceFile,
  forEachChild,
  isJsxAttribute,
  isJsxOpeningElement,
  isJsxSelfClosingElement,
  type Node,
  ScriptKind,
  ScriptTarget,
} from 'typescript';
import { describe, expect, it } from 'vitest';

const moduleSources = import.meta.glob('../../modules/**/*.tsx', {
  eager: true,
  import: 'default',
  query: '?raw',
});

describe('required control inventory', () => {
  it('uses shared form controls for every required module field', () => {
    const violations: string[] = [];
    for (const [path, source] of Object.entries(moduleSources)) {
      if (path.includes('.test.')) continue;
      const file = createSourceFile(path, source, ScriptTarget.Latest, true, ScriptKind.TSX);
      const visit = (node: Node) => {
        if (
          (isJsxOpeningElement(node) || isJsxSelfClosingElement(node)) &&
          ['input', 'select', 'textarea'].includes(node.tagName.getText()) &&
          node.attributes.properties.some(
            (attribute) => isJsxAttribute(attribute) && attribute.name.getText() === 'required'
          )
        ) {
          violations.push(
            path +
              ':' +
              (file.getLineAndCharacterOfPosition(node.getStart()).line + 1) +
              ' uses a raw required <' +
              node.tagName.getText() +
              '>'
          );
        }
        forEachChild(node, visit);
      };
      visit(file);
    }
    expect(violations).toEqual([]);
  });
});
