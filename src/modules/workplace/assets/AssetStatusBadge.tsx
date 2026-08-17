import Badge, { type BadgeProps } from '../../../components/common/Badge';

const variants: Record<string, BadgeProps['variant']> = {
  ACTIVE: 'success',
  AVAILABLE: 'success',
  ASSIGNED: 'info',
  RETURNED: 'neutral',
  RETIRED: 'danger',
};

export default function AssetStatusBadge({ status }: { status: string }) {
  return <Badge variant={variants[status] ?? 'neutral'}>{status.split('_').join(' ')}</Badge>;
}
