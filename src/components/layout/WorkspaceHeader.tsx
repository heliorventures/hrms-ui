import { Menu, Search } from 'lucide-react';
import type { RefObject } from 'react';

import { useTenant } from '../../contexts/TenantContext';
import IconButton from '../common/IconButton';

import { useCommandPalette } from './CommandPaletteContext';
import PageTools from './PageTools';

interface Props {
  mobileOpen: boolean;
  triggerRef: RefObject<HTMLButtonElement>;
  onOpenNavigation: () => void;
}

const WorkspaceHeader = ({ mobileOpen, triggerRef, onOpenNavigation }: Props) => {
  const { currentTenant } = useTenant();
  const { open } = useCommandPalette();
  return (
    <header className="app-workspace-header flex min-h-14 shrink-0 items-center gap-2 border-b border-line-subtle bg-surface px-4 py-2 pt-[max(.5rem,env(safe-area-inset-top))] sm:gap-4 print:hidden">
      <IconButton
        ref={triggerRef}
        label="Open navigation"
        icon={<Menu className="size-5" />}
        onClick={onOpenNavigation}
        aria-controls="app-navigation"
        aria-expanded={mobileOpen}
        className="lg:hidden"
      />
      <p className="min-w-0 flex-1 truncate text-sm font-semibold" title={currentTenant.name}>
        {currentTenant.name}
      </p>
      <button
        type="button"
        onClick={(event) => open(event.currentTarget)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-line-subtle bg-canvas px-3 text-sm text-content-secondary hover:bg-surface-selected focus-visible:ring-2 focus-visible:ring-focus sm:w-72 sm:justify-start"
        aria-label="Search pages and tools"
        title="Search pages and tools (Ctrl/Cmd K)"
      >
        <Search className="size-5" aria-hidden="true" />
        <span className="hidden flex-1 text-left sm:inline">Search pages and tools</span>
        <kbd className="hidden text-xs text-content-muted lg:inline">Ctrl K</kbd>
      </button>
      <PageTools />
    </header>
  );
};

export default WorkspaceHeader;
