import { GraphQLClient } from 'graphql-request';
import { afterEach, expect, it, vi } from 'vitest';

import { uploadTenantFile } from './tenantFileUpload';

const encoding = vi.hoisted(() => ({ run: vi.fn() }));
vi.mock('./fileEncoding', () => ({ fileToBase64: encoding.run }));
afterEach(() => {
  vi.restoreAllMocks();
  encoding.run.mockReset();
});
it('does not upload private content when ownership changes while file encoding is pending', async () => {
  let finishEncoding!: (value: { name: string; mime: string; b64: string }) => void;
  encoding.run.mockReturnValue(
    new Promise((resolve) => {
      finishEncoding = resolve;
    })
  );
  const client = new GraphQLClient('/graphql');
  const request = vi
    .spyOn(client, 'request')
    .mockResolvedValue({ uploadTenantFile: { id: 'private-file' } });
  let active = true;
  const upload = uploadTenantFile(client, new File(['private'], 'private.pdf'), () => active);
  active = false;
  finishEncoding({ name: 'private.pdf', mime: 'application/pdf', b64: 'private-content' });
  await expect(upload).rejects.toThrow('File upload canceled');
  expect(request).not.toHaveBeenCalled();
});
