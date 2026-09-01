import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Info,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { cloneElement, isValidElement, type ReactNode } from 'react';

export type StatusBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface StatusBadgeProps {
  label: string;
  tone: StatusBadgeTone;
  icon?: ReactNode;
}

const STATUS_BADGE_TONE_CLASSES: Record<StatusBadgeTone, string> = {
  neutral: 'bg-status-neutral/10 ring-status-neutral/30',
  info: 'bg-status-info/10 ring-status-info/30',
  success: 'bg-status-success/10 ring-status-success/30',
  warning: 'bg-status-warning/10 ring-status-warning/30',
  danger: 'bg-status-danger/10 ring-status-danger/30',
};

const TONE_ICONS: Record<StatusBadgeTone, LucideIcon> = {
  neutral: Circle,
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
};

const TONE_ICON_CLASSES: Record<StatusBadgeTone, string> = {
  neutral: 'text-status-neutral',
  info: 'text-status-info',
  success: 'text-status-success',
  warning: 'text-status-warning',
  danger: 'text-status-danger',
};

const StatusBadge = ({ label, tone, icon }: StatusBadgeProps) => {
  const DefaultIcon = TONE_ICONS[tone];
  const iconClassName = `h-3.5 w-3.5 ${TONE_ICON_CLASSES[tone]}`;
  const suppliedIcon = isValidElement<{
    'aria-hidden'?: boolean;
    className?: string;
    focusable?: string;
  }>(icon)
    ? cloneElement(icon, {
        'aria-hidden': true,
        className: `${icon.props.className ?? ''} ${iconClassName}`.trim(),
        focusable: 'false',
      })
    : icon;

  return (
    <span
      data-tone={tone}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-content-primary ring-1 ring-inset ${STATUS_BADGE_TONE_CLASSES[tone]}`}
    >
      {suppliedIcon ?? (
        <DefaultIcon aria-hidden="true" focusable="false" className={iconClassName} />
      )}
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
