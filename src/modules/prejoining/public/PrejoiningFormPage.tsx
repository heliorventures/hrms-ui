import Button from '../../../components/common/Button';

import {
  CandidateField,
  ChangesNotice,
  DocumentRow,
  FailurePage,
  PublicShell,
  StatusPage,
} from './PrejoiningFormView';
import type { PrejoiningPublicClient } from './types';
import { usePrejoiningFormController } from './usePrejoiningFormController';

const editableStatuses = new Set(['DRAFT', 'CHANGES_REQUESTED']);
const PageHeader = () => (
  <header className="mb-5">
    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
      Private pre-joining form
    </div>
    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
      Complete your pre-joining details
    </h1>
    <p className="mt-2 text-sm leading-6 text-content-secondary">
      Provide the requested information for HR. You can save a draft before submitting.
    </p>
  </header>
);
const PrejoiningFormPage = ({ client }: { client?: PrejoiningPublicClient }) => {
  const controller = usePrejoiningFormController({ client });
  const { form } = controller;
  if (controller.failure)
    return (
      <FailurePage
        kind={controller.failure}
        retry={
          controller.failure === 'network' || controller.failure === 'unknown'
            ? controller.retry
            : undefined
        }
      />
    );
  if (!form)
    return (
      <PublicShell>
        <div role="status" className="mx-auto mt-[20vh] text-center text-sm text-content-secondary">
          Loading your secure form…
        </div>
      </PublicShell>
    );
  if (!editableStatuses.has(form.status)) return <StatusPage form={form} />;
  return (
    <PublicShell>
      <PageHeader />
      {form.status === 'CHANGES_REQUESTED' ? <ChangesNotice feedback={form.feedback} /> : null}
      <form
        className="space-y-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void controller.write(true);
        }}
      >
        <fieldset disabled={controller.mutating} className="contents">
          <section
            className="rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5"
            aria-labelledby="details-title"
          >
            <h2 id="details-title" className="mb-4 text-base font-semibold">
              Personal details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {form.config.fields.map((field) => (
                <CandidateField
                  key={field.key}
                  field={field}
                  value={controller.answers[field.key] || ''}
                  error={controller.errors[field.key]}
                  disabled={controller.mutating}
                  onChange={(value) => controller.setAnswer(field.key, value)}
                />
              ))}
            </div>
          </section>
          {form.config.documents.length ? (
            <section
              className="rounded-xl border border-line bg-surface p-4 shadow-card sm:p-5"
              aria-labelledby="documents-title"
            >
              <h2 id="documents-title" className="text-base font-semibold">
                Documents
              </h2>
              <p className="mb-4 mt-1 text-sm text-content-muted">
                Files stay private and are checked again before access.
              </p>
              <div className="space-y-3">
                {form.config.documents.map((requirement) => {
                  const document = form.documents.find(
                    (item) => item.requirementId === requirement.id
                  );
                  return (
                    <DocumentRow
                      key={requirement.id}
                      label={requirement.label}
                      required={requirement.required}
                      document={document}
                      disabled={controller.mutating}
                      progress={controller.mutating ? controller.uploadProgress : null}
                      error={controller.errors[`document:${requirement.id}`]}
                      onUpload={(file) => void controller.uploadDocument(requirement.id, file)}
                      onDelete={() => {
                        if (document) void controller.deleteDocument(document);
                      }}
                      onDownload={() => {
                        if (document) void controller.downloadDocument(document);
                      }}
                    />
                  );
                })}
              </div>
            </section>
          ) : null}
        </fieldset>
        {controller.message ? (
          <p
            role="status"
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content-secondary"
          >
            {controller.message}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={controller.mutating}
            onClick={() => void controller.write(false)}
          >
            Save draft
          </Button>
          <Button type="submit" busy={controller.mutating} disabled={controller.mutating}>
            Submit details
          </Button>
        </div>
      </form>
    </PublicShell>
  );
};
export default PrejoiningFormPage;
