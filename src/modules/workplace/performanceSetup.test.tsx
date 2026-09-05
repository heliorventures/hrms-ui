// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { courseFields } from './learningSetup';
import { cycleFields } from './performanceSetup';
import { SetupEditor } from './performanceSetupEditor';

afterEach(cleanup);
it('rejects reversed cycle dates without saving', async () => {
  const save = vi.fn();
  render(
    <SetupEditor
      title="Create review cycle"
      fields={cycleFields}
      initial={{ name: 'Annual', startDate: '2026-12-01', endDate: '2026-01-01' }}
      onSave={save}
      onClose={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByRole('alert')).toHaveProperty(
    'textContent',
    'End date must be on or after start date.'
  );
  expect(save).not.toHaveBeenCalled();
});
it('retains values and allows retry after save failure', async () => {
  const save = vi
    .fn()
    .mockRejectedValueOnce(new Error('Unavailable'))
    .mockResolvedValueOnce(undefined);
  const close = vi.fn();
  render(
    <SetupEditor
      title="Create course"
      fields={courseFields}
      initial={{ title: 'Security', durationMinutes: '45', isMandatory: true }}
      onSave={save}
      onClose={close}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await screen.findByRole('alert');
  expect(close).not.toHaveBeenCalled();
  expect(screen.getByLabelText(/^Title/)).toHaveProperty('value', 'Security');
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(close).toHaveBeenCalledOnce());
  expect(save).toHaveBeenLastCalledWith({
    title: 'Security',
    durationMinutes: '45',
    isMandatory: true,
  });
});
it('disables save and cancellation while the request is pending', () => {
  const save = vi.fn(() => new Promise<void>(() => {}));
  render(
    <SetupEditor
      title="Create course"
      fields={courseFields}
      initial={{ title: 'Security' }}
      onSave={save}
      onClose={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(screen.getByRole('button', { name: 'Saving...' })).toHaveProperty('disabled', true);
  expect(screen.getByRole('button', { name: 'Cancel' })).toHaveProperty('disabled', true);
});
it('rejects duplicate form submissions while saving', () => {
  const save = vi.fn(() => new Promise<void>(() => {}));
  render(
    <SetupEditor
      title="Create course"
      fields={courseFields}
      initial={{ title: 'Security' }}
      onSave={save}
      onClose={vi.fn()}
    />
  );
  const form = screen.getByRole('button', { name: 'Save' }).closest('form');
  if (!form) throw new Error('Setup form was not rendered');
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(save).toHaveBeenCalledOnce();
});
