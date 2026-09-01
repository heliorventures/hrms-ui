import {
  Kind,
  type ArgumentNode,
  type DocumentNode,
  type FieldNode,
  type OperationDefinitionNode,
  type VariableDefinitionNode,
} from 'graphql';
import { describe, expect, it } from 'vitest';

import {
  ApproveTimesheetWeekBatchDocument,
  RejectTimesheetWeekBatchDocument,
} from '../../api/graphql/graphql';

function operationDefinition(document: DocumentNode): OperationDefinitionNode {
  const operation = document.definitions.find(
    (definition): definition is OperationDefinitionNode =>
      definition.kind === Kind.OPERATION_DEFINITION
  );
  if (!operation) throw new Error('Expected one GraphQL operation definition.');
  return operation;
}

function variableDefinition(
  operation: OperationDefinitionNode,
  variableName: string
): VariableDefinitionNode | undefined {
  return operation.variableDefinitions?.find(
    (definition) => definition.variable.name.value === variableName
  );
}

function rootField(operation: OperationDefinitionNode): FieldNode {
  const field = operation.selectionSet.selections.find(
    (selection): selection is FieldNode => selection.kind === Kind.FIELD
  );
  if (!field) throw new Error('Expected one GraphQL root field.');
  return field;
}

function fieldArgument(field: FieldNode, argumentName: string): ArgumentNode | undefined {
  return field.arguments?.find((argument) => argument.name.value === argumentName);
}

describe.each([
  ['approve', ApproveTimesheetWeekBatchDocument],
  ['reject', RejectTimesheetWeekBatchDocument],
] as const)('%s timesheet batch GraphQL document', (_decision, document) => {
  it('declares expectedWorkflowStepId as ID! and passes it to the mutation field', () => {
    const operation = operationDefinition(document);
    const expectedStepVariable = variableDefinition(operation, 'expectedWorkflowStepId');

    expect(expectedStepVariable?.type).toMatchObject({
      kind: 'NonNullType',
      type: { kind: 'NamedType', name: { value: 'ID' } },
    });
    expect(fieldArgument(rootField(operation), 'expectedWorkflowStepId')?.value).toMatchObject({
      kind: 'Variable',
      name: { value: 'expectedWorkflowStepId' },
    });
  });
});
