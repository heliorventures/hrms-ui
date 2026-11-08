import type { Dispatch, SetStateAction } from 'react';

import Button from '../../components/common/Button';
import FeedbackToast from '../../components/common/FeedbackToast';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';

import { EMPTY_LOCATION, type CompanyLocation } from './companyLocationTypes';
import type { useCompanyMutation } from './useCompanyMutation';
interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  editing: CompanyLocation | null;
  draft: typeof EMPTY_LOCATION;
  setDraft: Dispatch<SetStateAction<typeof EMPTY_LOCATION>>;
  retiring: CompanyLocation | null;
  setRetiring: (value: CompanyLocation | null) => void;
  mutation: ReturnType<typeof useCompanyMutation>;
  save: () => Promise<void>;
  retire: () => Promise<void>;
  reload: () => void;
}
const FIELD_LIMITS = { name: 200, address: 500, city: 100, state: 100, country: 100 };
const CompanyLocationDialogs = ({
  open,
  setOpen,
  editing,
  draft,
  setDraft,
  retiring,
  setRetiring,
  mutation,
  save,
  retire,
  reload,
}: Props) => {
  return (
    <>
      <Modal
        isOpen={open}
        isDismissible={!mutation.busy}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Location' : 'Add Location'}
      >
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          {(Object.keys(EMPTY_LOCATION) as (keyof typeof EMPTY_LOCATION)[]).map((field) => (
            <Input
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              value={draft[field]}
              required={field === 'name'}
              maxLength={FIELD_LIMITS[field]}
              disabled={mutation.busy}
              onChange={(event) => setDraft({ ...draft, [field]: event.target.value })}
              fullWidth
            />
          ))}
          {mutation.error ? (
            <FeedbackToast
              variant={'error'}
              messageKey={mutation.error}
              action={
                <>
                  <Button type="button" onClick={reload}>
                    Reload list
                  </Button>
                </>
              }
            >
              {mutation.error}{' '}
            </FeedbackToast>
          ) : null}
          <Button type="submit" disabled={mutation.busy}>
            {mutation.busy ? 'Saving...' : 'Save Location'}
          </Button>
        </form>
      </Modal>
      <Modal
        isOpen={!!retiring}
        isDismissible={!mutation.busy}
        onClose={() => setRetiring(null)}
        title="Retire Location"
      >
        <p>
          Retire {retiring?.name}? Assigned employees, holiday calendars, and active or scheduled
          weekly-off overrides must be moved first.
        </p>
        {mutation.error ? (
          <FeedbackToast variant={'error'} messageKey={mutation.error}>
            {mutation.error}
          </FeedbackToast>
        ) : null}
        <Button className="mt-3" disabled={mutation.busy} onClick={() => void retire()}>
          Retire Location
        </Button>
      </Modal>
    </>
  );
};
export default CompanyLocationDialogs;
