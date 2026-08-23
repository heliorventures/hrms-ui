// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import FileInput from './FileInput';

afterEach(cleanup);

describe('FileInput', () => {
  it('keeps native file attributes and merges caller, description, and error IDs', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <FileInput
        ref={ref}
        id="documents"
        label="Supporting documents"
        description="PDF files up to 5 MB."
        error="Choose at least one document."
        aria-describedby="upload-policy"
        name="documents"
        accept="application/pdf"
        multiple
      />
    );

    const input = screen.getByLabelText<HTMLInputElement>('Supporting documents');
    expect(ref.current).toBe(input);
    expect(input.type).toBe('file');
    expect(input.name).toBe('documents');
    expect(input.accept).toBe('application/pdf');
    expect(input.multiple).toBe(true);
    expect(input.getAttribute('aria-describedby')?.split(' ')).toEqual([
      'upload-policy',
      'documents-description',
      'documents-error',
    ]);
    expect(screen.getByRole('alert').id).toBe('documents-error');
    expect(input.className).toContain('min-h-11');
    expect(input.className).toContain('text-base');
  });
});
