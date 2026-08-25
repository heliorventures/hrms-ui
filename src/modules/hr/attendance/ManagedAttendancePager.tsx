import Button from '../../../components/common/Button';

interface ManagedAttendancePagerProps {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  endCursor: string | null | undefined;
  loading: boolean;
  onPrevious: () => void;
  onNext: (cursor: string) => void;
}

const ManagedAttendancePager = ({
  hasPreviousPage,
  hasNextPage,
  endCursor,
  loading,
  onPrevious,
  onNext,
}: ManagedAttendancePagerProps) => {
  const canGoNext = hasNextPage && Boolean(endCursor) && !loading;

  return (
    <nav aria-label="Managed attendance pagination" className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Previous page"
        disabled={loading || !hasPreviousPage}
        onClick={onPrevious}
      >
        Previous
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Next page"
        disabled={!canGoNext}
        onClick={() => {
          if (endCursor) onNext(endCursor);
        }}
      >
        Next
      </Button>
    </nav>
  );
};

export default ManagedAttendancePager;
