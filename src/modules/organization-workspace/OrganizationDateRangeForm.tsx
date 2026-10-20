import { useState } from 'react';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

import type { OrganizationDateRange } from './organizationReportingModel';

interface Props {
  history: boolean;
  onApply: (range: OrganizationDateRange) => void;
}
const OrganizationDateRangeForm = ({ history, onApply }: Props) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onApply({ from, to });
      }}
    >
      <Input
        label={history ? 'From (UTC date)' : 'From work date'}
        type="date"
        required
        value={from}
        max={to || undefined}
        onChange={(event) => setFrom(event.target.value)}
      />
      <Input
        label={history ? 'Through (UTC date)' : 'Through work date'}
        type="date"
        required
        value={to}
        min={from || undefined}
        onChange={(event) => setTo(event.target.value)}
      />
      <Button type="submit">Load authorized records</Button>
    </form>
  );
};

export default OrganizationDateRangeForm;
