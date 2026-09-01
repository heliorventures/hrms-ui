// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import Textarea from './Textarea';

afterEach(cleanup);

describe('Textarea', () => {
  it('associates and announces its error while preserving caller description IDs and native props', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(
      <Textarea
        ref={ref}
        id="reason"
        label="Reason"
        description="Give enough detail for review."
        error="Reason is required."
        aria-describedby="policy-help"
        name="reason"
        rows={5}
      />
    );

    const textarea = screen.getByLabelText<HTMLTextAreaElement>('Reason');
    expect(ref.current).toBe(textarea);
    expect(textarea.name).toBe('reason');
    expect(textarea.rows).toBe(5);
    expect(textarea.getAttribute('aria-describedby')?.split(' ')).toEqual([
      'policy-help',
      'reason-description',
      'reason-error',
    ]);
    expect(screen.getByRole('alert').id).toBe('reason-error');
    expect(textarea.className).toContain('min-h-11');
    expect(textarea.className).toContain('text-base');
  });
});
