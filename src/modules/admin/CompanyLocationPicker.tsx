import { useRef, useState } from 'react';

import { authorizationStateKey } from '../../auth/permissionService';
import FeedbackToast from '../../components/common/FeedbackToast';
import Input from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';

import { CompanyLocationOptionsDocument } from './companyLocationDocuments';
import { useCompanyResource } from './useCompanyResource';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  selectedName?: string | null;
}
const CompanyLocationPicker = ({
  value,
  onChange,
  label = 'Company location',
  disabled = false,
  selectedName,
}: Props) => {
  const [search, setSearch] = useState('');
  const result = useCompanyResource(CompanyLocationOptionsDocument, {
    search: search.trim() || null,
  });
  const options = result.data?.companyLocationOptions ?? [];
  const auth = useAuth();
  const identity = JSON.stringify([
    auth.tenantId,
    auth.user?.id,
    authorizationStateKey(auth.clientSession),
  ]);
  const names = useRef({ identity, client: result.client, values: new Map<string, string>() });
  if (names.current.identity !== identity || names.current.client !== result.client)
    names.current = { identity, client: result.client, values: new Map() };
  for (const option of options) names.current.values.set(option.id, option.name);
  return (
    <div className="space-y-2">
      <Input
        label="Find location"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        disabled={disabled}
        fullWidth
      />
      <label className="block text-sm font-medium">
        {label}
        <select
          className="mt-1 w-full rounded border bg-white p-2 dark:bg-gray-800"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled || result.loading || !!result.error}
        >
          <option value="">Company default / all locations</option>
          {value && !options.some((option) => option.id === value) ? (
            <option value={value}>
              {names.current.values.get(value) ?? selectedName ?? 'Selected location'}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
      {result.loading ? <p className="text-xs">Loading locations...</p> : null}
      {result.error ? (
        <FeedbackToast
          variant={'error'}
          messageKey={result.error}
          action={
            <>
              <button type="button" onClick={result.reload}>
                Retry
              </button>
            </>
          }
        >
          {result.error}{' '}
        </FeedbackToast>
      ) : null}
    </div>
  );
};
export default CompanyLocationPicker;
