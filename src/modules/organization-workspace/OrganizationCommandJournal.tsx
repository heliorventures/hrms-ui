import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import ConfirmOrganizationAction from './ConfirmOrganizationAction';
import { commandPresentation, commandRecoveryMessage } from './organizationCommand';
import type { TrackedOrganizationCommand } from './organizationCommandTransport';
import SourceCompanyLabel from './SourceCompanyLabel';

interface Props {
  commands: TrackedOrganizationCommand[];
  retry: (id: string) => Promise<void>;
  check: (id: string) => Promise<void>;
  cancel: (id: string) => Promise<void>;
}

const OrganizationCommandJournal = ({ commands, retry, check, cancel }: Props) => {
  if (commands.length === 0) return null;
  return (
    <Card title="Source company confirmations">
      <p className="mb-3 text-sm text-content-secondary">
        Pending commands retain their reference for source status checks. Retry is available while
        the original command details remain in this session.
      </p>
      <ul className="space-y-3">
        {commands.map((entry) => {
          const status = commandPresentation(entry.outcome?.status ?? '');
          const recovery = commandRecoveryMessage(entry.outcome?.result);
          return (
            <li
              key={entry.intent.commandId}
              className="space-y-2 rounded-lg border border-line p-3"
            >
              <SourceCompanyLabel name={entry.companyName} />
              <p role="status">{status.label}</p>
              {recovery ? <p className="text-sm">{recovery}</p> : null}
              <p className="text-xs text-content-secondary">Reference: {entry.intent.commandId}</p>
              {entry.error ? (
                <p role="alert">
                  {entry.error} Check source confirmation before starting another action.
                </p>
              ) : null}
              {!entry.canRetry && status.pending ? (
                <p className="text-sm text-content-secondary">
                  {['account_create', 'employee_login_provision'].includes(entry.intent.operation)
                    ? 'Login creation retains only its reference. Check source status; the initial password is unavailable for retry.'
                    : 'Recovered after reload. Check source status; the original details are not stored in this browser.'}
                </p>
              ) : null}
              {status.pending ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    busy={entry.busy}
                    onClick={() => {
                      void check(entry.intent.commandId);
                    }}
                  >
                    Check source status
                  </Button>
                  <ConfirmOrganizationAction
                    label="Cancel if not executed"
                    description="The source company checks this original command. If it already executed, its result is kept. Otherwise the source records cancellation and blocks late execution. This does not undo a committed change. Keep awaiting confirmation if the network is uncertain."
                    busy={entry.activity === 'cancel'}
                    onConfirm={() => {
                      void cancel(entry.intent.commandId);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={entry.busy || !entry.canRetry}
                    onClick={() => {
                      void retry(entry.intent.commandId);
                    }}
                  >
                    Retry original command
                  </Button>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

export default OrganizationCommandJournal;
