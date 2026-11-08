import { useCallback, useEffect, useMemo, useState } from 'react';

import { useFeedbackState } from '../../../hooks/useFeedbackState';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  COMPENSATION_BOARD_QUERY,
  defaultComponentForm,
  defaultLineDraft,
  today,
} from '../payrollCompensationQueries';
import type {
  BoardResult,
  ComponentForm,
  StructureDraftLine,
  AssignmentForm,
} from '../payrollCompensationTypes';

export const useCompensationState = () => {
  const client = useGraphClient('client');
  const [board, setBoard] = useState<BoardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useFeedbackState<string | null>(null, 'error');
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [actionError, setActionError] = useFeedbackState<string | null>(null, 'error');
  const [componentForm, setComponentForm] = useState<ComponentForm>(defaultComponentForm);
  const [structureName, setStructureName] = useState('');
  const [structureDescription, setStructureDescription] = useState('');
  const [structureLines, setStructureLines] = useState<StructureDraftLine[]>([]);
  const [lineDraft, setLineDraft] = useState<StructureDraftLine>(defaultLineDraft);
  const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>({
    employeeId: '',
    salaryStructureId: '',
    annualCtc: '',
    effectiveFrom: today(),
  });
  const [previewRevision, setPreviewRevision] = useState(0);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.request<BoardResult>(COMPENSATION_BOARD_QUERY, {
        employeeLimit: 300,
      });
      setBoard(result);
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setLoading(false);
    }
  }, [client, setError]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedEmployee = useMemo(
    () => board?.employees.find((employee) => employee.id === assignmentForm.employeeId),
    [assignmentForm.employeeId, board?.employees]
  );

  return {
    client,
    board,
    loading,
    error,
    busy,
    ok,
    actionError,
    componentForm,
    setComponentForm,
    structureName,
    setStructureName,
    structureDescription,
    setStructureDescription,
    structureLines,
    setStructureLines,
    lineDraft,
    setLineDraft,
    assignmentForm,
    setAssignmentForm,
    previewRevision,
    setPreviewRevision,
    setBusy,
    setOk,
    setActionError,
    load,
    selectedEmployee,
  };
};
export type CompensationState = ReturnType<typeof useCompensationState>;
