import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Drawer from '../../../components/common/Drawer';
import Input from '../../../components/common/Input';

import type {
  PrejoiningCandidate,
  PrejoiningInvitation,
  PrejoiningStatus,
} from './prejoiningAdminTypes';

const FIELD_CLASS =
  'min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-content-primary';
const statusTone = (s: PrejoiningStatus) => {
  if (s === 'JOINED' || s === 'APPROVED') return 'success';
  if (s === 'CANCELLED') return 'danger';
  if (s === 'CHANGES_REQUESTED') return 'warning';
  if (s === 'SUBMITTED') return 'info';
  return 'neutral';
};
const invitationTone = (s: PrejoiningInvitation['emailStatus']) => {
  if (s === 'SENT') return 'success';
  if (s === 'FAILED') return 'danger';
  return 'neutral';
};
const prettyStatus = (s: string) =>
  s
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^./, (v: string) => v.toUpperCase());
const bytesLabel = (b: number) =>
  b < 1048576 ? `${Math.ceil(b / 1024)} KB` : `${(b / 1048576).toFixed(1)} MB`;

export const InvitationResult = ({
  invitation,
  onCopy,
}: {
  invitation: PrejoiningInvitation;
  onCopy: () => void;
}) => {
  return (
    <div className="mt-4 space-y-2 rounded-md border border-line p-3">
      <Input label="Private invitation link" readOnly value={invitation.privateUrl} fullWidth />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={onCopy}>
          Copy link
        </Button>
        <Badge variant={invitationTone(invitation.emailStatus)}>
          {prettyStatus(invitation.emailStatus)}
        </Badge>
      </div>
      {invitation.emailError ? (
        <p role="alert" className="text-sm text-status-danger">
          {invitation.emailError}
        </p>
      ) : null}
    </div>
  );
};

interface CandidateDrawerProps {
  candidate: PrejoiningCandidate | null;
  canManage: boolean;
  canConvert: boolean;
  busyAction: string | null;
  correctionOpen: boolean;
  feedback: string;
  invitation: PrejoiningInvitation | null;
  onClose: () => void;
  onFeedback: (value: string) => void;
  onOpenCorrections: () => void;
  onCancelCorrections: () => void;
  onReview: (kind: 'approve' | 'changes' | 'cancel') => void;
  onReissue: (send: boolean) => void;
  onConfirm: () => void;
  onDownload: (id: string) => void;
  onCopy: (url: string) => void;
}

export const CandidateDrawer = (props: CandidateDrawerProps) => {
  const { candidate: row } = props;
  return (
    <Drawer
      isOpen={Boolean(row)}
      onClose={props.onClose}
      isDismissible={!props.busyAction}
      title={row ? row.email : 'Candidate'}
      description={row ? `Revision ${row.revision}` : undefined}
      footer={row ? <CandidateActions {...props} candidate={row} /> : undefined}
    >
      {row ? <CandidateBody {...props} candidate={row} /> : null}
    </Drawer>
  );
};

const CandidateActions = (props: CandidateDrawerProps & { candidate: PrejoiningCandidate }) => {
  const row = props.candidate;
  return (
    <>
      {' '}
      <div className="flex flex-wrap justify-end gap-2">
        {row.status === 'SUBMITTED' ? (
          <>
            <Button variant="outline" onClick={props.onOpenCorrections}>
              Request corrections
            </Button>
            <Button busy={props.busyAction === 'approve'} onClick={() => props.onReview('approve')}>
              Approve information
            </Button>
          </>
        ) : null}
        {row.status === 'APPROVED' && props.canConvert ? (
          <Button busy={props.busyAction === 'directory'} onClick={props.onConfirm}>
            Confirm joined
          </Button>
        ) : null}
        {props.canManage && !['JOINED', 'CANCELLED'].includes(row.status) ? (
          <Button
            variant="danger"
            busy={props.busyAction === 'cancel'}
            onClick={() => props.onReview('cancel')}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </>
  );
};

const CandidateDetails = (props: CandidateDrawerProps & { candidate: PrejoiningCandidate }) => {
  const row = props.candidate;
  return (
    <>
      {' '}
      <section>
        <h3 className="mb-2 text-sm font-semibold">Submitted information</h3>
        <dl className="space-y-2">
          {row.config.fields.map((field) => (
            <div key={field.key} className="rounded-md bg-canvas p-2">
              <dt className="text-xs font-medium text-content-secondary">{field.label}</dt>
              <dd className="break-words text-sm text-content-primary">
                {row.answers[field.key] || 'Not provided'}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section>
        <h3 className="mb-2 text-sm font-semibold">Documents</h3>
        {row.documents.length ? (
          <ul className="space-y-2">
            {row.documents.map((document) => (
              <li
                key={document.id}
                className="flex items-center justify-between gap-2 rounded-md border border-line p-2"
              >
                <span className="min-w-0 text-sm">
                  <span className="block truncate">{document.filename}</span>
                  <span className="text-xs text-content-secondary">
                    {bytesLabel(document.sizeBytes)}
                  </span>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  busy={props.busyAction === `download-${document.id}`}
                  onClick={() => props.onDownload(document.id)}
                >
                  Download
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-content-secondary">No documents uploaded.</p>
        )}
      </section>
    </>
  );
};

const CorrectionForm = (props: CandidateDrawerProps) => {
  return (
    <>
      {' '}
      <section className="space-y-2 rounded-md border border-line p-3">
        <label className="block text-sm font-medium">
          Correction instructions
          <textarea
            aria-label="Correction instructions"
            className={`${FIELD_CLASS} mt-1 min-h-24`}
            value={props.feedback}
            onChange={(event) => props.onFeedback(event.target.value)}
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button variant="quiet" onClick={props.onCancelCorrections}>
            Back
          </Button>
          <Button busy={props.busyAction === 'changes'} onClick={() => props.onReview('changes')}>
            Send correction request
          </Button>
        </div>
      </section>
    </>
  );
};

const ReplacementInvitation = (props: CandidateDrawerProps) => {
  const { invitation } = props;
  return (
    <>
      {' '}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Replacement invitation</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            busy={props.busyAction === 'reissue'}
            onClick={() => props.onReissue(false)}
          >
            Reissue link
          </Button>
          <Button
            variant="outline"
            busy={props.busyAction === 'reissue'}
            onClick={() => props.onReissue(true)}
          >
            Reissue and email
          </Button>
        </div>
        {invitation ? (
          <InvitationResult
            invitation={invitation}
            onCopy={() => props.onCopy(invitation.privateUrl)}
          />
        ) : null}
      </section>
    </>
  );
};

const CandidateBody = (props: CandidateDrawerProps & { candidate: PrejoiningCandidate }) => {
  const row = props.candidate;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Badge variant={statusTone(row.status)}>{prettyStatus(row.status)}</Badge>
        {row.expiresAt ? (
          <span className="text-sm text-content-secondary">
            Link expires {new Date(row.expiresAt).toLocaleString('en-IN')}
          </span>
        ) : null}
      </div>
      {row.feedback ? (
        <section>
          <h3 className="text-sm font-semibold">Correction feedback</h3>
          <p className="text-sm text-content-secondary">{row.feedback}</p>
        </section>
      ) : null}
      <CandidateDetails {...props} candidate={row} />
      {props.correctionOpen ? <CorrectionForm {...props} /> : null}
      {props.canManage &&
      ['DRAFT', 'CHANGES_REQUESTED', 'SUBMITTED', 'APPROVED'].includes(row.status) ? (
        <ReplacementInvitation {...props} />
      ) : null}
      {row.status === 'APPROVED' && !props.canConvert ? (
        <p className="text-sm text-content-secondary">
          Employee conversion requires employee creation and role management access.
        </p>
      ) : null}
      {row.status === 'JOINED' ? (
        <p className="text-sm text-status-success">
          Employee and login created{row.employeeId ? `: ${row.employeeId}` : '.'}
        </p>
      ) : null}
    </div>
  );
};
