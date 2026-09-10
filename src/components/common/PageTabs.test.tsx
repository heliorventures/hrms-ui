// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import PageTabs, { PageTabPanel } from './PageTabs';
import PageInformation from './PageInformation';
import PageInformationButton from './PageInformationButton';
import PageInformationProvider from './PageInformationProvider';
import { usePageTabs } from '../../hooks/usePageTabs';

afterEach(cleanup);
const allTabs = [
  { id: 'claims', label: 'Claims' },
  { id: 'travel', label: 'Travel' },
];
function Workspace({ travelAllowed = true }: { travelAllowed?: boolean }) {
  const tabs = travelAllowed ? allTabs : allTabs.slice(0, 1);
  const { tab, setTab } = usePageTabs(tabs);
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <PageTabs tabs={tabs} value={tab} onValueChange={setTab} />
      <PageTabPanel id="claims" activeTab={tab}>
        <input aria-label="Claim filter" />
      </PageTabPanel>
      {travelAllowed && (
        <PageTabPanel id="travel" activeTab={tab}>
          <button>Request travel</button>
        </PageTabPanel>
      )}
      <output>{location.search}</output>
      <button onClick={() => navigate(-1)}>Back</button>
    </>
  );
}
const wrap = (child: React.ReactNode, entry = '/expenses?status=pending') => (
  <MemoryRouter
    initialEntries={[entry]}
    future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
  >
    {child}
  </MemoryRouter>
);

describe('page feature navigation', () => {
  it('opens a direct link and preserves other filters when navigating back', () => {
    render(wrap(<Workspace />, '/expenses?status=pending&tab=travel'));
    expect(screen.getByRole('tab', { name: 'Travel' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.click(screen.getByRole('tab', { name: 'Claims' }));
    expect(screen.getByRole('status').textContent).toContain('status=pending');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('button', { name: 'Request travel' })).toBeTruthy();
  });
  it('preserves local filters and connects keyboard-selected tabs to their panels', () => {
    render(wrap(<Workspace />));
    fireEvent.change(screen.getByRole('textbox', { name: 'Claim filter' }), {
      target: { value: 'hotel' },
    });
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Claims' }), { key: 'ArrowRight' });
    expect(screen.queryByRole('textbox')).toBeNull();
    const selected = screen.getByRole('tab', { name: 'Travel' });
    expect(document.activeElement).toBe(selected);
    expect(screen.getByRole('tabpanel').id).toBe(selected.getAttribute('aria-controls'));
    fireEvent.keyDown(selected, { key: 'Home' });
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('hotel');
  });
  it.each(['unknown', 'travel'])('falls back when requested tab %s is unavailable', (requested) => {
    render(wrap(<Workspace travelAllowed={false} />, `/expenses?tab=${requested}`));
    expect(screen.queryByRole('tab', { name: 'Travel' })).toBeNull();
    expect(screen.getByRole('textbox')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Request travel' })).toBeNull();
  });
  it('immediately removes a panel when permissions are revoked', () => {
    const view = render(wrap(<Workspace />, '/expenses?tab=travel'));
    view.rerender(wrap(<Workspace travelAllowed={false} />, '/expenses?tab=travel'));
    expect(screen.queryByRole('button', { name: 'Request travel' })).toBeNull();
    expect(screen.getByRole('textbox')).toBeTruthy();
  });
});

it('keeps the information drawer specific to the active feature', () => {
  render(
    <PageInformationProvider scopeKey="workspace">
      <PageInformationButton />
      <PageTabPanel id="claims" activeTab="claims">
        <PageInformation title="Claim guidance">Expense rules</PageInformation>
      </PageTabPanel>
      <PageTabPanel id="travel" activeTab="claims">
        <PageInformation title="Travel guidance">Travel rules</PageInformation>
      </PageTabPanel>
    </PageInformationProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Page information' }));
  expect(screen.getByText('Expense rules')).toBeTruthy();
  expect(screen.queryByText('Travel rules')).toBeNull();
});
