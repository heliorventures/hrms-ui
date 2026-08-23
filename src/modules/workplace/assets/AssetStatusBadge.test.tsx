// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import AssetStatusBadge from './AssetStatusBadge';

afterEach(cleanup);

describe('AssetStatusBadge', () => {
  it.each([
    ['ACTIVE', 'Active', 'success'],
    ['AVAILABLE', 'Available', 'success'],
    ['ASSIGNED', 'Assigned', 'info'],
    ['RETURNED', 'Returned', 'neutral'],
    ['RETIRED', 'Retired', 'danger'],
  ])('maps %s to the explicit %s label and %s tone', (status, label, tone) => {
    render(<AssetStatusBadge status={status} />);

    expect(screen.getByText(label).closest(`[data-tone="${tone}"]`)).not.toBeNull();
  });

  it('does not turn an arbitrary service value into user-facing status text or color', () => {
    render(<AssetStatusBadge status="INTERNAL_API_STATE" />);

    expect(screen.getByText('Unknown status').closest('[data-tone="neutral"]')).not.toBeNull();
    expect(screen.queryByText('INTERNAL API STATE')).toBeNull();
  });
});
