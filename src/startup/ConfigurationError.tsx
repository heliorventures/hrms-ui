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
        <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded border border-status-danger/30 bg-status-danger/10 p-3 font-mono text-sm text-status-danger">
          <code>{configurationDetail(error)}</code>
        </pre>
      </section>
      <p className="mt-4 text-sm text-content-muted">
        Fix <code>public/config.json</code> and reload.
      </p>
    </main>
  );
};
