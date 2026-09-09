import Button from '../../../components/common/Button';
import PageActions from '../../../components/common/PageActions';
import type { PersonalLeaveModel } from '../hooks/usePersonalLeaveModel';

const PersonalLeaveToolbar = ({ model }: { model: PersonalLeaveModel }) => {
  const { refreshBoard, loading, canSubmitLeave, setApplyOpen } = model;
  return (
    <PageActions>
      <div>
        <h1 className="sr-only">Leave Management</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          type="button"
          onClick={() => void refreshBoard()}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
        {canSubmitLeave ? (
          <Button
            variant="primary"
            type="button"
            onClick={() => setApplyOpen(true)}
            disabled={loading}
          >
            Apply for leave
          </Button>
        ) : null}
      </div>
    </PageActions>
  );
};
export default PersonalLeaveToolbar;
