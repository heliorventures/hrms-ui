// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Drawer from './Drawer';

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

describe('Drawer', () => {
  it('positions a left drawer against the viewport using the shared dialog contract', () => {
    render(
      <Drawer
        isOpen
        onClose={() => undefined}
        title="Filters"
        side="left"
        footer={<button type="button">Apply</button>}
      >
        Filter controls
      </Drawer>,
      { container: document.getElementById('root') ?? undefined }
    );

    const drawer = screen.getByRole('dialog', { name: 'Filters' });
    expect(drawer.className).toContain('fixed');
    expect(drawer.className).toContain('left-0');
    expect(drawer.className).toContain('h-[100dvh]');
    expect(drawer.className).not.toContain('max-w-lg');
    expect(document.getElementById('root')?.hasAttribute('inert')).toBe(true);
    const body = drawer.querySelector('section');
    expect(body?.className).toContain('safe-area-inset-left');
    expect(body?.className).toContain('safe-area-inset-right');
    expect(drawer.querySelector('footer')?.className).toContain('safe-area-inset-left');
    expect(drawer.querySelector('footer')?.className).toContain('safe-area-inset-right');
  });

  it('positions a right drawer against the viewport', () => {
    render(
      <Drawer isOpen onClose={() => undefined} title="Details" side="right">
        Detail content
      </Drawer>,
      { container: document.getElementById('root') ?? undefined }
    );

    const drawer = screen.getByRole('dialog', { name: 'Details' });
    expect(drawer.className).toContain('right-0');
    expect(drawer.className).not.toContain('left-0');
  });
});
