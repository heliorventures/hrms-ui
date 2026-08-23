import StatusBadge, { type StatusBadgeTone } from '../../../components/common/StatusBadge';
import { UI_FEEDBACK_TEXT } from '../../../constants/uiText';

const STATUS_PRESENTATION: Record<string, { label: string; tone: StatusBadgeTone }> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  AVAILABLE: { label: 'Available', tone: 'success' },
  ASSIGNED: { label: 'Assigned', tone: 'info' },
  RETURNED: { label: 'Returned', tone: 'neutral' },
  RETIRED: { label: 'Retired', tone: 'danger' },
};

const AssetStatusBadge = ({ status }: { status: string }) => {
  const presentation = STATUS_PRESENTATION[status] ?? {
    label: UI_FEEDBACK_TEXT.unknownStatus,
    tone: 'neutral' as const,
  };

  return <StatusBadge label={presentation.label} tone={presentation.tone} />;
};

export default AssetStatusBadge;
