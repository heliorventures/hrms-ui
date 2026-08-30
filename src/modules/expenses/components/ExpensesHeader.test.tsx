// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ExpensesHeader from './ExpensesHeader';

afterEach(cleanup);

describe('ExpensesHeader action permissions', () => {
  it('omits submit and manage actions for a read-only user', () => {
    render(
      <MemoryRouter>
        <ExpensesHeader
          canManageExpense={false}
          canSubmitExpense={false}
          canSubmitTravel={false}
          onOpenExpense={vi.fn()}
          onOpenTravel={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: 'Submit Expense' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Request travel' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Configure categories' })).toBeNull();
  });
});
