import { Router } from "@angular/router";

export function joinUrl(baseUrl: string, path: string): string {
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  if (path.startsWith('/')) {
    path = path.substring(1);
  }
  return baseUrl + path;
}

export function getLastRouteSegment(router: Router): string {
  const urlTree = router.parseUrl(router.url);
  const segments = urlTree.root.children['primary']?.segments || [];
  return segments.length > 0 
    ? segments[segments.length - 1].path.toLowerCase()
    : '';
}
