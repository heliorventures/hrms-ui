import { useState } from 'react';

import {
  CompanyLocationsDocument,
  RetireCompanyLocationDocument,
  SaveCompanyLocationDocument,
} from './companyLocationDocuments';
import { EMPTY_LOCATION, type CompanyLocation, type LocationPage } from './companyLocationTypes';
import { useCompanyMutation } from './useCompanyMutation';
import { useCompanyResource } from './useCompanyResource';
const empty = EMPTY_LOCATION;
export const useCompanyLocationsWorkspace = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [activeOnly, setActiveOnly] = useState(true);
  const resource = useCompanyResource<{ companyLocations: LocationPage }>(
    CompanyLocationsDocument,
    { page: { page, perPage: 25 }, search: search.trim() || null, activeOnly }
  );
  const mutation = useCompanyMutation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyLocation | null>(null);
  const [draft, setDraft] = useState(empty);
  const [retiring, setRetiring] = useState<CompanyLocation | null>(null);
  const edit = (row: CompanyLocation | null) => {
    setEditing(row);
    setDraft(
      row
        ? {
            name: row.name,
            address: row.address ?? '',
            city: row.city ?? '',
            state: row.state ?? '',
            country: row.country ?? '',
          }
        : empty
    );
    mutation.setError(null);
    setOpen(true);
  };
  const save = async () => {
    const input = {
      ...draft,
      id: editing?.id ?? null,
      expectedUpdatedAt: editing?.updatedAt ?? null,
    };
    const result = await mutation.run(SaveCompanyLocationDocument, { input });
    if (result) {
      setOpen(false);
      resource.reload();
    }
  };
  const retire = async () => {
    if (!retiring) return;
    if (
      await mutation.run(RetireCompanyLocationDocument, {
        id: retiring.id,
        expectedUpdatedAt: retiring.updatedAt,
      })
    ) {
      setRetiring(null);
      resource.reload();
    }
  };

  return {
    search,
    setSearch,
    page,
    setPage,
    activeOnly,
    setActiveOnly,
    resource,
    mutation,
    open,
    setOpen,
    editing,
    draft,
    setDraft,
    retiring,
    setRetiring,
    edit,
    save,
    retire,
  };
};
