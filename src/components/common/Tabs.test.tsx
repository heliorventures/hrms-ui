// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import Tabs from './Tabs';

afterEach(cleanup);

const TabHarness = ({ prefix = 'profile' }: { prefix?: string }) => {
  const [value, setValue] = useState('overview');
  const tabs = [
    { id: 'overview', label: 'Overview', panelId: `${prefix}-overview-panel` },
    { id: 'history', label: 'History', panelId: `${prefix}-history-panel` },
    { id: 'security', label: 'Security', panelId: `${prefix}-security-panel` },
  ] as const;
  return (
    <div>
      <Tabs tabs={tabs} value={value} onValueChange={setValue} />
      {tabs.map((tab) => (
        <section
          key={tab.id}
          id={tab.panelId}
          role="tabpanel"
          aria-labelledby={`${tab.panelId}-tab`}
          hidden={value !== tab.id}
        >
          {tab.label} panel
        </section>
      ))}
    </div>
  );
};

describe('Tabs', () => {
  it('creates unique per-instance tab IDs and exact panel relationships', () => {
    render(
      <>
        <TabHarness prefix="employee" />
        <TabHarness prefix="manager" />
      </>
    );

    const overviewTabs = screen.getAllByRole('tab', { name: 'Overview' });
    expect(overviewTabs[0].id).not.toBe(overviewTabs[1].id);
    expect(overviewTabs[0].getAttribute('aria-controls')).toBe('employee-overview-panel');
    expect(overviewTabs[1].getAttribute('aria-controls')).toBe('manager-overview-panel');
    expect(document.getElementById('employee-overview-panel')?.getAttribute('aria-labelledby')).toBe(
      overviewTabs[0].id
    );
    expect(document.getElementById('manager-overview-panel')?.getAttribute('aria-labelledby')).toBe(
      overviewTabs[1].id
    );
  });

  it('moves selection, roving tabindex, and focus for Arrow, Home, and End keys', () => {
    render(<TabHarness />);
    const overview = screen.getByRole<HTMLButtonElement>('tab', { name: 'Overview' });
    const history = screen.getByRole<HTMLButtonElement>('tab', { name: 'History' });
    const security = screen.getByRole<HTMLButtonElement>('tab', { name: 'Security' });

    overview.focus();
    fireEvent.keyDown(overview, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(history);
    expect(history.getAttribute('aria-selected')).toBe('true');
    expect(history.tabIndex).toBe(0);
    expect(overview.tabIndex).toBe(-1);

    fireEvent.keyDown(history, { key: 'End' });
    expect(document.activeElement).toBe(security);
    expect(security.getAttribute('aria-selected')).toBe('true');

    fireEvent.keyDown(security, { key: 'Home' });
    expect(document.activeElement).toBe(overview);
    expect(overview.getAttribute('aria-selected')).toBe('true');

    fireEvent.keyDown(overview, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(security);
    expect(security.getAttribute('aria-selected')).toBe('true');
  });

  it('uses orientation-specific arrows and exposes focus-visible reduced-motion styling', () => {
    const VerticalHarness = () => {
      const [value, setValue] = useState('one');
      return (
        <Tabs
          orientation="vertical"
          value={value}
          onValueChange={setValue}
          tabs={[
            { id: 'one', label: 'One', panelId: 'vertical-one' },
            { id: 'two', label: 'Two', panelId: 'vertical-two' },
          ]}
        />
      );
    };
    render(<VerticalHarness />);
    const one = screen.getByRole<HTMLButtonElement>('tab', { name: 'One' });
    const two = screen.getByRole<HTMLButtonElement>('tab', { name: 'Two' });

    one.focus();
    fireEvent.keyDown(one, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(one);
    fireEvent.keyDown(one, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(two);
    expect(two.className).toContain('focus-visible:');
    expect(two.className).toContain('motion-reduce:transition-none');
  });
});
