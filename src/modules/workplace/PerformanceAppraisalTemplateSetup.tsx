import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import PerformanceDraftQuestionEditor from './PerformanceDraftQuestionEditor';
import { performanceFieldClass, type DraftQuestion } from './performanceDraftQuestion';
import type { AppraisalTemplateRow } from './performanceLifecycleQueries';

interface Props {
  isBusy: (key: string) => boolean;
  onAddQuestion: () => void;
  onPublishTemplate: (templateId: string) => void;
  onRemoveQuestion: (index: number) => void;
  onSaveTemplate: () => void;
  onTemplateNameChange: (templateName: string) => void;
  onUpdateQuestion: (index: number, patch: Partial<DraftQuestion>) => void;
  questions: DraftQuestion[];
  selectedProgram: string;
  templateName: string;
  templates: AppraisalTemplateRow[];
}

const PerformanceAppraisalTemplateSetup = ({
  isBusy,
  onAddQuestion,
  onPublishTemplate,
  onRemoveQuestion,
  onSaveTemplate,
  onTemplateNameChange,
  onUpdateQuestion,
  questions,
  selectedProgram,
  templateName,
  templates,
}: Props) => (
  <Card title="Appraisal questionnaire">
    <label className="text-sm">
      Template name
      <input
        className={performanceFieldClass}
        value={templateName}
        onChange={(event) => onTemplateNameChange(event.target.value)}
      />
    </label>
    <div className="mt-3 space-y-3">
      {questions.map((question, index) => (
        <PerformanceDraftQuestionEditor
          key={question.key}
          index={index}
          onChange={(patch) => onUpdateQuestion(index, patch)}
          onRemove={() => onRemoveQuestion(index)}
          question={question}
          questions={questions}
        />
      ))}
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      <Button size="sm" variant="outline" onClick={onAddQuestion}>
        Add question
      </Button>
      <Button size="sm" busy={isBusy(`save-template:${selectedProgram}`)} onClick={onSaveTemplate}>
        Save template
      </Button>
    </div>
    {templates.length > 0 && (
      <ul className="mt-4 divide-y divide-line">
        {templates
          .filter((template) => template.performanceProgramId === selectedProgram)
          .map((template) => (
            <li key={template.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span>
                {template.name} v{template.version} · {template.status}
              </span>
              {template.status === 'DRAFT' && (
                <Button
                  busy={isBusy(`publish:${template.id}`)}
                  size="sm"
                  variant="outline"
                  onClick={() => onPublishTemplate(template.id)}
                >
                  Publish
                </Button>
              )}
            </li>
          ))}
      </ul>
    )}
  </Card>
);

export default PerformanceAppraisalTemplateSetup;
