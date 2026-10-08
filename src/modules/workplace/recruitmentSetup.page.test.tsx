// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import RecruitmentPage from './RecruitmentPage';
const request = vi.hoisted(() => vi.fn());
vi.mock('../../hooks/useGraphClient', () => {
  const client = { request };
  return { useGraphClient: () => client };
});
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    can: () => true,
    clientSession: { permissionScopes: { 'recruitment:manage': 'ALL' } },
  }),
}));
afterEach(() => {
  cleanup();
  request.mockReset();
});
it('loads job postings after the first page and preserves reverse navigation', async () => {
  const jobs = Array.from({ length: 22 }, (_, i) => ({
    id: `job-${i}`,
    title: `Job ${i}`,
    status: 'DRAFT',
    vacancies: 1,
  }));
  request.mockImplementation((_query, variables: { jobOffset: number }) =>
    Promise.resolve({
      jobPostings: jobs.slice(variables.jobOffset, variables.jobOffset + 21),
      applications: [],
    })
  );
  render(<RecruitmentPage />);
  await screen.findByText('Job 0');
  expect(screen.queryByText('Job 20')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Next job postings' }));
  await screen.findByText('Job 20');
  expect(request).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ jobOffset: 20 })
  );
  expect(screen.getByRole('button', { name: 'Next job postings' })).toHaveProperty(
    'disabled',
    true
  );
  fireEvent.click(screen.getByRole('button', { name: 'Previous job postings' }));
  await screen.findByText('Job 0');
});
