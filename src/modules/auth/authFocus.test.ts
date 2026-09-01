// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';

import { focusFirstInvalidField } from './authFocus';

type FieldName = 'username' | 'password' | 'captcha';

function inputRef() {
  const input = document.createElement('input');
  document.body.append(input);
  return { current: input };
}

describe('focusFirstInvalidField', () => {
  it('focuses and returns the first invalid field in the supplied order', () => {
    const refs = {
      username: inputRef(),
      password: inputRef(),
      captcha: inputRef(),
    };

    const focused = focusFirstInvalidField<FieldName>(
      { password: 'Required', captcha: 'Incorrect' },
      ['username', 'password', 'captcha'],
      refs
    );

    expect(focused).toBe('password');
    expect(document.activeElement).toBe(refs.password.current);
  });

  it('returns null without changing focus when no field has an error', () => {
    const existingTarget = inputRef();
    existingTarget.current.focus();
    const refs = {
      username: inputRef(),
      password: inputRef(),
      captcha: inputRef(),
    };

    const focused = focusFirstInvalidField<FieldName>(
      {},
      ['username', 'password', 'captcha'],
      refs
    );

    expect(focused).toBeNull();
    expect(document.activeElement).toBe(existingTarget.current);
  });
});
