import { useState } from 'react';

import type { GrowthTimelineNode } from '../types';
import { Timeline } from '../components/Timeline';
import Modal from '../../../../components/common/Modal';
import { formatCompactDate } from '../lib/masking';

interface GrowthTimelineTabProps {
  nodes: GrowthTimelineNode[];
}

const typeLabel: Record<GrowthTimelineNode['type'], string> = {
  JOINING: 'Joining',
  APPRAISAL: 'Appraisal',
  PROMOTION: 'Promotion',
  SALARY_CHANGE: 'Salary change',
};

export function GrowthTimelineTab({ nodes }: GrowthTimelineTabProps) {
  const [selected, setSelected] = useState<GrowthTimelineNode | null>(null);

  return (
    <div>
      <Timeline
        items={nodes.map((n) => ({
          id: n.id,
          dateLabel: formatCompactDate(n.date),
          title: n.title,
          description: n.notes,
          badge: (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {typeLabel[n.type]}
            </span>
          ),
          onSelect: () => setSelected(n),
        }))}
      />

      <Modal
        isOpen={selected != null}
        onClose={() => setSelected(null)}
        title={selected ? typeLabel[selected.type] : 'Event'}
        size="md"
      >
        {selected ? (
          <div className="space-y-2 text-sm">
            <p className="text-slate-500">{formatCompactDate(selected.date)}</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{selected.title}</p>
            {selected.salaryChangePercent != null ? (
              <p className="text-emerald-700 dark:text-emerald-400">
                Salary change: {selected.salaryChangePercent >= 0 ? '+' : ''}
                {selected.salaryChangePercent.toFixed(1)}%
              </p>
            ) : null}
            {selected.notes ? (
              <p className="leading-relaxed text-slate-600 dark:text-slate-400">{selected.notes}</p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
