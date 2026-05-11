/**
 * Resolve JSON paths for both dev and GitHub Pages (subpath base via import.meta.env.BASE_URL).
 */
export function dataUrl(file: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/?$/, "/");
  const name = file.replace(/^\//, "");
  return `${base}data/${name}`;
}
