// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import TaxHistoryEditor from './TaxHistoryEditor';

afterEach(cleanup);
it('does not turn an unknown historical deduction into zero', () => {
  render(<TaxHistoryEditor busy={false} onSave={vi.fn()} />);
  expect(screen.getByLabelText('Recorded TDS (leave blank if not provided)')).toHaveProperty(
    'value',
    ''
  );
  expect(screen.getByText(/Blank means not provided/)).toBeTruthy();
});
