import Button from '../../../components/common/Button';
import PageNotice from '../../../components/common/PageNotice';

import type { useManagedAttendanceState } from './useManagedAttendanceState';

const ManagedAttendanceNotices = ({
  state,
  refresh,
}: {
  state: ReturnType<typeof useManagedAttendanceState>;
  refresh: () => void;
}) => {
  const { rangeError, searchPending, error, success, setSuccessState, client } = state;
  return (
    <>
      {rangeError ? (
        <PageNotice variant="error" title="Update the date range">
          {rangeError}
        </PageNotice>
      ) : null}

      {searchPending ? (
        <PageNotice variant="info" title="Updating attendance search">
          The updated employee search will be applied in a moment.
        </PageNotice>
      ) : null}

      {error ? (
        <PageNotice
          variant="error"
          title="Attendance could not be loaded"
          action={
            <Button variant="outline" onClick={refresh}>
              Try again
            </Button>
          }
        >
          {error}
        </PageNotice>
      ) : null}

      {success ? (
        <PageNotice
          variant="success"
          onDismiss={() => setSuccessState({ owner: client, value: null })}
        >
          {success}
        </PageNotice>
      ) : null}
    </>
  );
};
export default ManagedAttendanceNotices;
