// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import { afterEach, expect, it } from 'vitest';

import { useRememberedRouteView, boundedInteger } from './useRememberedRouteView';

afterEach(cleanup);
const defaults = { page: '0', year: '2026' };
const normalize = (params: URLSearchParams) => ({
  page: String(boundedInteger(params.get('page'), 0, 0, 10000)),
  year: String(boundedInteger(params.get('year'), 2026, 2024, 2027)),
});
const View = ({ owner, identity }: { owner: object; identity: string }) => {
  // Production creates a fresh page-local GraphQL client on every remount.
  const [view, update] = useRememberedRouteView({ owner }, identity, 'test', defaults, normalize);
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output>
        {view.year}/{view.page}
      </output>
      <span data-testid="url">{location.search}</span>
      <button onClick={() => update({ year: '2025', page: '2' })}>Choose view</button>
      <button onClick={() => navigate(-1)}>Back</button>
      <Link to="/away">Leave</Link>
    </>
  );
};
const App = ({
  owner,
  identity = 'a',
  entry = '/view',
}: {
  owner: object;
  identity?: string;
  entry?: string;
}) => {
  return (
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/view" element={<View owner={owner} identity={identity} />} />
        <Route path="/away" element={<Link to="/view">Return</Link>} />
      </Routes>
    </MemoryRouter>
  );
};
it('restores the working view after navigating away and returning through a bare link', () => {
  render(<App owner={{}} />);
  fireEvent.click(screen.getByText('Choose view'));
  fireEvent.click(screen.getByText('Leave'));
  fireEvent.click(screen.getByText('Return'));
  expect(screen.getByText('2025/2')).toBeTruthy();
  expect(screen.getByTestId('url').textContent).toContain('year=2025');
});
it('uses URL state for Back and validates malformed parameters', () => {
  render(<App owner={{}} entry="/view?year=bad&page=-1&apply=1" />);
  expect(screen.getByText('2026/0')).toBeTruthy();
  fireEvent.click(screen.getByText('Choose view'));
  fireEvent.click(screen.getByText('Back'));
  expect(screen.getByText('2026/0')).toBeTruthy();
  expect(screen.getByTestId('url').textContent).toContain('apply=1');
});
it('resets current and remembered state when authorization identity changes', () => {
  const owner = {};
  const app = render(<App owner={owner} />);
  fireEvent.click(screen.getByText('Choose view'));
  app.rerender(<App owner={owner} identity="b" />);
  expect(screen.getByText('2026/0')).toBeTruthy();
  fireEvent.click(screen.getByText('Leave'));
  fireEvent.click(screen.getByText('Return'));
  expect(screen.getByText('2026/0')).toBeTruthy();
});

it('discards a prior identity view when authorization changes while the page is unmounted', () => {
  const owner = {};
  const app = render(<App owner={owner} />);
  fireEvent.click(screen.getByText('Choose view'));
  fireEvent.click(screen.getByText('Leave'));
  app.rerender(<App owner={owner} identity="b" />);
  fireEvent.click(screen.getByText('Return'));
  expect(screen.getByText('2026/0')).toBeTruthy();
});
