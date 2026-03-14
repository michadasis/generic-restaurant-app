import { useEffect, useState } from 'react';

const GITHUB_API = 'https://api.github.com/repos/michadasis/generic-restaurant-app/releases/latest';
export const CURRENT_VERSION = '1.4.1';

export interface UpdateInfo {
  version: string;
  downloadUrl: string;
  releaseUrl: string;
}

function isNewer(latest: string, current: string): boolean {
  const parse = (v: string) =>
    v.replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const [la, lb, lc] = parse(latest);
  const [ca, cb, cc] = parse(current);
  if (la !== ca) return la > ca;
  if (lb !== cb) return lb > cb;
  return lc > cc;
}

export function useUpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    fetch(GITHUB_API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(r => {
        if (!r.ok) throw new Error(`GitHub API returned ${r.status}`);
        return r.json();
      })
      .then(data => {
        const tag: string = data.tag_name ?? '';
        console.log('[Updater] Latest tag:', tag, '| Current:', CURRENT_VERSION);
        if (!tag || !isNewer(tag, CURRENT_VERSION)) return;

        const apkAsset = (data.assets ?? []).find((a: any) =>
          (a.name as string).toLowerCase().endsWith('.apk')
        );

        setUpdateInfo({
          version: tag.replace(/^v/, ''),
          downloadUrl: apkAsset?.browser_download_url ?? data.html_url,
          releaseUrl: data.html_url,
        });
      })
      .catch(err => console.warn('[Updater] Failed to check for updates:', err));
  }, []);

  return { updateInfo, dismiss: () => setUpdateInfo(null) };
}