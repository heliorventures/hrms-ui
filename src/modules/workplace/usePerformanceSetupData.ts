import { useCallback, useEffect, useRef, useState } from 'react';

import { useGraphClient } from '../../hooks/useGraphClient';
import type { useKeyedAction } from '../../hooks/useKeyedAction';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import {
  AppraisalTemplatesDocument,
  PerformanceProgramsDocument,
  type AppraisalTemplateRow,
  type PerformanceProgramRow,
} from './performanceLifecycleQueries';

interface Props {
  run: ReturnType<typeof useKeyedAction>['run'];
  setError: (message: string) => void;
  showAdmin: boolean;
}

export const usePerformanceSetupData = ({ run, setError, showAdmin }: Props) => {
  const client = useGraphClient('client');
  const [programs, setPrograms] = useState<PerformanceProgramRow[]>([]);
  const [templates, setTemplates] = useState<AppraisalTemplateRow[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const templateRequest = useRef(0);

  const loadPrograms = useCallback(async () => {
    if (!showAdmin) return;
    const result = await client.request<{ performancePrograms: PerformanceProgramRow[] }>(
      PerformanceProgramsDocument
    );
    setPrograms(result.performancePrograms);
    setSelectedProgram((current) => current || result.performancePrograms[0]?.id || '');
  }, [client, showAdmin]);

  const loadTemplates = useCallback(async () => {
    const requestId = ++templateRequest.current;
    if (!selectedProgram || !showAdmin) {
      setTemplates([]);
      return;
    }
    const result = await client.request<{ appraisalTemplates: AppraisalTemplateRow[] }>(
      AppraisalTemplatesDocument,
      { programId: selectedProgram }
    );
    if (requestId !== templateRequest.current) return;
    setTemplates(result.appraisalTemplates);
    setSelectedTemplate((current) =>
      result.appraisalTemplates.some((item) => item.id === current && item.status === 'PUBLISHED')
        ? current
        : ''
    );
  }, [client, selectedProgram, showAdmin]);

  useEffect(() => {
    void run('programs', loadPrograms, '');
  }, [loadPrograms, run]);

  useEffect(() => {
    void loadTemplates().catch((cause) => setError(graphQlUserMessage(cause)));
  }, [loadTemplates, setError]);

  const selectProcess = useCallback((programId: string) => {
    setSelectedProgram(programId);
    setSelectedTemplate('');
  }, []);
  const publishedTemplates = templates.filter(
    (template) =>
      template.performanceProgramId === selectedProgram && template.status === 'PUBLISHED'
  );
  const launchTemplateId = selectedTemplate || publishedTemplates[0]?.id || '';

  return {
    launchTemplateId,
    loadPrograms,
    loadTemplates,
    publishedTemplates,
    programs,
    selectProcess,
    selectedProgram,
    selectedTemplate,
    setSelectedProgram,
    setSelectedTemplate,
    templates,
  };
};
