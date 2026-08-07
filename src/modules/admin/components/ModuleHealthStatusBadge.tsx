import type { ProbeState } from '../moduleHealthTypes';

const STATUS_BADGE_CLASS = 'text-xs px-2 py-0.5 rounded';

const ModuleHealthStatusBadge = ({ state }: { state: ProbeState }) => {
  switch (state.status) {
    case 'ok':
      return (
        <span className={`${STATUS_BADGE_CLASS} bg-emerald-100 text-emerald-800`}>
          OK - {state.count}
        </span>
      );
    case 'error':
      return <span className={`${STATUS_BADGE_CLASS} bg-rose-100 text-rose-800`}>Error</span>;
    case 'loading':
      return (
        <span className={`${STATUS_BADGE_CLASS} bg-amber-100 text-amber-800`}>Loading</span>
      );
    default:
      return <span className={`${STATUS_BADGE_CLASS} bg-slate-100 text-slate-800`}>Idle</span>;
  }
};

export default ModuleHealthStatusBadge;
