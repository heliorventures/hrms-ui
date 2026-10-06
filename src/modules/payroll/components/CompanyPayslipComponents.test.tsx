// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { GraphQLClient } from 'graphql-request';
import { StrictMode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import {
  CompanyPayslipComponentsDocument,
  PayslipPresentationDocument,
} from '../../../api/graphql/graphql';
import { usePayslipPresentation } from '../hooks/usePayslipPresentation';
import { PAYSLIP_SETTINGS_CHANGED } from '../payslipTemplates';

import CompanyPayslipComponents from './CompanyPayslipComponents';

afterEach(cleanup);
const component = { id: 'basic', name: 'Basic', componentType: 'EARNING', showOnPayslip: true };
const Presentation = ({ client }: { client: GraphQLClient }) => {
  const { data } = usePayslipPresentation(client, 'company', 'slip');
  return <p>{data?.lines.length ? 'Basic on payslip' : 'No component on payslip'}</p>;
};

it('ignores a superseded read when StrictMode restarts the effect', async () => {
  let finish: (value: { salaryComponents: (typeof component)[] }) => void = () => undefined;
  const oldRead = new Promise<{ salaryComponents: (typeof component)[] }>((resolve) => {
    finish = resolve;
  });
  const request = vi
    .fn()
    .mockImplementationOnce(() => oldRead)
    .mockResolvedValue({ salaryComponents: [{ ...component, showOnPayslip: false }] });
  render(
    <StrictMode>
      <CompanyPayslipComponents client={{ request } as unknown as GraphQLClient} />
    </StrictMode>
  );
  await screen.findByRole('checkbox');
  await act(async () => {
    finish({ salaryComponents: [component] });
    await oldRead;
  });
  expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(false);
});

it('keeps the saved state and displays an error when the service rejects a visibility write', async () => {
  const request = vi.fn((document: unknown) =>
    Promise.resolve(
      document === CompanyPayslipComponentsDocument
        ? { salaryComponents: [component] }
        : { setSalaryComponentPayslipVisibility: false }
    )
  );
  const refreshed = vi.fn();
  window.addEventListener(PAYSLIP_SETTINGS_CHANGED, refreshed);
  try {
    render(<CompanyPayslipComponents client={{ request } as unknown as GraphQLClient} />);
    fireEvent.click(await screen.findByRole('checkbox'));
    await screen.findByRole('alert');
    expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(true);
    expect(refreshed).not.toHaveBeenCalled();
  } finally {
    window.removeEventListener(PAYSLIP_SETTINGS_CHANGED, refreshed);
  }
});

it('refreshes an already-mounted presentation after saving component visibility', async () => {
  let visible = true;
  const request = vi.fn((document: unknown) => {
    if (document === CompanyPayslipComponentsDocument)
      return Promise.resolve({ salaryComponents: [component] });
    if (document === PayslipPresentationDocument)
      return Promise.resolve({
        payslipPresentation: {
          template: 'TABLE',
          statement: null,
          lines: visible ? [component] : [],
        },
      });
    visible = false;
    return Promise.resolve({ setSalaryComponentPayslipVisibility: true });
  });
  const client = { request } as unknown as GraphQLClient;
  render(
    <>
      <CompanyPayslipComponents client={client} />
      <Presentation client={client} />
    </>
  );
  await screen.findByText('Basic on payslip');
  fireEvent.click(await screen.findByRole('checkbox'));
  await screen.findByText('No component on payslip');
  expect(
    request.mock.calls.filter(([document]) => document === PayslipPresentationDocument)
  ).toHaveLength(2);
});

it('ignores a visibility save that completes after switching companies', async () => {
  let finish: (value: { setSalaryComponentPayslipVisibility: boolean }) => void = () => undefined;
  const pending = new Promise<{ setSalaryComponentPayslipVisibility: boolean }>((resolve) => {
    finish = resolve;
  });
  const first = {
    request: vi.fn((document: unknown) =>
      document === CompanyPayslipComponentsDocument
        ? Promise.resolve({ salaryComponents: [component] })
        : pending
    ),
  } as unknown as GraphQLClient;
  const next = {
    request: vi.fn(() =>
      Promise.resolve({ salaryComponents: [{ ...component, name: 'New company basic' }] })
    ),
  } as unknown as GraphQLClient;
  const refreshed = vi.fn();
  window.addEventListener(PAYSLIP_SETTINGS_CHANGED, refreshed);
  try {
    const view = render(<CompanyPayslipComponents client={first} />);
    fireEvent.click(await screen.findByRole('checkbox'));
    view.rerender(<CompanyPayslipComponents client={next} />);
    await screen.findByText('New company basic');
    await act(async () => {
      finish({ setSalaryComponentPayslipVisibility: true });
      await pending;
    });
    expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(true);
    expect(refreshed).not.toHaveBeenCalled();
  } finally {
    window.removeEventListener(PAYSLIP_SETTINGS_CHANGED, refreshed);
  }
});
