// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { StrictMode } from 'react';
import { afterEach, expect, it } from 'vitest';

import PageInformation from './PageInformation';
import PageInformationButton from './PageInformationButton';
import PageInformationProvider from './PageInformationProvider';

afterEach(cleanup);

const View = ({ scope = 'leave', show = true, days = 14 }) => (
  <StrictMode>
    <PageInformationProvider scopeKey={scope}>
      <PageInformationButton />
      <button>Apply for leave</button>
      <p role="alert">A required document is missing</p>
      {show ? (
        <>
          <PageInformation title="Holidays">
            <p>Company holiday</p>
          </PageInformation>
          <PageInformation title="Policy">
            <p>Editable for {days} days</p>
          </PageInformation>
        </>
      ) : null}
    </PageInformationProvider>
  </StrictMode>
);

it('collects sections into one drawer while keeping actions and alerts on the page', async () => {
  const user = userEventLibrary.setup();
  const { rerender } = render(<View />);
  const button = screen.getByRole('button', { name: 'Page information' });
  expect(screen.getAllByRole('button', { name: 'Page information' })).toHaveLength(1);
  expect(screen.queryByText('Company holiday')).toBeNull();
  expect(screen.getByRole('alert').textContent).toContain('required document');
  expect(screen.getByRole('button', { name: 'Apply for leave' })).toBeTruthy();
  await user.click(button);
  const drawer = screen.getByRole('dialog', { name: 'Page information' });
  expect(within(drawer).getByText('Company holiday')).toBeTruthy();
  expect(within(drawer).getByText('Editable for 14 days')).toBeTruthy();
  rerender(<View days={7} />);
  expect(within(drawer).getByText('Editable for 7 days')).toBeTruthy();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).toBeNull();
  await waitFor(() => expect(document.activeElement).toBe(button));
});

it('removes information when its authorized section disappears', () => {
  const { rerender } = render(<View />);
  fireEvent.click(screen.getByRole('button', { name: 'Page information' }));
  rerender(<View show={false} />);
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.queryByText('Company holiday')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Page information' })).toBeNull();
  rerender(<View />);
  expect(screen.getByRole('button', { name: 'Page information' })).toBeTruthy();
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('dismisses the drawer on navigation and does not reopen it on return', () => {
  const { rerender } = render(<View />);
  fireEvent.click(screen.getByRole('button', { name: 'Page information' }));
  rerender(<View scope="attendance" />);
  expect(screen.queryByRole('dialog')).toBeNull();
  rerender(<View />);
  expect(screen.queryByRole('dialog')).toBeNull();
});
