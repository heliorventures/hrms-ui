import { useEffect, useState, type ChangeEvent } from 'react';
import type { GraphQLClient } from 'graphql-request';
import { Check, Pencil } from 'lucide-react';

import type { PersonalInfoFields } from '../types';
import Input from '../../../../components/common/Input';
import Button from '../../../../components/common/Button';
import { UpdateEmployeePersonalProfileDocument } from '../../../../api/graphql/graphql';
import { toDateInputValue } from '../../../../utils/dateInput';
import { graphQlUserMessage } from '../../../../utils/graphqlUserMessage';

interface PersonalInfoTabProps {
  employeeId: string;
  client: GraphQLClient;
  initial: PersonalInfoFields;
  readOnly?: boolean;
  onSaved?: () => void;
}

function ymdFromValue(isoOrYmd: string): string {
  if (!isoOrYmd) return '';
  const s = isoOrYmd.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  try {
    const d = new Date(isoOrYmd);
    if (Number.isNaN(d.getTime())) return '';
    return toDateInputValue(d);
  } catch {
    return '';
  }
}

export function PersonalInfoTab({
  employeeId,
  client,
  initial,
  readOnly,
  onSaved,
}: PersonalInfoTabProps) {
  const [values, setValues] = useState<PersonalInfoFields>(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setValues(initial);
    setDirty(false);
    setError(null);
  }, [initial]);

  const handleChange = (field: keyof PersonalInfoFields, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setDirty(true);
    setSavedFlash(false);
    setError(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const dob = ymdFromValue(values.dateOfBirth);
      await client.request(UpdateEmployeePersonalProfileDocument, {
        input: {
          employeeId,
          firstName: values.firstName.trim() || undefined,
          lastName: values.lastName.trim() || undefined,
          dateOfBirth: dob || undefined,
          gender: values.gender.trim() || undefined,
          nationality: values.nationality.trim() || undefined,
          bloodGroup: values.bloodGroup.trim() || undefined,
          emergencyContactName: values.emergencyContactName.trim() || undefined,
          emergencyContactPhone: values.emergencyContactPhone.trim() || undefined,
          emergencyContactRelation: values.emergencyContactRelation.trim() || undefined,
        },
      });
      setDirty(false);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2400);
      onSaved?.();
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const disabled = readOnly === true;

  return (
    <div className="space-y-4">
      {savedFlash ? (
        <div
          className="flex items-center gap-2 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-2 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100"
          role="status"
        >
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          Profile saved.
        </div>
      ) : null}
      {error ? (
        <div
          className="rounded-2xl border border-red-200/80 bg-red-50/90 px-4 py-2 text-sm text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-100"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/50">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Personal information
            </h3>
            <p className="text-xs text-slate-500">
              Name, demographics, and emergency contacts sync to HRMS. Work email comes from the linked
              user account.
            </p>
          </div>
          {!disabled ? (
            <Button
              type="button"
              size="sm"
              variant="primary"
              disabled={!dirty || saving}
              onClick={() => void save()}
              className="gap-1"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              {saving ? 'Saving…' : 'Save'}
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="Legal first name"
            value={values.firstName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('firstName', e.target.value)}
            disabled={disabled}
            fullWidth
          />
          <Input
            label="Legal last name"
            value={values.lastName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('lastName', e.target.value)}
            disabled={disabled}
            fullWidth
          />
          <Input
            label="Blood group"
            value={values.bloodGroup}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('bloodGroup', e.target.value)}
            disabled={disabled}
            fullWidth
            placeholder="e.g. O+"
          />
          <Input
            label="Work email"
            value={values.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
            disabled
            fullWidth
          />
          <Input
            label="Phone"
            value={values.phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('phone', e.target.value)}
            disabled
            fullWidth
          />
          <p className="md:col-span-2 -mt-2 text-xs text-slate-500">
            Phone and address are not on the employee profile API yet; they stay read-only here.
          </p>
          <Input
            label="Date of birth"
            type="date"
            value={ymdFromValue(values.dateOfBirth)}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('dateOfBirth', e.target.value)}
            disabled={disabled}
            fullWidth
          />
          <Input
            label="Gender"
            value={values.gender}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('gender', e.target.value)}
            disabled={disabled}
            fullWidth
          />
          <Input
            label="Nationality"
            value={values.nationality}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('nationality', e.target.value)
            }
            disabled={disabled}
            fullWidth
          />
          <Input
            label="Emergency contact name"
            value={values.emergencyContactName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('emergencyContactName', e.target.value)
            }
            disabled={disabled}
            fullWidth
          />
          <Input
            label="Emergency contact phone"
            value={values.emergencyContactPhone}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('emergencyContactPhone', e.target.value)
            }
            disabled={disabled}
            fullWidth
          />
          <Input
            label="Emergency contact relation"
            value={values.emergencyContactRelation}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('emergencyContactRelation', e.target.value)
            }
            disabled={disabled}
            fullWidth
          />
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Permanent address
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              rows={2}
              value={values.permanentAddress}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleChange('permanentAddress', e.target.value)
              }
              disabled
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Current address
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              rows={2}
              value={values.currentAddress}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleChange('currentAddress', e.target.value)
              }
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}
