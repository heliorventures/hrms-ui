import { useEffect, useState } from 'react';

import { useFragment } from '../../api/graphql/fragment-masking';

import {
  ActivateWorkingCalendarDocument,
  PreviewWeeklyOffMonthDocument,
  ScheduleWeeklyOffPolicyDocument,
  WorkingCalendarFieldsFragmentDoc,
  WorkingCalendarPolicyDocument,
} from './companyLocationDocuments';
import { useCompanyMutation } from './useCompanyMutation';
import { useCompanyResource } from './useCompanyResource';

export const useWeeklyOffSettings = (locationId: string) => {
  const resource = useCompanyResource(WorkingCalendarPolicyDocument, {
    locationId: locationId || null,
  });
  const mutation = useCompanyMutation();
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [saturdays, setSaturdays] = useState<number[]>([]);
  const [inherits, setInherits] = useState(false);
  const [effective, setEffective] = useState('');
  const [month, setMonth] = useState('');
  const [preview, setPreview] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);
  const policy = useFragment(
    WorkingCalendarFieldsFragmentDoc,
    resource.data?.workingCalendarPolicy
  );
  const dirty =
    !!policy &&
    (effective !== policy.businessDate ||
      inherits !== (!!locationId && (policy.currentVersion?.inheritsDefault ?? true)) ||
      JSON.stringify(weekdays) !== JSON.stringify(policy.currentVersion?.fixedWeekdays ?? []) ||
      JSON.stringify(saturdays) !== JSON.stringify(policy.currentVersion?.saturdayOrdinals ?? []));
  useEffect(() => {
    setPreview([]);
    if (!policy) return;
    setEffective(policy.businessDate);
    setMonth(policy.businessDate.slice(0, 7));
    setWeekdays(policy.currentVersion?.fixedWeekdays ?? []);
    setSaturdays(policy.currentVersion?.saturdayOrdinals ?? []);
    setInherits(!!locationId && (policy.currentVersion?.inheritsDefault ?? true));
  }, [policy, locationId]);
  const change = (set: (values: number[]) => void, values: number[], value: number) => {
    set(
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value].sort((a, b) => a - b)
    );
    setPreview([]);
    setSuccess(null);
  };
  const rule = { fixedWeekdays: weekdays, saturdayOrdinals: saturdays };
  const activate = async () => {
    if (
      policy &&
      (await mutation.run(ActivateWorkingCalendarDocument, { activationDate: policy.businessDate }))
    ) {
      setSuccess(
        'Working calendar activated with Saturday and Sunday off. Save a policy separately to change this.'
      );
      resource.reload();
    }
  };
  const save = async () => {
    if (!policy?.activationDate) return;
    const result = await mutation.run(ScheduleWeeklyOffPolicyDocument, {
      input: {
        locationId: locationId || null,
        effectiveFrom: effective,
        inheritsDefault: inherits,
        rule: inherits ? { fixedWeekdays: [], saturdayOrdinals: [] } : rule,
        expectedRevision: policy.revision,
      },
    });
    if (result) {
      setSuccess('Weekly-off policy saved. Earlier request allocations retain their saved dates.');
      resource.reload();
    }
  };
  const requestPreview = async () => {
    if (inherits) return;
    const [year, selectedMonth] = month.split('-').map(Number);
    const data = await mutation.run(PreviewWeeklyOffMonthDocument, {
      rule,
      month: selectedMonth,
      year,
    });
    if (data) setPreview(data.previewWeeklyOffMonth);
  };
  return {
    ...resource,
    ...mutation,
    error: mutation.error ?? resource.error,
    policy,
    dirty,
    weekdays,
    saturdays,
    inherits,
    effective,
    month,
    preview,
    success,
    setInherits,
    setEffective,
    setMonth,
    change,
    setWeekdays,
    setSaturdays,
    activate,
    save,
    requestPreview,
  };
};
