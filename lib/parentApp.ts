export type ParentAppSection =
  | 'home'
  | 'tracker'
  | 'worries'
  | 'goals'
  | 'tips'
  | 'settings'
  | 'sounds'
  | 'account';

interface OpenParentAppOptions {
  section?: ParentAppSection;
  familyId?: string | null;
  childName?: string | null;
}

const normalizeBaseUrl = (url?: string): string => {
  return (url || '').trim().replace(/\/+$/, '');
};

export const getParentAppBaseUrl = (): string => {
  return normalizeBaseUrl(import.meta.env.VITE_PARENT_APP_URL);
};

export const hasExternalParentApp = (): boolean => {
  return Boolean(getParentAppBaseUrl());
};

export const buildParentAppUrl = ({
  section = 'home',
  familyId,
  childName,
}: OpenParentAppOptions = {}): string | null => {
  const baseUrl = getParentAppBaseUrl();
  if (!baseUrl) return null;

  const url = new URL(baseUrl);
  url.searchParams.set('source', 'cobie-child-app');
  url.searchParams.set('tab', section);
  url.searchParams.set('section', section);
  url.hash = section;

  if (familyId) {
    url.searchParams.set('familyId', familyId);
  }

  if (childName) {
    url.searchParams.set('childName', childName);
  }

  return url.toString();
};

export const openParentApp = (options: OpenParentAppOptions = {}): boolean => {
  const url = buildParentAppUrl(options);
  if (!url || typeof window === 'undefined') return false;

  window.location.assign(url);
  return true;
};
