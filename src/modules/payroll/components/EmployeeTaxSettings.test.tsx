// @vitest-environment jsdom
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import EmployeeTaxSettings from './EmployeeTaxSettings';

afterEach(cleanup);
it('requires an explicit regime and a reason for percentage withholding', () => {
  const save = vi.fn();
  render(<EmployeeTaxSettings current={null} busy={false} onSave={save} />);
  fireEvent.change(screen.getByLabelText('Withholding method'), {
    target: { value: 'PERCENTAGE_OVERRIDE' },
  });
  expect(screen.getByLabelText('Reason')).toHaveProperty('required', true);
  expect(screen.getByLabelText('Annual tax regime')).toHaveProperty('value', '');
  expect(save).not.toHaveBeenCalled();
});
