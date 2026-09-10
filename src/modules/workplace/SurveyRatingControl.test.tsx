// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import SurveyRatingControl from './SurveyRatingControl';

afterEach(cleanup);

describe('SurveyRatingControl', () => {
  it('offers labelled native star radios and shows the selected score', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <SurveyRatingControl
        name="support"
        label="Support rating"
        min="1"
        max="5"
        value=""
        onChange={onChange}
      />
    );
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    fireEvent.click(screen.getByRole('radio', { name: '4 out of 5 stars' }));
    expect(onChange).toHaveBeenCalledWith('4');
    rerender(
      <SurveyRatingControl
        name="support"
        label="Support rating"
        min="1"
        max="5"
        value="4"
        onChange={onChange}
      />
    );
    expect(screen.getByRole<HTMLInputElement>('radio', { name: '4 out of 5 stars' }).checked).toBe(
      true
    );
    expect(screen.getByText('4 / 5')).toBeTruthy();
  });
  it('preserves decimal legacy ranges with a slider and no implicit answer', () => {
    const onChange = vi.fn();
    render(
      <SurveyRatingControl
        name="legacy"
        label="Legacy rating"
        min="0.5"
        max="2.5"
        value=""
        onChange={onChange}
      />
    );
    expect(screen.getByText('No rating selected')).toBeTruthy();
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1.75' } });
    expect(onChange).toHaveBeenCalledWith('1.75');
  });
  it('supports keyboard selection and disabled published previews', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <SurveyRatingControl
        name="keyboard"
        label="Rating"
        min="1"
        max="10"
        value=""
        onChange={onChange}
      />
    );
    await user.tab();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith('1');
    onChange.mockClear();
    rerender(
      <fieldset disabled>
        <SurveyRatingControl
          name="keyboard"
          label="Rating"
          min="1"
          max="10"
          value=""
          onChange={onChange}
        />
      </fieldset>
    );
    await user.click(screen.getByRole('radio', { name: '3 out of 10 stars' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
