import { Link } from 'react-router-dom';

import type { ActionMenuItem } from './ActionMenu';

const ActionMenuEntry = ({
  item,
  onClose,
  onNavigate,
}: {
  item: ActionMenuItem;
  onClose: () => void;
  onNavigate?: () => void;
}) => {
  const danger = 'tone' in item && item.tone === 'danger';
  const tone = item.disabled
    ? 'cursor-not-allowed text-content-disabled'
    : 'text-content-secondary hover:bg-surface-selected hover:text-content-primary';
  const className = `flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus ${danger && !item.disabled ? 'text-status-danger' : tone}`;
  const content = (
    <>
      {item.icon ? (
        <span
          aria-hidden="true"
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center"
        >
          {item.icon}
        </span>
      ) : null}
      <span className="min-w-0 break-words">{item.label}</span>
    </>
  );
  if ('href' in item) {
    if (item.disabled)
      return (
        <span role="menuitem" aria-disabled="true" tabIndex={-1} className={className}>
          {content}
        </span>
      );
    return (
      <Link
        role="menuitem"
        tabIndex={-1}
        to={item.href}
        className={className}
        onClick={() => {
          onClose();
          onNavigate?.();
        }}
      >
        {content}
      </Link>
    );
  }
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      disabled={item.disabled}
      data-tone={item.tone ?? 'default'}
      className={className}
      onClick={() => {
        item.onSelect();
        onClose();
      }}
    >
      {content}
    </button>
  );
};

export default ActionMenuEntry;
