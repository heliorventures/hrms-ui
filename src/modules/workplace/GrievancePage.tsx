import { FormEvent, useCallback, useEffect, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';
import {
  WorkplaceGrievanceDocument,
  SubmitGrievanceCaseDocument,
} from '../../api/graphql/graphql';

const GrievancePage = () => {
  const client = useGraphClient('client');
  const [categories, setCategories] = useState<{ id: string; name: string; code: string }[]>([]);
  const [cases, setCases] = useState<
    {
      id: string;
      subject: string;
      description?: string | null;
      status: string;
      filedAt: string;
      grievanceCategoryId: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    return client.request(WorkplaceGrievanceDocument, { clim: 30, calim: 50 });
  }, [client]);

  useEffect(() => {
    let c = false;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await load();
        if (!c) {
          setCategories(r.grievanceCategories);
          setCases(r.grievanceCases);
          setCategoryId((prev) => prev || r.grievanceCategories[0]?.id || '');
        }
      } catch (e) {
        if (!c) setError(graphQlUserMessage(e));
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [load]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!categoryId || !subject.trim()) {
      setFormError('Category and subject are required');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await client.request(SubmitGrievanceCaseDocument, {
        input: {
          grievanceCategoryId: categoryId,
          subject: subject.trim(),
          description: description.trim() || null,
        },
      });
      const r = await load();
      setCases(r.grievanceCases);
      setSubject('');
      setDescription('');
    } catch (err) {
      setFormError(graphQlUserMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grievance</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        File and track cases. HR users with directory access see all tenant cases; others see only
        their own.
      </p>
      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}
      <Card title="File A Case">
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              required
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>
          <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth required />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <Button type="submit" disabled={submitting || loading}>
            {submitting ? 'Submitting...' : 'Submit Case'}
          </Button>
        </form>
      </Card>
      <Card title="Cases">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : cases.length ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {cases.map((x) => (
              <li key={x.id} className="py-3">
                <p className="font-medium text-gray-900 dark:text-white">{x.subject}</p>
                <p className="text-xs text-gray-500">
                  {x.status} · {new Date(x.filedAt).toLocaleString()}
                </p>
                {x.description && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{x.description}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No Cases.</p>
        )}
      </Card>
    </div>
  );
};

export default GrievancePage;
