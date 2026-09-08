import { describe, expect, it } from 'vitest';

import { candidateTokenFromHash, documentFileError, validateAnswers } from './prejoiningForm';
import type { PrejoiningField } from './types';

const fields: PrejoiningField[] = [
  { key: 'firstName', label: 'First name', required: true },
  { key: 'email', label: 'Personal email', required: true },
  { key: 'dateOfBirth', label: 'Date of birth', required: false },
];

describe('candidateTokenFromHash', () => {
  it('reads the token from an encoded URL fragment', () => {
    expect(candidateTokenFromHash('#token=secret%2Bvalue')).toBe('secret+value');
  });

  it('rejects empty and unrelated fragments', () => {
    expect(candidateTokenFromHash('#token=')).toBeNull();
    expect(candidateTokenFromHash('#section=profile')).toBeNull();
  });
});

describe('validateAnswers', () => {
  it('reports labelled required and format errors', () => {
    expect(validateAnswers(fields, { firstName: ' ', email: 'invalid' })).toEqual({
      firstName: 'First name is required.',
      email: 'Enter a valid email address.',
    });
  });

  it('accepts configured values with valid formats', () => {
    expect(
      validateAnswers(fields, {
        firstName: 'Ada',
        email: 'ada@example.com',
        dateOfBirth: '1990-12-10',
      })
    ).toEqual({});
  });
});

describe('documentFileError', () => {
  it('allows only PDF, JPEG and PNG files up to 10 MiB', () => {
    expect(
      documentFileError(new File(['ok'], 'identity.pdf', { type: 'application/pdf' }))
    ).toBeNull();
    expect(documentFileError(new File(['bad'], 'identity.svg', { type: 'image/svg+xml' }))).toBe(
      'Choose a PDF, JPEG or PNG file.'
    );

    const oversized = new File(['x'], 'large.png', { type: 'image/png' });
    Object.defineProperty(oversized, 'size', { value: 10 * 1024 * 1024 + 1 });
    expect(documentFileError(oversized)).toBe('File must be 10 MB or smaller.');
  });
});
