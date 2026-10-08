import { useState } from 'react';

import type { HrLeaveCalendarQuery } from '../../../api/graphql/graphql';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';

const PAGE_SIZE = 10;
const durationLabel = (row: HrLeaveCalendarQuery['leaveRequests'][number]) => {
  if (row.isHalfDay) return ['Half day', row.halfDaySession].filter(Boolean).join(' · ');
  return row.fromDate === row.toDate ? 'Full day' : 'Multiple days';
};

const useCalendarLeaveList = (data: HrLeaveCalendarQuery | null) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const employees = new Map(data?.orgChart.map((row) => [row.employeeId, row]) ?? []);
  const types = new Map(data?.leaveTypes.map((row) => [row.id, row.name]) ?? []);
  const rows = (data?.leaveRequests ?? [])
    .filter((row) => {
      const employee = employees.get(row.employeeId);
      const text = [employee?.fullName, employee?.employeeCode, types.get(row.leaveTypeId)]
        .join(' ')
        .toLowerCase();
      return text.includes(search.trim().toLowerCase()) && (!status || row.status === status);
    })
    .sort(
      (a, b) => String(a.fromDate).localeCompare(String(b.fromDate)) || a.id.localeCompare(b.id)
    );
  const statuses = [...new Set(data?.leaveRequests.map((row) => row.status) ?? [])].sort();
  const lastPage = Math.max(0, Math.ceil(rows.length / PAGE_SIZE) - 1);
  const currentPage = Math.min(page, lastPage);
  const visibleRows = rows.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  return {
    search,
    setSearch,
    status,
    setStatus,
    currentPage,
    setPage,
    rows,
    visibleRows,
    lastPage,
    statuses,
    employees,
    types,
  };
};
const LeaveCalendarList = ({ data }: { data: HrLeaveCalendarQuery | null }) => {
  const {
    search,
    setSearch,
    status,
    setStatus,
    currentPage,
    setPage,
    rows,
    visibleRows,
    lastPage,
    statuses,
    employees,
    types,
  } = useCalendarLeaveList(data);
  return (
    <section aria-label="Team leave" className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-sm font-semibold">
          Team leave <span className="text-content-muted">({rows.length})</span>
        </h2>
        <Input
          aria-label="Search team leave"
          placeholder="Employee or leave type"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
        />
        <Select
          aria-label="Leave status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(0);
          }}
          options={[
            { value: '', label: 'All statuses' },
            ...statuses.map((value) => ({ value, label: value })),
          ]}
        />
      </div>
      <div className="overflow-x-auto" data-tour-anchor="leave.team-calendar-grid">
        <table className="w-full text-left text-sm">
          <thead className="bg-canvas text-xs text-content-secondary">
            <tr>
              <th>Employee</th>
              <th>Leave type</th>
              <th>Dates</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visibleRows.map((row) => (
              <tr key={row.id}>
                <td>
                  {employees.get(row.employeeId)?.fullName ||
                    employees.get(row.employeeId)?.employeeCode ||
                    'Employee details unavailable'}
                </td>
                <td>{types.get(row.leaveTypeId) || 'Leave'}</td>
                <td className="whitespace-nowrap">
                  {String(row.fromDate).slice(0, 10)} – {String(row.toDate).slice(0, 10)}
                </td>
                <td>{durationLabel(row)}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="py-2 text-sm text-content-muted">No leave matches this period and filters.</p>
      )}
      <div className="flex items-center justify-between gap-2 text-xs text-content-secondary">
        <span>
          {rows.length
            ? `${currentPage * PAGE_SIZE + 1}–${Math.min((currentPage + 1) * PAGE_SIZE, rows.length)} of ${rows.length}`
            : '0 records'}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= lastPage}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      {data?.leaveRequests.length === 400 && (
        <p role="status" className="text-xs text-status-warning">
          Showing the first 400 requests for this month. Use leave reports for a complete export.
        </p>
      )}
    </section>
  );
};

export default LeaveCalendarList;
