// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PayslipTemplateSelector from './PayslipTemplateSelector';

afterEach(cleanup);

describe('company template selector', () => {
  it('previews the company name and multiline address entered in the form', () => {
    render(
      <PayslipTemplateSelector
        value="TABLE"
        companyHeaderName="Company draft"
        companyAddress="801, Business Court\nPune - 411038"
        disabled={false}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('Company draft').nextElementSibling?.textContent).toBe(
      'Address: 801, Business Court\nPune - 411038'
    );
  });

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
