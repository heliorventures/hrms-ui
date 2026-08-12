import { describe, expect, it } from 'vitest';
import {
  buildCreateAnnouncementInput,
  type AnnouncementFileInputFields,
} from './createAnnouncementInput';

const emptyFiles: AnnouncementFileInputFields = {
  imageFileName: null,
  imageMimeType: null,
  imageContentBase64: null,
  documentFileName: null,
  documentMimeType: null,
  documentContentBase64: null,
};

describe('buildCreateAnnouncementInput', () => {
  it('forces staff announcements to employee posts without admin targeting', () => {
    const input = buildCreateAnnouncementInput(
      {
        hrCompose: false,
        title: '  System update  ',
        body: '  Read this  ',
        targetAudience: 'Engineering',
        targetDepartmentId: 'dept-1',
        targetLocationId: 'loc-1',
        targetRoleCode: 'HR_ADMIN',
        publishAt: '2026-08-12T08:00:00.000Z',
        expiresAt: '2026-08-13T08:00:00.000Z',
        employeePost: false,
      },
      emptyFiles
    );

    expect(input).toMatchObject({
      title: 'System update',
      body: 'Read this',
      targetAudience: null,
      targetDepartmentId: null,
      targetLocationId: null,
      targetRoleCode: null,
      publishAt: null,
      expiresAt: null,
      employeePost: true,
    });
  });

  it('keeps HR announcement targeting when the user can manage notifications', () => {
    const input = buildCreateAnnouncementInput(
      {
        hrCompose: true,
        title: 'Policy',
        body: '',
        targetAudience: 'Engineering',
        targetDepartmentId: 'dept-1',
        targetLocationId: 'loc-1',
        targetRoleCode: '',
        publishAt: '2026-08-12T08:00:00.000Z',
        expiresAt: '2026-08-13T08:00:00.000Z',
        employeePost: false,
      },
      emptyFiles
    );

    expect(input).toMatchObject({
      body: null,
      targetAudience: 'Engineering',
      targetDepartmentId: 'dept-1',
      targetLocationId: 'loc-1',
      targetRoleCode: null,
      publishAt: '2026-08-12T08:00:00.000Z',
      expiresAt: '2026-08-13T08:00:00.000Z',
      employeePost: false,
    });
  });
});
