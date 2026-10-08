// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import Button from './Button';
import PageActions from './PageActions';

afterEach(cleanup);
it('uses named icons for header actions while keeping consequential actions readable', () => {
  render(
    <PageActions>
      <Button>Add Employee</Button>
      <Button>Delete</Button>
    </PageActions>
  );
  const add = screen.getByRole('button', { name: 'Add Employee' });
  expect(add.querySelector('svg')).toBeTruthy();
  expect(add.title).toBe('Add Employee');
  expect(screen.getByRole('button', { name: 'Delete' }).textContent).toBe('Delete');
});
it('does not change buttons outside page action rows', () => {
  render(<Button>Add Employee</Button>);
  expect(screen.getByRole('button', { name: 'Add Employee' }).querySelector('svg')).toBeNull();
});
