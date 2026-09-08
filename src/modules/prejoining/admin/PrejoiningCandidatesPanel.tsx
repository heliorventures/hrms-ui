import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Select from '../../../components/common/Select';
import Table from '../../../components/common/Table';
import PrejoiningPipelineExport from '../PrejoiningPipelineExport';

import { PAGE_SIZE, statusTone, prettyStatus } from './prejoiningAdminHelpers';
import type { PrejoiningCandidate } from './prejoiningAdminTypes';
import type { PrejoiningAdminModel } from './usePrejoiningAdminModel';

export const PrejoiningCandidatesPanel = ({ model }: { model: PrejoiningAdminModel }) => {
  const {
    candidates,
    total,
    offset,
    setOffset,
    statusFilter,
    setStatusFilter,
    loading,
    busyAction,
    openCandidate,
    ownerToken,
    loadCandidates,
  } = model;
  const columns = [
    { key: 'email', label: 'Candidate' },
    {
      key: 'status',
      label: 'Status',
      render: (row: PrejoiningCandidate) => (
        <Badge variant={statusTone(row.status)}>{prettyStatus(row.status)}</Badge>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Updated',
      render: (row: PrejoiningCandidate) => new Date(row.updatedAt).toLocaleString('en-IN'),
    },
    {
      key: 'action',
      label: '',
      render: (row: PrejoiningCandidate) => (
        <Button
          size="sm"
          variant="outline"
          busy={busyAction === `open-${row.id}`}
          onClick={() => openCandidate(row.id)}
          aria-label={`Review ${row.email}`}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <section
      id="prejoining-candidates-panel"
      role="tabpanel"
      aria-labelledby="prejoining-candidates-panel-tab"
      className="space-y-3"
    >
      <Card>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Select
            label="Status"
            value={statusFilter}
            options={[
              { value: '', label: 'All statuses' },
              ...['DRAFT', 'SUBMITTED', 'CHANGES_REQUESTED', 'APPROVED', 'JOINED', 'CANCELLED'].map(
                (value) => ({ value, label: prettyStatus(value) })
              ),
            ]}
            onChange={(event) => {
              const { value } = event.target;
              setStatusFilter(value);
              setOffset(0);
              void loadCandidates(ownerToken, 0, value);
            }}
          />
          <span className="text-sm text-content-secondary">
            {total} candidate{total === 1 ? '' : 's'}
          </span>
          <PrejoiningPipelineExport status={statusFilter} />
        </div>
      </Card>
      <Card>
        <Table
          data={candidates}
          columns={columns}
          keyExtractor={(row) => row.id}
          loading={loading}
          loadingMessage="Loading candidates…"
          emptyMessage="No candidates match this view."
          ariaLabel="Pre-joining candidates"
        />
        <div className="mt-3 flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={offset === 0 || loading}
            onClick={() => {
              const next = Math.max(0, offset - PAGE_SIZE);
              setOffset(next);
              void loadCandidates(ownerToken, next, statusFilter);
            }}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={offset + PAGE_SIZE >= total || loading}
            onClick={() => {
              const next = offset + PAGE_SIZE;
              setOffset(next);
              void loadCandidates(ownerToken, next, statusFilter);
            }}
          >
            Next
          </Button>
        </div>
      </Card>
    </section>
  );
};
