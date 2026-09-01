// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Table from './Table';

interface LegacyRow {
  id: string;
  name: string;
  nullable: string | null;
}

const rows: LegacyRow[] = [{ id: 'one', name: 'Ada', nullable: null }];

afterEach(cleanup);

describe('Table compatibility adapter', () => {
  it('preserves inferred and explicit generic legacy shapes, arbitrary keys, custom renderers, and string coercion', () => {
    render(
      <Table<LegacyRow>
        data={rows}
        keyExtractor={(row) => row.id}
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'nullable', label: 'Nullable' },
          { key: 'actions', label: '', render: (row) => <button type="button">Open {row.name}</button> },
        ]}
      />
    );

    expect(screen.getByRole('table', { name: 'Records' })).toBeTruthy();
    expect(screen.getByText('null')).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Actions' }).querySelector('.sr-only')?.textContent).toBe('Actions');
    expect(screen.getByRole('button', { name: 'Open Ada' })).toBeTruthy();
  });

  it('accepts a caller-provided accessible name', () => {
    render(<Table data={rows} keyExtractor={(row) => row.id} columns={[{ key: 'name', label: 'Name' }]} ariaLabel="Team members" />);
    expect(screen.getByRole('table', { name: 'Team members' })).toBeTruthy();
  });

  it('retains loading over error, empty, and rows', () => {
    render(<Table data={rows} keyExtractor={(row) => row.id} columns={[{ key: 'name', label: 'Name' }]} loading loadingMessage="Loading legacy rows" errorMessage="Legacy error" />);
    expect(screen.getByRole('status').textContent).toContain('Loading legacy rows');
    expect(screen.queryByText('Legacy error')).toBeNull();
    expect(screen.queryByText('Ada')).toBeNull();
  });

  it('retains error then empty then row state ordering and legacy messages', () => {
    const { rerender } = render(<Table data={rows} keyExtractor={(row) => row.id} columns={[{ key: 'name', label: 'Name' }]} errorMessage="Legacy error" />);
    expect(screen.getByRole('alert').textContent).toContain('Legacy error');
    expect(screen.queryByText('Ada')).toBeNull();

    rerender(<Table data={[]} keyExtractor={(row: LegacyRow) => row.id} columns={[{ key: 'name', label: 'Name' }]} emptyMessage="No legacy rows" />);
    expect(screen.getByText('No legacy rows')).toBeTruthy();

    rerender(<Table data={rows} keyExtractor={(row) => row.id} columns={[{ key: 'name', label: 'Name' }]} />);
    expect(screen.getByText('Ada')).toBeTruthy();
  });
});
