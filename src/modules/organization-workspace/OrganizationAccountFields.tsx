import type { OrganizationRecord } from './organizationDocuments';
import { text } from './organizationHrModel';

const OrganizationAccountFields = ({
  roles,
  selected,
  onChange,
}: {
  roles: OrganizationRecord[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) => (
  <fieldset className="my-3 space-y-2">
    <legend>Source company roles</legend>
    {roles.map((role) => {
      const id = text(role, 'role_id');
      return (
        <label key={id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected.includes(id)}
            onChange={(event) =>
              onChange(
                event.target.checked ? [...selected, id] : selected.filter((value) => value !== id)
              )
            }
          />
          {text(role, 'name')}
        </label>
      );
    })}
  </fieldset>
);

export default OrganizationAccountFields;
