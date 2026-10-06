// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FEATURE_REGISTRY } from '../featureRegistry';

import HelpScreenshot from './HelpScreenshot';
import { AuthorizedPageHelp } from './PageHelpContent';

afterEach(cleanup);
describe('page instructions', () => {
  it('renders only permitted tasks with ordered instructions and outcomes', () => {
    const features = FEATURE_REGISTRY.filter((item) =>
      item.tourStepIds.includes('expense-submit-claim')
    );
    const view = render(<AuthorizedPageHelp features={features} routePath="expenses" />);
    expect(screen.queryByText('Request a trip')).toBeNull();
    fireEvent.click(screen.getByText('Submit an expense claim'));
    expect(screen.getByText(/A receipt is required for every new expense/)).toBeTruthy();
    expect(document.querySelector('ol li')).toBeTruthy();
    expect(screen.getByText('Outcome:')).toBeTruthy();
    view.rerender(<AuthorizedPageHelp features={[]} routePath="expenses" />);
    expect(document.querySelector('ol')).toBeNull();
  });
  it('labels design references and returns focus after enlargement', async () => {
    render(<HelpScreenshot id="leave-design" />);
    const button = screen.getByRole('button', { name: /Enlarge/ });
    button.focus();
    fireEvent.click(button);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getAllByText(/Design illustration from ui-review.pen/).length).toBe(2);
    fireEvent.click(screen.getByRole('button', { name: /Close/ }));
    await waitFor(() => expect(document.activeElement).toBe(button));
  });
});
