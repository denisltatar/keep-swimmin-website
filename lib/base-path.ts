/** Must stay in sync with `basePath` in `next.config.ts` (empty in dev, set for production export). */
export const basePath = "";

/** Public folder URLs need this prefix for static export + GitHub Pages (Next may omit it on `<Image>`). */
export function publicAsset(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${p}`;
}
