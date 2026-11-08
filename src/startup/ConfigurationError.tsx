import FeedbackToast from '../components/common/FeedbackToast';
export interface ConfigurationErrorProps {
  error: unknown;
}

function configurationDetail(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export const ConfigurationError = ({ error }: ConfigurationErrorProps) => {
  return (
    <main className="max-w-lg p-6 font-sans text-content-primary">
      <h1 className="text-lg font-semibold">Configuration error</h1>
      <section className="mt-4" aria-label="Technical configuration detail for deployers">
        <FeedbackToast variant={'error'}>
          <code>{configurationDetail(error)}</code>
        </FeedbackToast>
      </section>
      <p className="mt-4 text-sm text-content-muted">
        Fix <code>public/config.json</code> and reload.
      </p>
    </main>
  );
};
