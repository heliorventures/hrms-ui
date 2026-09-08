import { useState } from 'react';

import { emptyConfig, emptyConfirm } from './prejoiningAdminHelpers';
import type {
  ConfirmJoinedDraft,
  DirectoryOption,
  PrejoiningCandidate,
  PrejoiningConfig,
  PrejoiningField,
  PrejoiningInvitation,
} from './prejoiningAdminTypes';

function useWorkspaceState(canManage: boolean) {
  const [tab, setTab] = useState<'config' | 'candidates'>(canManage ? 'config' : 'candidates');
  const [config, setConfig] = useState<PrejoiningConfig>(emptyConfig);
  const [catalog, setCatalog] = useState<PrejoiningField[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DirectoryOption[]>([]);
  const [candidates, setCandidates] = useState<PrejoiningCandidate[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<PrejoiningCandidate | null>(null);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(canManage);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  return {
    tab,
    setTab,
    config,
    setConfig,
    catalog,
    setCatalog,
    documentTypes,
    setDocumentTypes,
    candidates,
    setCandidates,
    total,
    setTotal,
    offset,
    setOffset,
    statusFilter,
    setStatusFilter,
    selected,
    setSelected,
    loading,
    setLoading,
    configLoading,
    setConfigLoading,
    busyAction,
    setBusyAction,
    error,
    setError,
    notice,
    setNotice,
  };
}
function useInvitationReviewState() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitation, setInvitation] = useState<PrejoiningInvitation | null>(null);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  return {
    inviteOpen,
    setInviteOpen,
    inviteEmail,
    setInviteEmail,
    invitation,
    setInvitation,
    correctionOpen,
    setCorrectionOpen,
    feedback,
    setFeedback,
  };
}
function useJoiningState() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDraft, setConfirmDraft] = useState<ConfirmJoinedDraft>(emptyConfirm);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DirectoryOption[]>([]);
  const [designations, setDesignations] = useState<DirectoryOption[]>([]);
  const [managers, setManagers] = useState<DirectoryOption[]>([]);
  const [managerSearch, setManagerSearch] = useState('');
  const [managerOffset, setManagerOffset] = useState(0);
  const [hasMoreManagers, setHasMoreManagers] = useState(false);
  const [roles, setRoles] = useState<DirectoryOption[]>([]);
  return {
    confirmOpen,
    setConfirmOpen,
    confirmDraft,
    setConfirmDraft,
    confirmError,
    setConfirmError,
    departments,
    setDepartments,
    designations,
    setDesignations,
    managers,
    setManagers,
    managerSearch,
    setManagerSearch,
    managerOffset,
    setManagerOffset,
    hasMoreManagers,
    setHasMoreManagers,
    roles,
    setRoles,
  };
}
export function usePrejoiningAdminState(canManage: boolean) {
  return { ...useWorkspaceState(canManage), ...useInvitationReviewState(), ...useJoiningState() };
}
