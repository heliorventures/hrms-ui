import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

type CommandPaletteContextValue = {
  open: (opener?: HTMLElement | null) => void;
  close: () => void;
  toggle: (opener?: HTMLElement | null) => void;
  isOpen: boolean;
  openerRef: RefObject<HTMLElement>;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | undefined>(undefined);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((opener?: HTMLElement | null) => {
    openerRef.current =
      opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback((opener?: HTMLElement | null) => {
    setIsOpen((current) => {
      if (!current) {
        openerRef.current =
          opener ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
      }
      return !current;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  const value = useMemo(
    () => ({ open, close, toggle, isOpen, openerRef }),
    [open, close, toggle, isOpen]
  );

  return (
    <CommandPaletteContext.Provider value={value}>{children}</CommandPaletteContext.Provider>
  );
}

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  }
  return ctx;
}
