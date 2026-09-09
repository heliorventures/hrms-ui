// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';

import AssetOptionPicker from './AssetOptionPicker';
import { emptyPageInfo } from './assetTypes';

afterEach(cleanup);

it('keeps search inside the picker and never submits the enclosing asset form', () => {
  const submit = vi.fn();
  const Form = () => {
    const [value, setValue] = useState('');
    const [filter, setFilter] = useState({ page: 1, perPage: 15, search: '' });
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <AssetOptionPicker
          label="Category"
          value={value}
          options={filter.search === 'Laptop' ? [{ value: 'laptop', label: 'Laptops' }] : []}
          filter={filter}
          pageInfo={emptyPageInfo(15)}
          loading={false}
          emptyLabel="All categories"
          onChange={setValue}
          onFilterChange={setFilter}
        />
      </form>
    );
  };
  const { container } = render(<Form />);
  expect(container.querySelectorAll('form')).toHaveLength(1);
  expect(screen.queryByRole('textbox', { name: 'Search category' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /All categories/ }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Search category' }), {
    target: { value: 'Laptop' },
  });
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search category' }), { key: 'Enter' });
  fireEvent.click(screen.getByRole('button', { name: 'Laptops' }));
  expect(screen.queryByRole('textbox', { name: 'Search category' })).toBeNull();
  expect(screen.getByRole('button', { name: /Laptops/ })).toBeTruthy();
  expect(submit).not.toHaveBeenCalled();
});
