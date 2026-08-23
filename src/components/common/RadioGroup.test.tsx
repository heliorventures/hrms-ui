// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEventLibrary from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import RadioGroup from './RadioGroup';

afterEach(cleanup);

describe('RadioGroup', () => {
  it('uses a native labelled group and one hit target per enabled option', async () => {
    const user = userEventLibrary.setup();
    const onChange = vi.fn();
    render(
      <RadioGroup
        label="Employment type"
        name="employmentType"
        value="permanent"
        onChange={onChange}
        options={[
          { value: 'permanent', label: 'Permanent' },
          { value: 'contract', label: 'Contract', description: 'Fixed-term engagement.' },
          { value: 'former', label: 'Former employee', disabled: true },
        ]}
      />
    );

    const group = screen.getByRole('radiogroup', { name: 'Employment type' });
    const contract = screen.getByLabelText<HTMLInputElement>('Contract');
    expect(group.contains(contract)).toBe(true);
    expect(screen.getByText('Contract').closest('label')?.className).toContain('min-h-11');
    expect(screen.getByLabelText<HTMLInputElement>('Former employee').disabled).toBe(true);

    await user.click(screen.getByText('Contract'));
    expect(onChange).toHaveBeenCalledWith('contract');
    await user.click(screen.getByText('Former employee'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('uses stable opaque DOM IDs independent of unrestricted business values', () => {
    const options = [
      {
        value: 'part time / contractor#1',
        label: 'Part-time contractor',
        description: 'Value contains spaces and reserved characters.',
      },
    ];
    const view = render(
      <RadioGroup
        label="Employment type"
        name="employmentType"
        value="part time / contractor#1"
        onChange={() => undefined}
        options={options}
      />
    );

    const radio = screen.getByLabelText<HTMLInputElement>('Part-time contractor');
    const initialId = radio.id;
    expect(initialId).not.toContain(options[0].value);
    expect(initialId).not.toMatch(/[\s/#]/);
    expect(document.getElementById(radio.getAttribute('aria-labelledby') ?? '')?.textContent).toBe(
      'Part-time contractor'
    );
    expect(document.getElementById(radio.getAttribute('aria-describedby') ?? '')?.textContent).toBe(
      'Value contains spaces and reserved characters.'
    );

    view.rerender(
      <RadioGroup
        label="Employment type"
        name="employmentType"
        value="part time / contractor#1"
        onChange={() => undefined}
        options={options}
      />
    );
    expect(radio.id).toBe(initialId);
    expect(radio.value).toBe(options[0].value);
  });

  it('keeps native radio semantics and supports keyboard activation', async () => {
    const user = userEventLibrary.setup();
    const onChange = vi.fn();

    const Harness = () => {
      const [value, setValue] = useState('permanent');
      return (
        <RadioGroup
          label="Employment type"
          name="employmentType"
          value={value}
          onChange={(nextValue) => {
            onChange(nextValue);
            setValue(nextValue);
          }}
          options={[
            { value: 'permanent', label: 'Permanent' },
            { value: 'contract', label: 'Contract' },
          ]}
        />
      );
    };

    render(<Harness />);
    const contract = screen.getByLabelText<HTMLInputElement>('Contract');
    expect(contract.type).toBe('radio');
    expect(contract.name).toBe('employmentType');
    expect(contract.value).toBe('contract');
    contract.focus();
    await user.keyboard('[Space]');
    expect(onChange).toHaveBeenCalledWith('contract');
    expect(contract.checked).toBe(true);
  });

  it('associates a visible error with the group and announces it', () => {
    render(
      <RadioGroup
        label="Work mode"
        name="workMode"
        value=""
        onChange={() => undefined}
        error="Choose a work mode."
        options={[{ value: 'office', label: 'Office' }]}
      />
    );

    const group = screen.getByRole('radiogroup', { name: 'Work mode' });
    expect(group.getAttribute('aria-invalid')).toBe('true');
    expect(group.getAttribute('aria-describedby')).toBe(screen.getByRole('alert').id);
  });
});
