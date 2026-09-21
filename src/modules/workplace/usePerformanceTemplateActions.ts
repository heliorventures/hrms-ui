import { useCallback, useState } from 'react';

import { useGraphClient } from '../../hooks/useGraphClient';
import type { useKeyedAction } from '../../hooks/useKeyedAction';

import { blankDraftQuestion, type DraftQuestion } from './performanceDraftQuestion';
import {
  PublishAppraisalTemplateDocument,
  SaveAppraisalTemplateDocument,
} from './performanceLifecycleQueries';

interface Props {
  loadTemplates: () => Promise<void>;
  run: ReturnType<typeof useKeyedAction>['run'];
  selectedProgram: string;
}

const templatePayload = (
  selectedProgram: string,
  templateName: string,
  questions: DraftQuestion[]
) => ({
  performanceProgramId: selectedProgram,
  name: templateName,
  sections: [
    {
      title: 'Appraisal',
      questions: questions.map((question) => ({
        clientKey: question.key,
        parentClientKey: question.parentKey || null,
        questionType: question.type,
        prompt: question.prompt,
        isRequired: question.isRequired,
        answerer: question.answerer,
        selfRatingEnabled: question.selfRating,
        managerRatingEnabled: question.managerRating,
        options: question.options
          .split(',')
          .map((label) => label.trim())
          .filter(Boolean)
          .map((label, optionIndex) => ({ label, score: String(optionIndex + 1) })),
      })),
    },
  ],
});

export const usePerformanceTemplateActions = ({ loadTemplates, run, selectedProgram }: Props) => {
  const client = useGraphClient('client');
  const [templateName, setTemplateName] = useState('Standard appraisal');
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankDraftQuestion(1)]);

  const updateQuestion = useCallback((index: number, patch: Partial<DraftQuestion>) => {
    setQuestions((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question
      )
    );
  }, []);

  const addQuestion = useCallback(() => {
    setQuestions((current) => [...current, blankDraftQuestion(current.length + 1)]);
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setQuestions((current) => current.filter((_, questionIndex) => questionIndex !== index));
  }, []);

  const saveTemplate = useCallback(() => {
    void run(
      `save-template:${selectedProgram}`,
      async () => {
        await client.request(SaveAppraisalTemplateDocument, {
          input: templatePayload(selectedProgram, templateName, questions),
        });
        await loadTemplates();
      },
      'Appraisal template saved.'
    );
  }, [client, loadTemplates, questions, run, selectedProgram, templateName]);

  const publishTemplate = useCallback(
    (templateId: string) => {
      void run(
        `publish:${templateId}`,
        async () => {
          await client.request(PublishAppraisalTemplateDocument, { id: templateId });
          await loadTemplates();
        },
        'Template published.'
      );
    },
    [client, loadTemplates, run]
  );

  return {
    addQuestion,
    publishTemplate,
    questions,
    removeQuestion,
    saveTemplate,
    setTemplateName,
    templateName,
    updateQuestion,
  };
};
