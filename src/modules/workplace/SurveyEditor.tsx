import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import SurveyAudienceEditor from './SurveyAudienceEditor';
import {
  blankQuestion,
  blankSection,
  type EditorSection,
  type SurveyDraft,
} from './surveyEditorModel';
import SurveyQuestionEditor from './SurveyQuestionEditor';

const fieldClass =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';
type DraftProps = { draft: SurveyDraft; setDraft: (draft: SurveyDraft) => void };
const SurveyHeaderEditor = ({ draft, setDraft, timezone }: DraftProps & { timezone: string }) => (
  <>
    <div className="grid gap-3 md:grid-cols-3">
      <label className="text-sm">
        Title
        <input
          className={fieldClass}
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
      </label>
      <label className="text-sm md:col-span-2">
        Description
        <input
          className={fieldClass}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </label>
      <label className="text-sm">
        Minimum reporting group
        <input
          className={fieldClass}
          type="number"
          min={3}
          step={1}
          value={draft.threshold}
          onChange={(e) => setDraft({ ...draft, threshold: Number(e.target.value) })}
        />
      </label>
      <label className="text-sm md:col-span-2">
        Response review
        <select
          className={fieldClass}
          value={draft.responseReviewMode}
          onChange={(e) =>
            setDraft({
              ...draft,
              responseReviewMode: e.target.value as SurveyDraft['responseReviewMode'],
            })
          }
        >
          <option value="ANONYMOUS_SUBMISSIONS">
            Grouped results and unnamed individual submissions
          </option>
          <option value="AGGREGATE_ONLY">Grouped results only</option>
        </select>
      </label>
      <label className="text-sm">
        Opens at ({timezone})
        <input
          className={fieldClass}
          type="datetime-local"
          value={draft.opensAt}
          onChange={(e) => setDraft({ ...draft, opensAt: e.target.value })}
        />
      </label>
      <label className="text-sm">
        Closes at ({timezone})
        <input
          className={fieldClass}
          type="datetime-local"
          value={draft.closesAt}
          onChange={(e) => setDraft({ ...draft, closesAt: e.target.value })}
        />
      </label>
    </div>
    <p className="rounded-md border border-line p-3 text-sm text-content-secondary">
      {draft.responseReviewMode === 'ANONYMOUS_SUBMISSIONS'
        ? 'Respondents will be told that authorized HR/Admin reviewers can review their answers together as an unnamed submission after the survey closes, even below the reporting threshold. Names are not shown; comments can still reveal identity.'
        : 'Respondents will be told that results are reported in groups. Written comments may be shown without names when the reporting threshold is met.'}{' '}
      Choose this before publishing; the review mode cannot change on a published survey.
    </p>
    <p className="text-xs text-content-secondary">
      Times use your tenant timezone. Blank opening means available when published; blank closing
      means manually closed. Copying a survey resets its schedule.
    </p>
    {draft.sourceSurveyId && (
      <p className="text-xs text-content-secondary">
        Correction of survey {draft.sourceSurveyId}. This creates a separate questionnaire and does
        not copy or alter earlier responses.
      </p>
    )}
  </>
);
const SectionEditor = ({
  section,
  onChange,
  onRemove,
}: {
  section: EditorSection;
  onChange: (section: EditorSection) => void;
  onRemove?: () => void;
}) => (
  <section className="space-y-3 rounded-md border border-line p-3">
    <div className="flex flex-wrap items-end gap-3">
      <label className="min-w-0 flex-1 text-sm">
        Section title
        <input
          className={fieldClass}
          value={section.title}
          onChange={(e) => onChange({ ...section, title: e.target.value })}
        />
      </label>
      {onRemove && (
        <Button size="sm" variant="quiet" onClick={onRemove}>
          Remove section
        </Button>
      )}
    </div>
    {section.questions.map((q) => (
      <SurveyQuestionEditor
        key={q.key}
        question={q}
        onChange={(question) =>
          onChange({
            ...section,
            questions: section.questions.map((current) =>
              current.key === q.key ? question : current
            ),
          })
        }
        onRemove={
          section.questions.length > 1
            ? () =>
                onChange({
                  ...section,
                  questions: section.questions.filter((current) => current.key !== q.key),
                })
            : undefined
        }
      />
    ))}
    <Button
      size="sm"
      variant="outline"
      onClick={() => onChange({ ...section, questions: [...section.questions, blankQuestion()] })}
    >
      Add question
    </Button>
  </section>
);
const SurveyEditor = ({
  draft,
  setDraft,
  timezone,
  busy,
  onSave,
  onCancel,
}: DraftProps & { timezone: string; busy: boolean; onSave: () => void; onCancel: () => void }) => (
  <Card title={draft.id ? 'Edit survey draft' : 'Create survey'}>
    <fieldset disabled={busy} className="space-y-4">
      <SurveyHeaderEditor draft={draft} setDraft={setDraft} timezone={timezone} />
      <SurveyAudienceEditor
        key={draft.id ?? draft.sourceSurveyId ?? 'new'}
        draft={draft}
        setDraft={setDraft}
      />
      {draft.sections.map((section) => (
        <SectionEditor
          key={section.key}
          section={section}
          onChange={(updated) =>
            setDraft({
              ...draft,
              sections: draft.sections.map((s) => (s.key === section.key ? updated : s)),
            })
          }
          onRemove={
            draft.sections.length > 1
              ? () =>
                  setDraft({
                    ...draft,
                    sections: draft.sections.filter((s) => s.key !== section.key),
                  })
              : undefined
          }
        />
      ))}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDraft({ ...draft, sections: [...draft.sections, blankSection()] })}
        >
          Add section
        </Button>
        <Button size="sm" busy={busy} onClick={onSave}>
          Save draft
        </Button>
        <Button size="sm" variant="quiet" onClick={onCancel}>
          {draft.id ? 'Cancel editing' : 'New blank draft'}
        </Button>
      </div>
    </fieldset>
  </Card>
);
export default SurveyEditor;
