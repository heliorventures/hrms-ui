import { useContext, type ReactNode } from 'react';

import { PAGE_ACTION_ICONS, PageActionsContext } from './pageActionsContext';

export function usePageActionPresentation({
  children,
  startIcon,
  title,
  accessibleName,
}: {
  children: ReactNode;
  startIcon?: ReactNode;
  title?: string;
  accessibleName?: string;
}) {
  const enabled = useContext(PageActionsContext);
  const actionName = typeof children === 'string' ? children.trim() : '';
  const knownAction = Object.prototype.hasOwnProperty.call(PAGE_ACTION_ICONS, actionName);
  const Icon =
    enabled && knownAction
      ? PAGE_ACTION_ICONS[actionName as keyof typeof PAGE_ACTION_ICONS]
      : undefined;
  if (!Icon) return { children, startIcon, title, className: '' };
  const tooltip = accessibleName ?? actionName;
  return {
    className: 'group relative !min-h-11 !min-w-11 !px-2.5',
    title: title ?? tooltip,
    startIcon: <Icon className="h-5 w-5" />,
    children: (
      <>
        <span className="sr-only">{children}</span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-full z-40 mt-2 hidden w-max max-w-56 rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg group-hover:block group-focus-visible:block"
        >
          {tooltip}
        </span>
      </>
    ),
  };
}
