import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import type { ChecklistItem } from '../onboardingTypes';

interface OnboardingChecklistCardProps {
  busyId: string | null;
  items: ChecklistItem[];
  loading: boolean;
  onToggle: (id: string, next: boolean) => void;
}

const OnboardingChecklistCard = ({ busyId, items, loading, onToggle }: OnboardingChecklistCardProps) => (
  <Card title="Checklist">
    {loading ? (
      <p className="text-sm text-gray-500">Loading...</p>
    ) : items.length ? (
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200/90 bg-slate-50/40 p-3 dark:border-slate-600 dark:bg-slate-800/30"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{item.taskName}</p>
              <p className="text-xs text-gray-500">
                {item.taskCategory ?? 'General'}
                {item.dueDate != null ? ` - due ${String(item.dueDate)}` : ''}
              </p>
            </div>
            <Button
              variant={item.isCompleted ? 'secondary' : 'primary'}
              disabled={busyId === item.id}
              onClick={() => onToggle(item.id, !item.isCompleted)}
            >
              {busyId === item.id ? '...' : item.isCompleted ? 'Mark incomplete' : 'Mark done'}
            </Button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-500">No Onboarding Tasks For Your Profile.</p>
    )}
  </Card>
);

export default OnboardingChecklistCard;
