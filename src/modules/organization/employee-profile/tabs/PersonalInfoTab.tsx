import type { GraphQLClient } from 'graphql-request';
import { Check, Pencil } from 'lucide-react';
import { useEffect, useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

import {
  CancelEmployeeProfileChangeDocument,
  SubmitEmployeeProfileChangeDocument,
  UpdateEmployeePersonalProfileDocument,
  UpdateEmployeeSelfServiceProfileDocument,
} from '../../../../api/graphql/graphql';
import Button from '../../../../components/common/Button';
import FeedbackToast from '../../../../components/common/FeedbackToast';
import Input from '../../../../components/common/Input';
import { useActionFeedback } from '../../../../hooks/useActionFeedback';
import { useFeedbackState } from '../../../../hooks/useFeedbackState';
import { toDateInputValue } from '../../../../utils/dateInput';
import { graphQlUserMessage } from '../../../../utils/graphqlUserMessage';
import type { PersonalInfoFields, ProfileChangeRequest } from '../types';

import MaritalStatusSelect from './MaritalStatusSelect';

interface PersonalInfoTabProps {
  employeeId: string;
  client: GraphQLClient;
  initial: PersonalInfoFields;
  readOnly?: boolean;
  canManageSensitiveFields?: boolean;
  pendingRequests?: ProfileChangeRequest[];
  isSelf?: boolean;
  onChanged?: () => void;
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
  canManageSensitiveFields = false,
  pendingRequests = [],
  isSelf = false,
  onChanged,
}: PersonalInfoTabProps) {
  const notifyAction = useActionFeedback();

  const [values, setValues] = useState<PersonalInfoFields>(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useFeedbackState<string | null>(null, 'error');
  const [successMessage, setSuccessMessage] = useFeedbackState<string | null>(null, 'success');
  const [requests, setRequests] = useState(pendingRequests);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    setValues(initial);
    setDirty(false);
    setError(null);
  }, [initial, setError]);

  useEffect(() => setRequests(pendingRequests), [pendingRequests]);

  const handleChange = (field: keyof PersonalInfoFields, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setDirty(true);
    setSuccessMessage(null);
    setError(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const dob = ymdFromValue(values.dateOfBirth);
      const sensitiveChanged =
        values.firstName.trim() !== initial.firstName.trim() ||
        values.lastName.trim() !== initial.lastName.trim() ||
        dob !== ymdFromValue(initial.dateOfBirth);

      const direct = await client.request(UpdateEmployeeSelfServiceProfileDocument, {
        input: {
          employeeId,
          personalPhone: values.phone,
          currentAddress: values.currentAddress,
          permanentAddress: values.permanentAddress,
          gender: values.gender,
          maritalStatus: values.maritalStatus,
          nationality: values.nationality,
          bloodGroup: values.bloodGroup,
          emergencyContactName: values.emergencyContactName,
          emergencyContactPhone: values.emergencyContactPhone,
          emergencyContactRelation: values.emergencyContactRelation,
        },
      });

      if (sensitiveChanged) {
        if (canManageSensitiveFields) {
          await client.request(UpdateEmployeePersonalProfileDocument, {
            input: {
              employeeId,
              firstName: values.firstName.trim() || undefined,
              lastName: values.lastName.trim() || undefined,
              dateOfBirth: dob || undefined,
            },
          });
        } else {
          await client.request(SubmitEmployeeProfileChangeDocument, {
            input: {
              employeeId,
              requestType: 'LEGAL_NAME_OR_DOB',
              firstName:
                values.firstName.trim() !== initial.firstName.trim()
                  ? values.firstName.trim()
                  : undefined,
              lastName:
                values.lastName.trim() !== initial.lastName.trim()
                  ? values.lastName.trim()
                  : undefined,
              dateOfBirth: dob !== ymdFromValue(initial.dateOfBirth) ? dob || undefined : undefined,
            },
          });
        }
      }
      const updated = direct.updateEmployeeSelfServiceProfile;
      setValues((current) => ({
        ...current,
        firstName:
          sensitiveChanged && !canManageSensitiveFields ? initial.firstName : current.firstName,
        lastName:
          sensitiveChanged && !canManageSensitiveFields ? initial.lastName : current.lastName,
        dateOfBirth:
          sensitiveChanged && !canManageSensitiveFields ? initial.dateOfBirth : current.dateOfBirth,
        phone: updated.personalPhone ?? '',
        currentAddress: updated.currentAddress ?? '',
        permanentAddress: updated.permanentAddress ?? '',
        gender: updated.gender ?? '',
        maritalStatus: updated.maritalStatus ?? '',
        nationality: updated.nationality ?? '',
        bloodGroup: updated.bloodGroup ?? '',
        emergencyContactName: updated.emergencyContactName ?? '',
        emergencyContactPhone: updated.emergencyContactPhone ?? '',
        emergencyContactRelation: updated.emergencyContactRelation ?? '',
      }));
      setDirty(false);
      setSuccessMessage(
        sensitiveChanged && !canManageSensitiveFields
          ? 'Profile details saved. Legal name or date-of-birth changes were sent to HR for review.'
          : 'Profile saved.'
      );
      onChanged?.();
      window.setTimeout(() => setSuccessMessage(null), 4200);
    } catch (e) {
      setError(graphQlUserMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const disabled = readOnly === true;
  const legalChangePending = requests.some(
    (request) => request.requestType === 'LEGAL_NAME_OR_DOB' && request.status === 'PENDING'
  );

  const cancelRequest = async (requestId: string) => {
    setReviewingId(requestId);
    setError(null);
    try {
      const result = await client.request(CancelEmployeeProfileChangeDocument, { requestId });
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, status: result.cancelEmployeeProfileChange.status }
            : request
        )
      );
      notifyAction('updated');
      onChanged?.();
    } catch (cause) {
      setError(graphQlUserMessage(cause));
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {successMessage ? (
        <FeedbackToast variant={'success'} messageKey={successMessage}>
          <Check className="h-4 w-4 shrink-0" aria-hidden />
          {successMessage}
        </FeedbackToast>
      ) : null}
      {error ? (
        <FeedbackToast variant={'error'} messageKey={error}>
          {error}
        </FeedbackToast>
      ) : null}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/50">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Personal information
            </h3>
            <p className="text-xs text-slate-500">
              Contact and demographic fields save immediately. Legal name and date-of-birth changes
              are sent to HR for review.
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
              {saving ? 'Saving...' : 'Save'}
            </Button>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="Legal First Name"
            value={values.firstName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('firstName', e.target.value)
            }
            disabled={disabled || (!canManageSensitiveFields && legalChangePending)}
            fullWidth
          />
          <Input
            label="Legal Last Name"
            value={values.lastName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('lastName', e.target.value)
            }
            disabled={disabled || (!canManageSensitiveFields && legalChangePending)}
            fullWidth
          />
          <Input
            label="Blood Group"
            value={values.bloodGroup}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('bloodGroup', e.target.value)
            }
            disabled={disabled}
            fullWidth
            placeholder="e.g. O+"
          />
          <Input
            label="Work Email"
            value={values.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value)}
            disabled
            fullWidth
          />
          <Input
            label="Phone"
            value={values.phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('phone', e.target.value)}
            disabled={disabled}
            fullWidth
          />
          <Input
            label="Date Of Birth"
            type="date"
            value={ymdFromValue(values.dateOfBirth)}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('dateOfBirth', e.target.value)
            }
            disabled={disabled || (!canManageSensitiveFields && legalChangePending)}
            fullWidth
          />
          <Input
            label="Gender"
            value={values.gender}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange('gender', e.target.value)}
            disabled={disabled}
            fullWidth
          />
          <MaritalStatusSelect
            value={values.maritalStatus}
            onChange={(value) => handleChange('maritalStatus', value)}
            disabled={disabled}
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
            label="Emergency Contact Name"
            value={values.emergencyContactName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('emergencyContactName', e.target.value)
            }
            disabled={disabled}
            fullWidth
          />
          <Input
            label="Emergency Contact Phone"
            value={values.emergencyContactPhone}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleChange('emergencyContactPhone', e.target.value)
            }
            disabled={disabled}
            fullWidth
          />
          <Input
            label="Emergency Contact Relation"
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              rows={2}
              value={values.permanentAddress}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleChange('permanentAddress', e.target.value)
              }
              disabled={disabled}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Current address
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              rows={2}
              value={values.currentAddress}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                handleChange('currentAddress', e.target.value)
              }
              disabled={disabled}
            />
          </div>
        </div>
      </div>
      {requests.some((request) => request.status === 'PENDING') ? (
        <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-semibold">Pending profile changes</p>
          {requests
            .filter((request) => request.status === 'PENDING')
            .map((request) => (
              <div key={request.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>{request.requestedSummary}</span>
                <div className="flex gap-2">
                  {canManageSensitiveFields && !isSelf ? (
                    <Link
                      to="/organization/profile-reviews"
                      className="text-sm font-semibold text-indigo-700 dark:text-indigo-300"
                    >
                      Open secure review
                    </Link>
                  ) : isSelf ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={reviewingId === request.id}
                      onClick={() => void cancelRequest(request.id)}
                    >
                      Cancel request
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}
