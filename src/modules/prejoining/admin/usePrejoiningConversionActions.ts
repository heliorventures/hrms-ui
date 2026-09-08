import type { PrejoiningActionContext } from './prejoiningActionContext';
import {
  PrejoiningConfirmJoinedAdminDocument,
  PrejoiningConversionDirectoryDocument,
} from './prejoiningAdminDocuments';
import { emptyConfirm } from './prejoiningAdminHelpers';
import type { PrejoiningCandidate } from './prejoiningAdminTypes';
import { validateConfirmJoined } from './prejoiningAdminValidation';

export function usePrejoiningConversionActions(context: PrejoiningActionContext) {
  const { client, ownerRef, ownerToken, runAction, applyCandidate } = context;
  const {
    selected,
    setNotice,
    setConfirmOpen,
    confirmDraft,
    setConfirmDraft,
    setConfirmError,
    setDepartments,
    setDesignations,
    setManagers,
    setManagerSearch,
    setManagerOffset,
    setHasMoreManagers,
    setRoles,
  } = context.state;
  const loadConversionOptions = (search: string, nextOffset: number, append: boolean) =>
    runAction('directory', async () => {
      const result = await client.request<{
        prejoiningConversionOptions: {
          departments: Array<{ id: string; name: string }>;
          designations: Array<{ id: string; title: string }>;
          managers: Array<{ id: string; fullName: string; employeeCode: string }>;
          roles: Array<{ id: string; name: string }>;
          hasMoreManagers: boolean;
        };
      }>(PrejoiningConversionDirectoryDocument, {
        managerSearch: search.trim() || null,
        managerOffset: nextOffset,
      });
      if (ownerRef.current !== ownerToken) return;
      const options = result.prejoiningConversionOptions;
      setDepartments(options.departments.map((row) => ({ id: row.id, label: row.name })));
      setDesignations(options.designations.map((row) => ({ id: row.id, label: row.title })));
      const nextManagers = options.managers.map((row) => ({
        id: row.id,
        label: `${row.fullName} (${row.employeeCode})`,
      }));
      setManagers((current) =>
        append
          ? [
              ...current,
              ...nextManagers.filter((row) => !current.some((existing) => existing.id === row.id)),
            ]
          : nextManagers
      );
      setRoles(options.roles.map((row) => ({ id: row.id, label: row.name })));
      setManagerOffset(nextOffset);
      setHasMoreManagers(options.hasMoreManagers);
    });

  const openConfirm = () =>
    void runAction('directory', async () => {
      const result = await client.request<{
        prejoiningConversionOptions: {
          departments: Array<{ id: string; name: string }>;
          designations: Array<{ id: string; title: string }>;
          managers: Array<{ id: string; fullName: string; employeeCode: string }>;
          roles: Array<{ id: string; name: string }>;
          hasMoreManagers: boolean;
        };
      }>(PrejoiningConversionDirectoryDocument, { managerSearch: null, managerOffset: 0 });
      if (ownerRef.current !== ownerToken) return;
      const options = result.prejoiningConversionOptions;
      setDepartments(options.departments.map((row) => ({ id: row.id, label: row.name })));
      setDesignations(options.designations.map((row) => ({ id: row.id, label: row.title })));
      setManagers(
        options.managers.map((row) => ({
          id: row.id,
          label: `${row.fullName} (${row.employeeCode})`,
        }))
      );
      setRoles(options.roles.map((row) => ({ id: row.id, label: row.name })));
      setManagerSearch('');
      setManagerOffset(0);
      setHasMoreManagers(options.hasMoreManagers);
      setConfirmDraft({ ...emptyConfirm(), username: selected?.email ?? '' });
      setConfirmError(null);
      setConfirmOpen(true);
    });

  const confirmJoined = () => {
    if (!selected) return;
    const validation = validateConfirmJoined(confirmDraft);
    setConfirmError(validation);
    if (validation) return;
    void runAction('confirm', async () => {
      const input = {
        candidateId: selected.id,
        revision: selected.revision,
        employeeCode: confirmDraft.employeeCode.trim(),
        dateOfJoining: confirmDraft.dateOfJoining,
        departmentId: confirmDraft.departmentId || null,
        designationId: confirmDraft.designationId || null,
        reportingManagerId: confirmDraft.reportingManagerId || null,
        employmentType: confirmDraft.employmentType.trim() || null,
        username: confirmDraft.username.trim(),
        initialPassword: confirmDraft.initialPassword,
        roleIds: confirmDraft.roleIds,
      };
      const result = await client.request<{ confirmPrejoiningJoined: PrejoiningCandidate }>(
        PrejoiningConfirmJoinedAdminDocument,
        { input }
      );
      if (ownerRef.current !== ownerToken) return;
      applyCandidate(result.confirmPrejoiningJoined);
      setConfirmOpen(false);
      setConfirmDraft(emptyConfirm());
      setNotice(
        `Employee and login created${result.confirmPrejoiningJoined.employeeId ? ` (${result.confirmPrejoiningJoined.employeeId})` : ''}.`
      );
    });
  };

  return { loadConversionOptions, openConfirm, confirmJoined };
}
