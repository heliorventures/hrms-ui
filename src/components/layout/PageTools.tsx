import PageInformationButton from '../common/PageInformationButton';

import NotificationDropdown from './NotificationDropdown';

const PageTools = () => (
  <aside
    aria-label="Page tools"
    className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-20 flex flex-col items-center gap-1 rounded-2xl border border-line-subtle/60 bg-surface p-1 shadow-card-md print:hidden"
  >
    <NotificationDropdown className="!min-h-11 !min-w-11 rounded-xl !bg-amber-100 !text-amber-800 hover:!bg-amber-200 dark:!bg-amber-950 dark:!text-amber-200 dark:hover:!bg-amber-900" />
    <PageInformationButton className="!min-h-11 !min-w-11 rounded-xl !bg-sky-100 !text-sky-800 hover:!bg-sky-200 dark:!bg-sky-950 dark:!text-sky-200 dark:hover:!bg-sky-900" />
  </aside>
);

export default PageTools;
