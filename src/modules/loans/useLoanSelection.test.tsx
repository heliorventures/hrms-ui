// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { expect, it } from 'vitest';

import { useLoanSelection } from './useLoanSelection';

it('opens a shared loan account and preserves other URL state when it is closed', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/loans/my?loan=loan-one&filter=open']}>{children}</MemoryRouter>
  );
  const { result } = renderHook(() => ({ selected: useLoanSelection(), location: useLocation() }), {
    wrapper,
  });
  expect(result.current.selected[0]).toBe('loan-one');
  act(() => result.current.selected[1](null));
  expect(result.current.selected[0]).toBe(null);
  expect(result.current.location.search).toBe('?filter=open');
  act(() => result.current.selected[1]('loan-two'));
  expect(result.current.location.search).toBe('?filter=open&loan=loan-two');
});
