/** Application tab appearance, based on Payslips & Tax. */
export const TAB_LIST_CLASS =
  'flex min-w-0 gap-6 overflow-x-auto border-b border-slate-200 dark:border-slate-700';

export const tabClassName = (
  active: boolean,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
) => {
  const layout = orientation === 'vertical' ? 'border-l-2 px-4 py-3' : 'border-b-2 py-4';
  const state = active
    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-slate-200';
  return `flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus motion-reduce:transition-none ${layout} ${state}`;
};
