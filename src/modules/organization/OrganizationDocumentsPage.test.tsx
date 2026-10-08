// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CreateCompanyDocumentDocument } from '../../api/graphql/graphql';
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
beforeEach(() => {
  state.client.request.mockReset();
  state.stageFile.mockReset();
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

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
  await user.selectOptions(
    screen.getByRole('combobox', { name: /Document Category/ }),
    'COMPANY_POLICY'
  );
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

it('requires an explicit category and saves the selected category for library filtering', async () => {
  const created = {
    id: 'doc-onboarding',
    category: 'ONBOARDING',
    title: 'Joining checklist',
    description: null,
    originalFileName: 'checklist.pdf',
    mimeType: 'application/pdf',
    visibleToEmployees: true,
    createdAt: '2026-10-07T00:00:00Z',
    updatedAt: '2026-10-07T00:00:00Z',
  };
  state.client.request.mockImplementation((document: unknown) => {
    if (document === CreateCompanyDocumentDocument)
      return Promise.resolve({ createCompanyDocument: created });
    return Promise.resolve({
      companyDocuments: [created],
      documentTypes: [],
      employeeDocuments: [],
    });
  });
  state.stageFile.mockResolvedValue('stage-onboarding');
  const user = userEvent.setup();
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <OrganizationDocumentsPage />
    </MemoryRouter>
  );
  await user.click(await screen.findByRole('button', { name: 'Add Company Document' }));
  const category = screen.getByRole<HTMLSelectElement>('combobox', { name: /Document Category/ });
  expect(category.value).toBe('');
  expect(category.required).toBe(true);
  await user.type(screen.getByRole('textbox', { name: 'Title' }), 'Joining checklist');
  await user.upload(
    screen.getByLabelText('Document File'),
    new File(['%PDF-1.4'], 'checklist.pdf', { type: 'application/pdf' })
  );
  await user.click(screen.getByRole('button', { name: 'Upload Document' }));
  expect(category.checkValidity()).toBe(false);
  expect(state.stageFile).not.toHaveBeenCalled();
  expect(state.client.request).not.toHaveBeenCalledWith(
    CreateCompanyDocumentDocument,
    expect.anything()
  );
  await user.selectOptions(category, 'ONBOARDING');
  await user.click(screen.getByRole('button', { name: 'Upload Document' }));
  await waitFor(() =>
    expect(state.client.request).toHaveBeenCalledWith(CreateCompanyDocumentDocument, {
      input: {
        category: 'ONBOARDING',
        title: 'Joining checklist',
        description: null,
        stagedUploadId: 'stage-onboarding',
        visibleToEmployees: true,
      },
    })
  );
  await screen.findByText('Company document uploaded successfully.');
  await user.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'ONBOARDING');
  expect(screen.getByRole('button', { name: /^Joining checklist/ })).toBeTruthy();
  await user.selectOptions(screen.getByRole('combobox', { name: 'Category' }), 'COMPANY_POLICY');
  expect(await screen.findByText('No documents match your filters.')).toBeTruthy();
});
