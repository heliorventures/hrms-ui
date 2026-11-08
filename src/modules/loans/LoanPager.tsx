import Button from '../../components/common/Button';

interface Props {
  page: number;
  hasNext: boolean;
  disabled: boolean;
  onNext: () => void;
  onPrevious: () => void;
}
const LoanPager = ({ page, hasNext, disabled, onNext, onPrevious }: Props) => (
  <div className="mt-3 flex items-center justify-end gap-3 text-sm">
    <Button variant="secondary" disabled={disabled || page === 1} onClick={onPrevious}>
      Previous
    </Button>
    <span>Page {page}</span>
    <Button variant="secondary" disabled={disabled || !hasNext} onClick={onNext}>
      Next
    </Button>
  </div>
);
export default LoanPager;
