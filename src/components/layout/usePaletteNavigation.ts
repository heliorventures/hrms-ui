import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { isFeatureAccessible } from '../../guidance/featureAccess';
import type { FeatureAccessContext, FeatureDefinition } from '../../guidance/featureTypes';
import { focusFeatureAnchor, guidanceNavigationBlocked } from '../../guidance/tourNavigation';
import { useFeedbackState } from '../../hooks/useFeedbackState';
import type { NavigationDestination } from '../../navigation/navigationModel';

import { createMainFocusHandoffState } from './routeFocus';

export const usePaletteNavigation = ({
  features,
  context,
  identityKey,
  isOpen,
  accessible,
  close,
}: {
  features: FeatureDefinition[];
  context: FeatureAccessContext;
  identityKey: string;
  isOpen: boolean;
  accessible: NavigationDestination[];
  close: () => void;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname + location.search;
  const current = useRef({ identityKey, currentPath, context });
  current.current = { identityKey, currentPath, context };
  const [pending, setPending] = useState<NavigationDestination | null>(null);
  const [notice, setNotice] = useFeedbackState<string | null>(null, 'info');
  useEffect(() => {
    setPending(null);
    setNotice(null);
  }, [identityKey, isOpen, setNotice]);
  const openDestination = useCallback(
    (destination: NavigationDestination, confirmed = false) => {
      const feature = features.find(
        (item) => item.path === destination.path && item.label === destination.label
      );
      if (feature && !isFeatureAccessible(feature, context)) return;
      if (!feature && !accessible.some((item) => item.path === destination.path)) return;
      if (destination.path !== currentPath && !confirmed && guidanceNavigationBlocked()) {
        setPending(destination);
        setNotice(
          'Save or close your current form, or confirm leaving it. Unsaved changes may be lost.'
        );
        return;
      }
      setPending(null);
      setNotice(null);
      if (destination.path !== currentPath)
        navigate(destination.path, { state: createMainFocusHandoffState(location.state) });
      close();
      if (feature?.anchor)
        focusFeatureAnchor(
          feature.anchor,
          () =>
            current.current.identityKey === identityKey &&
            current.current.currentPath === destination.path &&
            isFeatureAccessible(feature, current.current.context)
        );
    },
    [
      accessible,
      close,
      context,
      currentPath,
      features,
      identityKey,
      location.state,
      navigate,
      setNotice,
    ]
  );
  return {
    openDestination,
    notice,
    pending,
    confirm: () => pending && openDestination(pending, true),
    stay: () => {
      setPending(null);
      setNotice(null);
    },
    reset: () => {
      setPending(null);
      setNotice(null);
    },
  };
};
