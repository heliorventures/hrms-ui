// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import OrganizationRecordTable from './OrganizationRecordTable';

afterEach(cleanup);

it.each([0, -1, null, undefined])(
  'shows explicit invalid-version state and removes actions for %s',
  (version) => {
    const action = vi.fn(() => <button>Approve</button>);
    render(
      <OrganizationRecordTable
        label="Source records"
        rows={[{ id: 'row-a', version }]}
        fields={[]}
        renderAction={action}
      />
    );
    expect(
      screen.getByText('Source version unavailable. Refresh records before making changes.')
    ).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Approve' })).toBeNull();
    expect(action).not.toHaveBeenCalled();
  }
);
