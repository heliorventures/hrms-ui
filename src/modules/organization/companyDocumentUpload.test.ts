import { describe, expect, it } from 'vitest';
import { buildCreateCompanyDocumentInput } from './companyDocumentUpload';

describe('company document staged-upload contract', () => {
  it('sends the opaque staged upload ID to document creation instead of a storage ID', () => {
    const input = buildCreateCompanyDocumentInput({
      category: 'COMPANY_POLICY',
      title: 'Employee handbook',
      description: 'Current version',
      stagedUploadId: 'stage_opaque_value',
      visibleToEmployees: true,
    });

    expect(input).toEqual({
      category: 'COMPANY_POLICY',
      title: 'Employee handbook',
      description: 'Current version',
      stagedUploadId: 'stage_opaque_value',
      visibleToEmployees: true,
    });
    expect('fileStorageId' in input).toBe(false);
  });
});
