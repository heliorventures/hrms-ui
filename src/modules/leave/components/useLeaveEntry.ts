import { useRef, useState } from 'react';

interface LeaveEntryOptions {
  hasOtherInput: boolean;
  canDismiss: () => boolean;
  onDiscard: () => void;
  onDateChange: (field: 'fromDate' | 'toDate') => void;
}

export function useLeaveEntry({
  hasOtherInput,
  canDismiss,
  onDiscard,
  onDateChange,
}: LeaveEntryOptions) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const toDateEditedRef = useRef(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const resetEntry = () => {
    setFromDate('');
    setToDate('');
    toDateEditedRef.current = false;
    setConfirmDiscard(false);
  };
  const handleFromDateChange = (value: string) => {
    onDateChange('fromDate');
    setFromDate(value);
    if (!toDateEditedRef.current) {
      onDateChange('toDate');
      setToDate(value);
    }
  };
  const handleToDateChange = (value: string) => {
    onDateChange('toDate');
    toDateEditedRef.current = true;
    setToDate(value);
  };
  const handleClose = () => {
    if (!canDismiss()) return;
    if (hasOtherInput || fromDate || toDate) {
      setConfirmDiscard(true);
      return;
    }
    onDiscard();
  };
  const handleDiscard = () => {
    if (canDismiss()) onDiscard();
  };
  return {
    fromDate,
    toDate,
    confirmDiscard,
    resetEntry,
    handleFromDateChange,
    handleToDateChange,
    handleClose,
    handleDiscard,
    clearDiscard: () => setConfirmDiscard(false),
  };
}
