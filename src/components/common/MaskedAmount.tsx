import { useCallback } from 'react';

import SensitiveValue from './SensitiveValue';

interface MaskedAmountProps {
  amount: number;
  formatter?: (n: number) => string;
  className?: string;
}

const defaultFormatter = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

const MASK = 'XXXX';

const MaskedAmount = ({
  amount,
  formatter = defaultFormatter,
  className = '',
}: MaskedAmountProps) => {
  const resolveAmount = useCallback(() => formatter(amount), [amount, formatter]);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <SensitiveValue
        label="amount"
        value={String(amount)}
        resolveValue={resolveAmount}
        maskedValue={MASK}
        mayReveal
      />
    </span>
  );
};

export default MaskedAmount;
