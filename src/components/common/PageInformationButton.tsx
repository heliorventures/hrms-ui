import { Info } from 'lucide-react';
import { useContext } from 'react';

import IconButton from './IconButton';
import { PageInformationContext } from './pageInformationContext';

const PageInformationButton = () => {
  const information = useContext(PageInformationContext);
  if (!information?.hasInformation) return null;

  return (
    <IconButton
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
