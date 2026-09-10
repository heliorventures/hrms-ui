// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RecruitmentPage from './RecruitmentPage';

const state = vi.hoisted(() => ({ client: { request: vi.fn() } }));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    can: () => true,
    clientSession: {
      permissions: new Set(['recruitment:manage']),
      permissionScopes: { 'recruitment:manage': 'ALL' },
    },
  }),
}));
afterEach(cleanup);

describe('Hiring feature workspace', () => {
  it('keeps job creation with openings and takes a job directly to its applicants', async () => {
    state.client.request.mockResolvedValue({
      jobPostings: [{ id: 'job-1', title: 'Engineer', vacancies: 1, status: 'OPEN' }],
      applications: [
        {
          id: 'a1',
          jobId: 'job-1',
          candidateName: 'Alice',
          candidateEmail: 'alice@example.com',
          status: 'NEW',
          appliedAt: '2026-09-01',
        },
        {
          id: 'a2',
          jobId: 'job-2',
          candidateName: 'Bob',
          candidateEmail: 'bob@example.com',
          status: 'NEW',
          appliedAt: '2026-09-01',
        },
      ],
    });
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <RecruitmentPage />
      </MemoryRouter>
    );
    expect(await screen.findByText('Engineer')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create job opening' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'View applicants for Engineer' }));
    expect(screen.queryByRole('button', { name: 'Create job opening' })).toBeNull();
    expect(screen.getByRole('tabpanel').textContent).toContain('Alice');
    expect(screen.getByRole('tabpanel').textContent).not.toContain('Bob');
    fireEvent.click(screen.getByRole('button', { name: 'Show all applicants' }));
    expect(screen.getByRole('tabpanel').textContent).toContain('Bob');
  });
});
