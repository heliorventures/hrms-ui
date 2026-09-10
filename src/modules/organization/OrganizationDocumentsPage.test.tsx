// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import OrganizationDocumentsPage from './OrganizationDocumentsPage';

const state = vi.hoisted(() => ({
  client: { request: vi.fn() },
  stageFile: vi.fn(),
}));
vi.mock('../../hooks/useGraphClient', () => ({ useGraphClient: () => state.client }));
vi.mock('../../contexts/AuthContext', () => ({ useAuth: () => ({ canAny: () => true }) }));
vi.mock('../../contexts/DialogContext', () => ({ useDialogs: () => ({ confirm: vi.fn() }) }));
vi.mock('./companyDocumentUpload', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./companyDocumentUpload')>()),
  stageCompanyDocumentFile: state.stageFile,
}));
afterEach(cleanup);

it('keeps the selected file visible across closing and reopening, then clears it after upload', async () => {
  state.client.request.mockResolvedValue({
    companyDocuments: [],
    documentTypes: [],
    employeeDocuments: [],
  });
  state.stageFile.mockResolvedValue('stage-1');
  const user = userEvent.setup();
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <OrganizationDocumentsPage />
    </MemoryRouter>
  );
  await user.click(await screen.findByRole('button', { name: 'Add Company Document' }));
  await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Handbook');
  const file = new File(['%PDF-1.4'], 'handbook.pdf', { type: 'application/pdf' });
  await user.upload(screen.getByLabelText('Document File'), file);
  await user.click(screen.getByRole('button', { name: 'Back to document library' }));
  await user.click(screen.getByRole('button', { name: 'Add Company Document' }));
  expect((screen.getByLabelText('Document File') as HTMLInputElement).files?.[0]).toBe(file);
  await user.click(screen.getByRole('button', { name: 'Upload Document' }));
  await waitFor(() =>
    expect(screen.getByText('Company document uploaded successfully.')).toBeTruthy()
  );
  await user.click(screen.getByRole('button', { name: 'Add Company Document' }));
  expect((screen.getByLabelText('Document File') as HTMLInputElement).files?.length).toBe(0);
  expect((screen.getByRole('textbox', { name: 'Title' }) as HTMLInputElement).value).toBe('');
});
