import { useEffect, useRef, useState } from 'react';

import {
  readRememberedNavigationCollapsed,
  writeDesktopNavigationCollapsed,
} from '../navigation/navigationPreference';

import { useAppearance } from './appearanceContext';

export function useNavigationAppearance() {
  const { preferences } = useAppearance();
  const { navigation, rememberNavigation } = preferences;
  const previous = useRef({ navigation, rememberNavigation });
  const [collapsed, setCollapsed] = useState(() =>
    rememberNavigation
      ? (readRememberedNavigationCollapsed() ?? navigation === 'collapsed')
      : navigation === 'collapsed'
  );
  useEffect(() => {
    const changed =
      previous.current.navigation !== navigation ||
      previous.current.rememberNavigation !== rememberNavigation;
    previous.current = { navigation, rememberNavigation };
    if (navigation === 'auto' && typeof window.matchMedia === 'function') {
      const media = window.matchMedia('(max-width: 1279px)');
      const update = () => setCollapsed(media.matches);
      update();
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    if (!changed) return;
    const next = navigation === 'collapsed';
    setCollapsed(next);
    if (rememberNavigation) writeDesktopNavigationCollapsed(next);
  }, [navigation, rememberNavigation]);
  const toggle = () =>
    setCollapsed((current) => {
      const next = !current;
      if (rememberNavigation) writeDesktopNavigationCollapsed(next);
      return next;
    });
  return { collapsed, toggle };
}
