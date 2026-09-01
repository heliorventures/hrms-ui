// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { StrictMode, useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DialogProvider, useDialogs } from './DialogContext';

type DialogApi = ReturnType<typeof useDialogs>;

const DialogProbe = ({ onReady }: { onReady: (api: DialogApi) => void }) => {
  const dialogs = useDialogs();
  useEffect(() => onReady(dialogs), [dialogs, onReady]);
  return null;
};

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

const renderProvider = (onReady: (api: DialogApi) => void, strict = false) => {
  const provider = (
    <DialogProvider>
      <DialogProbe onReady={onReady} />
    </DialogProvider>
  );
  return render(strict ? <StrictMode>{provider}</StrictMode> : provider, {
    container: document.getElementById('root') ?? undefined,
  });
};

describe('DialogProvider', () => {
  it('resolves confirmation true for approval and false for dismissal', async () => {
    const user = userEventLibrary.setup();
    let api!: DialogApi;
    renderProvider((value) => {
      api = value;
    });

    let approved!: Promise<boolean>;
    act(() => {
      approved = api.confirm({ title: 'Approve request', message: 'Approve this request?' });
    });
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await expect(approved).resolves.toBe(true);

    let dismissed!: Promise<boolean>;
    act(() => {
      dismissed = api.confirm({ title: 'Archive request', message: 'Archive this request?' });
    });
    fireEvent.keyDown(document, { key: 'Escape' });
    await expect(dismissed).resolves.toBe(false);
  });

  it('queues concurrent confirmations and alerts in call order', async () => {
    const user = userEventLibrary.setup();
    let api!: DialogApi;
    renderProvider((value) => {
      api = value;
    });

    const settled: string[] = [];
    act(() => {
      void api
        .confirm({ title: 'First request', message: 'First message' })
        .then((value) => settled.push(`first:${value}`));
      void api.alert({ title: 'Second notice', message: 'Second message' }).then(() => {
        settled.push('second');
      });
      void api
        .confirm({ title: 'Third request', message: 'Third message' })
        .then((value) => settled.push(`third:${value}`));
    });

    expect(screen.getByRole('dialog', { name: 'First request' })).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Second notice' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(settled).toEqual(['first:true']));

    expect(screen.getByRole('dialog', { name: 'Second notice' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'OK' }));
    await waitFor(() => expect(settled).toEqual(['first:true', 'second']));

    expect(screen.getByRole('dialog', { name: 'Third request' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(settled).toEqual(['first:true', 'second', 'third:false']));
  });

  it('settles active and queued promises deterministically when the provider unmounts', async () => {
    let api!: DialogApi;
    const view = renderProvider((value) => {
      api = value;
    });
    const confirmSettled = vi.fn();
    const alertSettled = vi.fn();

    act(() => {
      void api
        .confirm({ title: 'Pending confirmation', message: 'Waiting' })
        .then(confirmSettled);
      void api.alert({ title: 'Pending alert', message: 'Waiting' }).then(alertSettled);
    });

    view.unmount();
    await act(async () => Promise.resolve());
    expect(confirmSettled).toHaveBeenCalledWith(false);
    expect(alertSettled).toHaveBeenCalledOnce();
  });

  it('continues publishing queued dialogs after StrictMode replays provider effects', async () => {
    const user = userEventLibrary.setup();
    let api!: DialogApi;
    renderProvider((value) => {
      api = value;
    }, true);

    let result!: Promise<boolean>;
    act(() => {
      result = api.confirm({ title: 'Strict confirmation', message: 'Continue?' });
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await expect(result).resolves.toBe(false);
  });

  it('does not let a completed request callback settle the next queued confirmation', async () => {
    let api!: DialogApi;
    renderProvider((value) => {
      api = value;
    });
    let first!: Promise<boolean>;
    let second!: Promise<boolean>;
    const secondSettled = vi.fn();

    act(() => {
      first = api.confirm({ title: 'First confirmation', message: 'First?' });
      second = api.confirm({ title: 'Second confirmation', message: 'Second?' });
      void second.then(secondSettled);
    });

    const firstConfirm = screen.getByRole<HTMLButtonElement>('button', { name: 'Confirm' });
    act(() => {
      firstConfirm.click();
      firstConfirm.click();
    });
    await expect(first).resolves.toBe(true);
    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: 'Second confirmation' })).toBeTruthy()
    );
    await act(async () => Promise.resolve());
    expect(secondSettled).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: 'Escape' });
    await expect(second).resolves.toBe(false);
  });
});
