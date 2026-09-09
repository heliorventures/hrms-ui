import { Info } from 'lucide-react';
import { useContext } from 'react';

import IconButton from './IconButton';
import { PageInformationContext } from './pageInformationContext';

const PageInformationButton = ({
  showLabel = false,
  className = '',
}: {
  showLabel?: boolean;
  className?: string;
}) => {
  const information = useContext(PageInformationContext);
  if (!information?.hasInformation) return null;

  if (showLabel)
    return (
      <button
        type="button"
        aria-label="Page information"
        title="Open page information"
        aria-haspopup="dialog"
        aria-expanded={information.isOpen}
        onClick={information.open}
        className="flex min-h-11 w-11 flex-col items-center justify-center gap-1 rounded-lg py-2 text-content-secondary hover:bg-surface-selected hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus sm:w-16"
      >
        <Info className="h-5 w-5" aria-hidden="true" />
        <span className="hidden text-[10px] font-medium sm:block">Information</span>
      </button>
    );
  return (
    <IconButton
      className={className}
      label="Page information"
      title="Page information"
      icon={<Info className="h-5 w-5" />}
      aria-haspopup="dialog"
      aria-expanded={information.isOpen}
      onClick={information.open}
    />
  );
};

export default PageInformationButton;
