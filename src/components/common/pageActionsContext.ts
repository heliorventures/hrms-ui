import {
  CalendarPlus,
  CalendarClock,
  Download,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  UserRound,
  Plane,
  ReceiptText,
} from 'lucide-react';
import { createContext } from 'react';

export const PageActionsContext = createContext(false);

/** Only non-destructive toolbar actions have an icon-only presentation. */
export const PAGE_ACTION_ICONS = {
  'Add Employee': Plus,
  'Add Category': Plus,
  'Add Missed Punches': CalendarClock,
  'Loading adjustment policy…': CalendarClock,
  'Configure categories': Settings,
  'Submit Expense': ReceiptText,
  'Request travel': Plane,
  'Apply for leave': CalendarPlus,
  'Request leave': CalendarPlus,
  'Leave & holidays setup': Settings,
  Refresh: RefreshCw,
  'Refreshing...': RefreshCw,
  'Security settings': Shield,
  'Back to profile': UserRound,
  Export: Download,
  'Export CSV': Download,
  Download: Download,
} as const;
