import Button from '../../../components/common/Button';
import type { AssetPageInfo } from './assetTypes';

interface AssetPagerProps {
  pageInfo: AssetPageInfo;
  loading: boolean;
  onPageChange: (page: number) => void;
}

export default function AssetPager({ pageInfo, loading, onPageChange }: AssetPagerProps) {
  if (pageInfo.totalCount === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
      <span>
        Page {pageInfo.currentPage} of {Math.max(pageInfo.totalPages, 1)} · {pageInfo.totalCount}{' '}
        records
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={loading || !pageInfo.hasPrevPage}
          onClick={() => onPageChange(pageInfo.currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={loading || !pageInfo.hasNextPage}
          onClick={() => onPageChange(pageInfo.currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
