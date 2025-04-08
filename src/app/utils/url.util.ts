export function joinUrl(baseUrl: string, path: string): string {
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  return baseUrl + path;
}
