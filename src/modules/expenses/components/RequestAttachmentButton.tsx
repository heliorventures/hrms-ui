import { useEffect, useRef, useState } from 'react';

import { ExpenseEvidenceDocument, TravelEvidenceDocument } from '../../../api/graphql/graphql';
import Button from '../../../components/common/Button';
import FeedbackToast from '../../../components/common/FeedbackToast';
import { useAuth } from '../../../contexts/AuthContext';
import { useFeedbackState } from '../../../hooks/useFeedbackState';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  deferObjectUrlRevocation,
  privateFileObjectUrl,
  type PrivateFileAttachment,
} from '../../../utils/privateFileAttachment';

interface Props {
  kind: 'expense' | 'travel';
  requestId: string;
  hasFile: boolean;
}

const documents = {
  expense: ExpenseEvidenceDocument,
  travel: TravelEvidenceDocument,
};

const RequestAttachmentButton = ({ kind, requestId, hasFile }: Props) => {
  const client = useGraphClient('client');
  const { tenantId, user } = useAuth();
  const owner = `${tenantId ?? ''}:${user?.id ?? ''}:${kind}:${requestId}`;
  const currentOwner = useRef(owner);
  currentOwner.current = owner;
  const lock = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useFeedbackState<string | null>(null, 'error');
  useEffect(() => {
    setError(null);
  }, [owner, setError]);
  useEffect(
    () => () => {
      currentOwner.current = '';
    },
    []
  );

  const download = async () => {
    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    setError(null);
    const startedOwner = owner;
    try {
      const result = await client.request<{ attachment: PrivateFileAttachment | null }>(
        documents[kind],
        { id: requestId }
      );
      if (currentOwner.current !== startedOwner) return;
      if (!result.attachment) throw new Error('This historical request has no supporting file.');
      const url = privateFileObjectUrl(result.attachment);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.attachment.fileName.replace(/[\\/\x00-\x1f]/g, '_');
      document.body.append(link);
      link.click();
      link.remove();
      deferObjectUrlRevocation(url);
    } catch (cause) {
      if (currentOwner.current === startedOwner) setError(graphQlUserMessage(cause));
    } finally {
      lock.current = false;
      setLoading(false);
    }
  };

  if (!hasFile)
    return <span className="text-xs text-content-muted">No file on historical request</span>;
  return (
    <div className="space-y-1">
      <Button variant="outline" disabled={loading} onClick={() => void download()}>
        {loading ? 'Downloading...' : 'Download file'}
      </Button>
      {error ? (
        <FeedbackToast variant={'error'} messageKey={error}>
          {error}
        </FeedbackToast>
      ) : null}
    </div>
  );
};

export default RequestAttachmentButton;
