import { ActivatedRoute, Router } from '@angular/router';

/**
 * Remove specific query params from the current route URL without adding a new history entry.
 * - router: Angular Router instance
 * - route: current ActivatedRoute (use this.route in components)
 * - paramsToRemove: array of query param names to remove (default: ['token','userId'])
 */
export function removeQueryParams(
  router: Router,
  route: ActivatedRoute,
  paramsToRemove: string[] = ['token', 'userId']
): void {
  const current = { ...route.snapshot.queryParams };

  let changed = false;
  for (const p of paramsToRemove) {
    if (current.hasOwnProperty(p)) {
      delete current[p];
      changed = true;
    }
  }

  if (!changed) return;

  router
    .navigate([], {
      relativeTo: route,
      queryParams: current,
      replaceUrl: true,
    })
    .catch(() => {});
}
