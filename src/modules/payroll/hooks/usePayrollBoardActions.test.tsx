// @vitest-environment jsdom

import { act, cleanup, fireEvent, renderHook, screen } from '@testing-library/react';
import { GraphQLClient } from 'graphql-request';
import { type PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RunPayrollForCycleDocument } from '../../../api/graphql/graphql';
import { DialogProvider } from '../../../contexts/DialogContext';
import { usePayrollBoardActions } from './usePayrollBoardActions';

const complianceForm = {
  employerTanInput: '',
  employerLegalNameInput: '',
  baseComponentInput: '',
  arrearComponentInput: '',
  payslipHeaderInput: '',
  payslipLogoIdInput: '',
};

const wrapper = ({ children }: PropsWithChildren) => <DialogProvider>{children}</DialogProvider>;

describe('usePayrollBoardActions', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('gates a pay run through the shared confirmation result', async () => {
    const request = vi.fn().mockResolvedValue({});
    const client = new GraphQLClient('https://example.invalid/graphql');
    Object.defineProperty(client, 'request', { value: request });
    const reload = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(
      () => usePayrollBoardActions({ client, complianceForm, reload }),
      { wrapper }
    );

    let cancelledRun!: Promise<void>;
    act(() => {
      cancelledRun = result.current.runPayroll('cycle-cancelled');
    });

    expect(screen.getByRole('dialog', { name: 'Run payroll for this cycle?' })).toBeTruthy();
    expect(
      screen.getByText(
        'The cycle will be processed and salary, arrears, and payslips will be calculated. Review the cycle details before you continue.'
      )
    ).toBeTruthy();
    expect(request).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Keep cycle unchanged' }));
    await act(async () => cancelledRun);
    expect(request).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();

    let approvedRun!: Promise<void>;
    act(() => {
      approvedRun = result.current.runPayroll('cycle-approved');
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run payroll' }));
    await act(async () => approvedRun);

    expect(request).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledWith(RunPayrollForCycleDocument, {
      payrollCycleId: 'cycle-approved',
    });
    expect(reload).toHaveBeenCalledOnce();
  });
});
