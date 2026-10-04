import type { GraphQLClient } from 'graphql-request';
import { useEffect, useState } from 'react';

import Button from '../../../../components/common/Button';
import { graphQlUserMessage } from '../../../../utils/graphqlUserMessage';
import { type ImportedProfile, importedProfileDocument } from '../importedProfile';
import { formatCompactDate } from '../lib/masking';

import { InfoCard } from './InfoCard';

interface Props {
  client: GraphQLClient;
  employeeId: string;
  section: 'banking' | 'employment';
}
interface State {
  client: GraphQLClient;
  employeeId: string;
  data: ImportedProfile | null;
  error: string | null;
}

const ImportedProfileDetails = ({ client, employeeId, section }: Props) => {
  const [state, setState] = useState<State | null>(null);
  const [retry, setRetry] = useState(0);
  const current = state?.client === client && state.employeeId === employeeId ? state : null;
  useEffect(() => {
    let cancelled = false;
    setState(null);
    void client
      .request<{ employeeImportedProfile: ImportedProfile }>(importedProfileDocument, {
        employeeId,
      })
      .then(({ employeeImportedProfile }) => {
        if (!cancelled)
          setState({ client, employeeId, data: employeeImportedProfile, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setState({
            client,
            employeeId,
            data: null,
            error: graphQlUserMessage(error),
          });
      });
    return () => {
      cancelled = true;
    };
  }, [client, employeeId, retry]);
  if (current?.error)
    return (
      <div role="alert">
        <p>{current.error}</p>
        <Button type="button" size="sm" onClick={() => setRetry((value) => value + 1)}>
          Retry imported details
        </Button>
      </div>
    );
  if (!current?.data) return <p className="text-sm text-gray-500">Loading additional details...</p>;
  const { data } = current;
  const fields =
    section === 'banking'
      ? [
          ['Account holder', data.account_holder],
          ['Bank branch', data.bank_branch],
        ]
      : [
          ['Confirmation date', data.confirmation_date],
          ['Source exit date', data.source_exit_date],
          ['Source last working date', data.source_last_working_date],
        ];
  return (
    <InfoCard
      title={section === 'banking' ? 'Additional bank details' : 'Imported employment dates'}
    >
      <dl className="grid gap-3 md:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-gray-500">{label}</dt>
            <dd className="text-sm">
              {section === 'employment' && value
                ? formatCompactDate(value)
                : (value ?? 'Not supplied')}
            </dd>
          </div>
        ))}
      </dl>
      {section === 'employment' && (
        <p className="mt-2 text-xs text-gray-500">
          Source dates are retained for HR review. Employment status follows the approved lifecycle
          process.
        </p>
      )}
    </InfoCard>
  );
};

export default ImportedProfileDetails;
