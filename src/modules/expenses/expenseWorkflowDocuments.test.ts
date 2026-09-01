import { readFileSync } from 'node:fs';
import {
  Kind,
  parse,
  type FieldDefinitionNode,
  type FieldNode,
  type ObjectTypeExtensionNode,
  type OperationDefinitionNode,
} from 'graphql';
import { describe, expect, it } from 'vitest';

const operations = parse(
  readFileSync(new URL('../../api/documents/clientOperations.graphql', import.meta.url), 'utf8')
);
const extensions = parse(
  readFileSync(new URL('../../api/schema-extensions/backlog-catchup.graphql', import.meta.url), 'utf8')
);

function operation(name: string): OperationDefinitionNode {
  const value = operations.definitions.find(
    (definition): definition is OperationDefinitionNode =>
      definition.kind === Kind.OPERATION_DEFINITION && definition.name?.value === name
  );
  if (!value) throw new Error(`Missing GraphQL operation ${name}.`);
  return value;
}

function rootField(value: OperationDefinitionNode): FieldNode {
  const field = value.selectionSet.selections.find(
    (selection): selection is FieldNode => selection.kind === Kind.FIELD
  );
  if (!field) throw new Error('Missing root field.');
  return field;
}

describe.each([
  'ApproveExpense',
  'RejectExpense',
  'ApproveTravelRequest',
  'RejectTravelRequest',
])('%s source operation', (operationName) => {
  it('requires and passes expectedWorkflowStepId', () => {
    const value = operation(operationName);
    const variable = value.variableDefinitions?.find(
      (definition) => definition.variable.name.value === 'expectedWorkflowStepId'
    );
    const argument = rootField(value).arguments?.find(
      (candidate) => candidate.name.value === 'expectedWorkflowStepId'
    );

    expect(variable?.type).toMatchObject({
      kind: Kind.NON_NULL_TYPE,
      type: { kind: Kind.NAMED_TYPE, name: { value: 'ID' } },
    });
    expect(argument?.value).toMatchObject({
      kind: Kind.VARIABLE,
      name: { value: 'expectedWorkflowStepId' },
    });
  });
});

it('selects pendingApprovalStepId for expense and travel action rows', () => {
  const board = operation('ExpenseBoard');
  for (const fieldName of ['expenses', 'travelRequests']) {
    const field = board.selectionSet.selections.find(
      (selection): selection is FieldNode =>
        selection.kind === Kind.FIELD && selection.name.value === fieldName
    );
    expect(
      field?.selectionSet?.selections.some(
        (selection) => selection.kind === Kind.FIELD && selection.name.value === 'pendingApprovalStepId'
      )
    ).toBe(true);
  }
});

it('extends expense and travel rows with pendingApprovalStepId for source codegen', () => {
  for (const typeName of ['Expense', 'TravelRequest']) {
    const extension = extensions.definitions.find(
      (definition): definition is ObjectTypeExtensionNode =>
        definition.kind === Kind.OBJECT_TYPE_EXTENSION && definition.name.value === typeName
    );
    const field = extension?.fields?.find(
      (candidate): candidate is FieldDefinitionNode => candidate.name.value === 'pendingApprovalStepId'
    );
    expect(field?.type).toMatchObject({ kind: Kind.NAMED_TYPE, name: { value: 'ID' } });
  }
});
