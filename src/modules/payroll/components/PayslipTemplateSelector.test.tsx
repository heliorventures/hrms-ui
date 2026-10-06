// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PayslipTemplateSelector from './PayslipTemplateSelector';

afterEach(cleanup);

describe('company template selector', () => {
  it('shows the company choice and previews the corresponding real renderer', () => {
    const change = vi.fn();
    render(<PayslipTemplateSelector value="TABLE" disabled={false} onChange={change} />);
    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('TABLE');
    fireEvent.click(screen.getByText('Preview selected template'));
    expect(screen.getByText('Earnings')).toBeTruthy();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'EXISTING' } });
    expect(change).toHaveBeenCalledWith('EXISTING');
    expect(document.getElementById('payslip-print-sheet')).toBeNull();
  });

  it('disables changes while settings are unavailable or saving', () => {
    render(<PayslipTemplateSelector value="EXISTING" disabled onChange={vi.fn()} />);
    expect(screen.getByRole('combobox').hasAttribute('disabled')).toBe(true);
  });
});
