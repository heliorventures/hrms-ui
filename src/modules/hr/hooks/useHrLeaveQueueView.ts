import { useMemo } from 'react';

import type { useGraphClient } from '../../../hooks/useGraphClient';
import { boundedInteger, useRememberedRouteView } from '../../../hooks/useRememberedRouteView';
import type { HrLeaveFilter } from '../components/HrLeaveFilterTabs';

type Client = ReturnType<typeof useGraphClient>;
const FILTERS = ['actionable', 'pending', 'all', 'approved', 'rejected', 'cancelled'];

export const useHrLeaveQueueView = (client: Client, identity: string) => {
  const defaultYear = useMemo(() => new Date().getFullYear(), []);
  const [view, updateView] = useRememberedRouteView(
    client,
    identity,
    'hr-leaves',
    { year: String(defaultYear), page: '0', status: 'actionable' },
    (params) => ({
      year: String(
        boundedInteger(params.get('year'), defaultYear, defaultYear - 2, defaultYear + 1)
      ),
      page: String(boundedInteger(params.get('page'), 0, 0, 100000)),
      status: FILTERS.includes(params.get('status') ?? '')
        ? (params.get('status') ?? 'actionable')
        : 'actionable',
    })
  );
  const yearChoices = useMemo(() => {
    const years: number[] = [];
    for (let year = defaultYear - 2; year <= defaultYear + 1; year += 1) years.push(year);
    return years;
  }, [defaultYear]);

  return {
    balanceYear: Number(view.year),
    filter: view.status as HrLeaveFilter,
    requestPage: Number(view.page),
    updateView,
    yearChoices,
  };
};
