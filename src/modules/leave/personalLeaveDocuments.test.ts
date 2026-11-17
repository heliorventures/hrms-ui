import { Kind, type FieldNode } from 'graphql';
import { describe, expect, it } from 'vitest';

import { LeaveBoardDocument } from '../../api/graphql/graphql';

describe('personal leave query scope', () => {
  it.each(['pagedLeaveRequests', 'leaveRequestCount'])(
    'restricts %s to the authenticated employee before paging or counting',
    (name) => {
      const operation = LeaveBoardDocument.definitions.find(
        (definition) => definition.kind === Kind.OPERATION_DEFINITION
      );
      if (operation?.kind !== Kind.OPERATION_DEFINITION) throw new Error('Missing operation');
      const field = operation.selectionSet.selections.find(
        (selection): selection is FieldNode =>
          selection.kind === Kind.FIELD && selection.name.value === name
      );
      expect(field?.arguments?.find((argument) => argument.name.value === 'mine')?.value).toEqual({
        kind: Kind.BOOLEAN,
        value: true,
      });
    }
  );
});
