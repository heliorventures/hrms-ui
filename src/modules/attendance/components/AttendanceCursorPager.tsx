import Button from '../../../components/common/Button';

interface AttendanceCursorPagerProps {
  cursorStack: readonly string[];
  endCursor?: string | null;
  hasNextPage: boolean;
  loading: boolean;
  onCursorChange: (after: string | undefined) => void;
}

const AttendanceCursorPager = ({
  cursorStack,
  endCursor,
  hasNextPage,
  loading,
  onCursorChange,
}: AttendanceCursorPagerProps) => {
  const hasPreviousPage = cursorStack.length > 0;
  const previousCursor =
    cursorStack.length > 1 ? cursorStack[cursorStack.length - 2] : undefined;
  const canAdvance = hasNextPage && Boolean(endCursor);

  return (
    <nav
      aria-label="Attendance pages"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-700"
    >
      <p aria-live="polite" className="text-sm text-gray-600 dark:text-gray-300">
        Page {cursorStack.length + 1}
        {hasNextPage ? ' — more attendance records are available.' : ''}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading || !hasPreviousPage}
          onClick={() => onCursorChange(previousCursor)}
        >
          Previous page
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={loading || !canAdvance}
          onClick={() => {
            if (endCursor) onCursorChange(endCursor);
          }}
        >
          Next page
        </Button>
      </div>
    </nav>
  );
};

export default AttendanceCursorPager;
