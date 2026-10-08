import type { ComponentProps } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import PageHeader from '../../../components/common/PageHeader';
import ApplyLeaveModal from '../../leave/components/ApplyLeaveModal';
import LeaveRecoveryNotice from '../../leave/components/LeaveRecoveryNotice';
import LeaveRejectModal from '../../leave/components/LeaveRejectModal';
import LeaveWorkflowTrailModal from '../../leave/components/LeaveWorkflowTrailModal';

interface HeaderProps {
  canConfigure: boolean;
  loading: boolean;
  onApply: () => void;
  onConfigure: () => void;
  onRefresh: () => void;
}

export const HrLeavePageHeader = ({
  canConfigure,
  loading,
  onApply,
  onConfigure,
  onRefresh,
}: HeaderProps) => (
  <PageHeader
    title="Leave Approvals"
    actions={
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          <Button
            data-tour-anchor="hr-leaves.refresh"
            variant="outline"
            type="button"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          {canConfigure ? (
            <Button
              data-tour-anchor="hr-leaves.configure-trigger"
              variant="outline"
              type="button"
              onClick={onConfigure}
            >
              Leave & holidays setup
            </Button>
          ) : null}
          <Button
            data-tour-anchor="hr-leaves.apply-trigger"
            variant="primary"
            type="button"
            onClick={onApply}
            disabled={loading}
          >
            Apply for leave
          </Button>
        </div>
      </div>
    }
  />
);

interface DialogsProps {
  apply: ComponentProps<typeof ApplyLeaveModal>;
  reject: ComponentProps<typeof LeaveRejectModal>;
}

export const HrLeavePageDialogs = ({ apply, reject }: DialogsProps) => (
  <>
    <ApplyLeaveModal {...apply} />
    <LeaveRejectModal {...reject} />
  </>
);

interface NoticesProps {
  approvalMessage: string | null;
  recovery: ComponentProps<typeof LeaveRecoveryNotice> | null;
}

export const HrLeavePageNotices = ({ approvalMessage, recovery }: NoticesProps) => (
  <>
    {recovery ? <LeaveRecoveryNotice {...recovery} /> : null}
    {approvalMessage ? (
      <Card>
        <p className="text-sm text-sky-800 dark:text-sky-200">{approvalMessage}</p>
      </Card>
    ) : null}
  </>
);

interface TrailProps {
  trail: ComponentProps<typeof LeaveWorkflowTrailModal>;
}

export const HrLeaveWorkflowDialog = ({ trail }: TrailProps) => (
  <LeaveWorkflowTrailModal {...trail} />
);
