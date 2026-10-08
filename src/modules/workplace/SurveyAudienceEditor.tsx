import { useCallback, useEffect, useRef, useState } from 'react';

import Button from '../../components/common/Button';
import { useGraphClient } from '../../hooks/useGraphClient';
import { graphQlUserMessage } from '../../utils/graphqlUserMessage';

import type { SurveyDraft } from './surveyEditorModel';
import { SurveyAudienceOptionsDocument } from './surveyQueries';

type Option = { id: string; label: string };
const useAudienceOptions = (kind: SurveyDraft['audienceKind']) => {
  const client = useGraphClient('client');
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef(0);
  const invalidate = useCallback(() => {
    ++request.current;
  }, []);
  const load = useCallback(
    async (query: string, after: string | null = null) => {
      const token = ++request.current;
      setBusy(true);
      setError(null);
      try {
        const result = await client.request<{
          surveyAudienceOptions: { nodes: Option[]; nextCursor: string | null };
        }>(SurveyAudienceOptionsDocument, { kind, search: query || null, after, limit: 50 });
        if (token !== request.current) return;
        setOptions((current) =>
          after
            ? [
                ...new Map(
                  [...current, ...result.surveyAudienceOptions.nodes].map((o) => [o.id, o])
                ).values(),
              ]
            : result.surveyAudienceOptions.nodes
        );
        setCursor(result.surveyAudienceOptions.nextCursor);
        setActiveSearch(query);
      } catch (cause) {
        if (token === request.current) setError(graphQlUserMessage(cause));
      } finally {
        if (token === request.current) setBusy(false);
      }
    },
    [client, kind]
  );
  useEffect(() => {
    setSearch('');
    setOptions([]);
    setCursor(null);
    setError(null);
    if (kind !== 'ALL') void load('');
    else setBusy(false);
    return invalidate;
  }, [kind, load, invalidate]);
  return { search, setSearch, activeSearch, options, cursor, busy, error, load };
};

const AudienceSelections = ({
  options,
  selected,
  select,
}: {
  options: Option[];
  selected: string[];
  select: (ids: string[]) => void;
}) => (
  <div className="flex flex-wrap gap-3">
    {options.map((o) => (
      <label className="text-sm" key={o.id}>
        <input
          type="checkbox"
          checked={selected.includes(o.id)}
          onChange={(e) =>
            select(e.target.checked ? [...selected, o.id] : selected.filter((id) => id !== o.id))
          }
        />{' '}
        {o.label}
      </label>
    ))}
    {selected
      .filter((id) => !options.some((o) => o.id === id))
      .map((id) => (
        <label className="block text-sm" key={id}>
          <input
            type="checkbox"
            checked
            onChange={() => select(selected.filter((value) => value !== id))}
          />{' '}
          Saved selection {id} (outside current results)
        </label>
      ))}
  </div>
);

const SurveyAudienceEditor = ({
  draft,
  setDraft,
}: {
  draft: SurveyDraft;
  setDraft: (draft: SurveyDraft) => void;
}) => {
  const kind = draft.audienceKind;
  const { search, setSearch, activeSearch, options, cursor, busy, error, load } =
    useAudienceOptions(kind);
  const selections = {
    ALL: [],
    EMPLOYEE: draft.employees,
    LOCATION: draft.locations,
    DEPARTMENT: draft.audience,
  };
  const selected = selections[kind];
  const select = (ids: string[]) =>
    setDraft({
      ...draft,
      audience: kind === 'DEPARTMENT' ? ids : [],
      locations: kind === 'LOCATION' ? ids : [],
      employees: kind === 'EMPLOYEE' ? ids : [],
    });
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">Survey audience</legend>
      <label className="block text-sm">
        Audience type
        <select
          className="min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2"
          value={kind}
          onChange={(e) =>
            setDraft({
              ...draft,
              audienceKind: e.target.value as SurveyDraft['audienceKind'],
              audience: [],
              locations: [],
              employees: [],
            })
          }
        >
          <option value="ALL">All employees</option>
          <option value="DEPARTMENT">Selected departments</option>
          <option value="LOCATION">Selected locations</option>
          <option value="EMPLOYEE">Selected employees</option>
        </select>
      </label>
      {kind !== 'ALL' && (
        <>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex-1 text-sm">
              Search audience
              <input
                className="min-h-10 w-full rounded-md border border-line bg-surface px-3 py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <Button size="sm" variant="outline" busy={busy} onClick={() => void load(search)}>
              Search audience
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-status-danger">
              {error}
            </p>
          )}
          <AudienceSelections options={options} selected={selected} select={select} />
          {!busy && !error && options.length === 0 && (
            <p className="text-sm text-content-secondary">No matching audience options.</p>
          )}
          <p className="text-xs text-content-secondary">
            {selected.length} selected. Eligibility is checked again when published.
          </p>
          {cursor && (
            <Button
              size="sm"
              variant="outline"
              busy={busy}
              onClick={() => void load(activeSearch, cursor)}
            >
              Load more audience options
            </Button>
          )}
        </>
      )}
    </fieldset>
  );
};
export default SurveyAudienceEditor;
