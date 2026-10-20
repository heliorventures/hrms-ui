import Button from '../../components/common/Button';

interface Props {
  canPrevious: boolean;
  hasNext: boolean;
  busy: boolean;
  previous: () => void;
  next: () => void;
}

const OrganizationPager = ({ canPrevious, hasNext, busy, previous, next }: Props) => (
  <div className="mt-3 flex gap-2" aria-label="Organization records pagination">
    <Button variant="outline" size="sm" disabled={busy || !canPrevious} onClick={previous}>
      Previous
    </Button>
    <Button variant="outline" size="sm" disabled={busy || !hasNext} onClick={next}>
      Next
    </Button>
  </div>
);

export default OrganizationPager;
