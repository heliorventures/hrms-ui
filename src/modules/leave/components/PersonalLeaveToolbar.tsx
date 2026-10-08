import Button from '../../../components/common/Button';
import PageHeader from '../../../components/common/PageHeader';
import type { PersonalLeaveModel } from '../hooks/usePersonalLeaveModel';

const PersonalLeaveToolbar = ({ model }: { model: PersonalLeaveModel }) => {
  const { refreshBoard, loading, canSubmitLeave, setApplyOpen } = model;
  return (
    <PageHeader
      title="Leave Management"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              data-tour-anchor="leave.refresh"
              variant="outline"
              type="button"
              onClick={() => void refreshBoard()}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            {canSubmitLeave ? (
              <Button
                data-tour-anchor="leave.apply-trigger"
                variant="primary"
                type="button"
                onClick={() => setApplyOpen(true)}
                disabled={loading}
              >
                Apply for leave
              </Button>
            ) : null}
          </div>
        </div>
      }
    />
  );
};
export default PersonalLeaveToolbar;
