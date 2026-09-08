import { useCallback, useEffect, useState } from 'react';

import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { useGraphClient } from '../../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../../utils/graphqlUserMessage';
import {
  MyCelebrationPreferencesSafeDocument,
  UpdateMyCelebrationPreferencesSafeDocument,
  type CelebrationPreferencesData,
  type UpdateCelebrationPreferencesData,
} from '../../notifications/notificationAutomationQueries';

const CelebrationPreferencesCard = () => {
  const client = useGraphClient('client');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [shareBirthday, setShareBirthday] = useState(false);
  const [shareWorkAnniversary, setShareWorkAnniversary] = useState(false);

  const load = useCallback(async () => {
    const response = await client.request<CelebrationPreferencesData>(
      MyCelebrationPreferencesSafeDocument,
      {}
    );
    setShareBirthday(response.myCelebrationPreferences.shareBirthday);
    setShareWorkAnniversary(response.myCelebrationPreferences.shareWorkAnniversary);
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void load()
      .catch((cause: unknown) => {
        if (!cancelled) setError(graphQlUserMessage(cause));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const response = await client.request<UpdateCelebrationPreferencesData>(
        UpdateMyCelebrationPreferencesSafeDocument,
        {
          input: { shareBirthday, shareWorkAnniversary },
        }
      );
      setShareBirthday(response.updateMyCelebrationPreferences.shareBirthday);
      setShareWorkAnniversary(response.updateMyCelebrationPreferences.shareWorkAnniversary);
      setSaved(true);
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Celebration Privacy">
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        Choose whether your birthday and work anniversary may be announced company-wide. If you do
        not opt in, alerts remain private to you and your reporting manager.
      </p>

      {error ? (
        <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="mb-4 text-sm text-green-700 dark:text-green-300" role="status">
          Celebration privacy saved.
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
      ) : (
        <div className="space-y-4">
          <label className="flex items-start gap-3 text-sm text-gray-800 dark:text-gray-200">
            <input
              type="checkbox"
              aria-label="Share my birthday company-wide"
              checked={shareBirthday}
              onChange={(event) => {
                setSaved(false);
                setShareBirthday(event.target.checked);
              }}
              className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
            />
            <span>
              <span className="font-medium">Share my birthday company-wide</span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                Your age and birth year are never included.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-gray-800 dark:text-gray-200">
            <input
              type="checkbox"
              aria-label="Share my work anniversary company-wide"
              checked={shareWorkAnniversary}
              onChange={(event) => {
                setSaved(false);
                setShareWorkAnniversary(event.target.checked);
              }}
              className="mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600"
            />
            <span className="font-medium">Share my work anniversary company-wide</span>
          </label>

          <Button type="button" variant="primary" disabled={saving} onClick={() => void save()}>
            {saving ? 'Saving...' : 'Save Celebration Privacy'}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default CelebrationPreferencesCard;
