// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import ContributionRuleEditor from './ContributionRuleEditor';

afterEach(cleanup);
it('requires a reason and does not infer a professional tax amount', () => {
  render(<ContributionRuleEditor current={null} busy={false} onSave={vi.fn()} />);
  expect(screen.getByLabelText('Rule reason')).toHaveProperty('required', true);
  expect(screen.getByLabelText('Monthly professional tax')).toHaveProperty('value', '');
});
