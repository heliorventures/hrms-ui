import { useCallback, useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';

const LIST = gql`
  query OnboardingChecklist($limit: Int! = 100) {
    onboardingChecklist(limit: $limit) {
      id
      taskName
      taskCategory
      isCompleted
      dueDate
      completedAt
    }
  }
`;

const TOGGLE = gql`
  mutation SetOnboardingItem($checklistItemId: ID!, $isCompleted: Boolean!) {
    setOnboardingChecklistItemCompleted(checklistItemId: $checklistItemId, isCompleted: $isCompleted) {
      id
      isCompleted
    }
  }
`;

interface Item {
  id: string;
  taskName: string;
  taskCategory?: string | null;
  isCompleted: boolean;
  dueDate?: string | null;
  completedAt?: string | null;
}

const OnboardingPage = () => {
  const client = useGraphClient('client');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await client.request<{ onboardingChecklist: Item[] }>(LIST, { limit: 100 });
    return r.onboardingChecklist;
  }, [client]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const rows = await load();
        if (!c) setItems(rows);
      } catch (e) {
        if (!c) setError(e instanceof Error ? e.message : 'Failed to load checklist');
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load]);

  const toggle = async (id: string, next: boolean) => {
    setBusyId(id);
    try {
      await client.request(TOGGLE, { checklistItemId: id, isCompleted: next });
      setItems(await load());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Your onboarding tasks. HR can manage tasks for their scope from the employee directory when
        those flows are wired end-to-end.
      </p>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="Checklist">
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : items.length ? (
          <ul className="space-y-3">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{it.taskName}</p>
                  <p className="text-xs text-gray-500">
                    {it.taskCategory ?? 'General'}
                    {it.dueDate ? ` · due ${it.dueDate}` : ''}
                  </p>
                </div>
                <Button
                  variant={it.isCompleted ? 'secondary' : 'primary'}
                  disabled={busyId === it.id}
                  onClick={() => void toggle(it.id, !it.isCompleted)}
                >
                  {busyId === it.id ? '…' : it.isCompleted ? 'Mark incomplete' : 'Mark done'}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No onboarding tasks for your profile.</p>
        )}
      </Card>
    </div>
  );
};

export default OnboardingPage;
