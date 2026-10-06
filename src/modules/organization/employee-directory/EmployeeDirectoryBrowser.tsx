import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useId, useState } from 'react';

import IconButton from '../../../components/common/IconButton';

import EmployeeBrowseCard from './EmployeeBrowseCard';
import type { DirectoryEmployee } from './employeeDirectoryModel';
import EmployeeWorkDetails from './EmployeeWorkDetails';
import { useEmployeeCarousel } from './useEmployeeCarousel';

const EmployeeDirectoryBrowser = ({ rows }: { rows: readonly DirectoryEmployee[] }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = rows.find((row) => row.employeeId === selectedId) ?? rows[0];
  const detailsId = useId();
  const stripId = useId();
  const { stripRef, range, move, focusCard } = useEmployeeCarousel(rows);
  if (!selected) return null;
  return (
    <div className="space-y-3" data-tour-anchor="organization-employees-results">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">Browse employees</h2>
          <p className="text-xs text-content-muted">Choose a card to see work details</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums text-content-muted">
            {range.start}–{Math.min(range.end, rows.length)} of {rows.length}
          </span>
          <IconButton
            label="Previous employees"
            icon={<ChevronLeft className="size-4" />}
            variant="outline"
            disabled={!range.previous}
            aria-controls={stripId}
            onClick={() => move(-1)}
          />
          <IconButton
            label="Next employees"
            icon={<ChevronRight className="size-4" />}
            variant="outline"
            disabled={!range.next}
            aria-controls={stripId}
            onClick={() => move(1)}
          />
        </div>
      </div>
      <div
        ref={stripRef}
        id={stripId}
        role="group"
        aria-label="Browse employees"
        aria-roledescription="carousel"
        className="scrollbar-subtle flex snap-x snap-mandatory gap-[16px] overflow-x-auto px-1 pb-3 pt-1"
      >
        {rows.map((employee, index) => (
          <EmployeeBrowseCard
            key={employee.employeeId}
            employee={employee}
            selected={employee.employeeId === selected.employeeId}
            detailsId={detailsId}
            onSelect={() => setSelectedId(employee.employeeId)}
            onKeyDown={(event) => focusCard(event, index)}
          />
        ))}
      </div>
      <p role="status" className="sr-only">
        Showing work details for {selected.fullName}
      </p>
      <EmployeeWorkDetails employee={selected} id={detailsId} />
    </div>
  );
};
export default EmployeeDirectoryBrowser;
