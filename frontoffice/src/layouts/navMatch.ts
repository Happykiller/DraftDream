// src/layouts/navMatch.ts
/** Match '/route' and nested '/route/...'. Pure & testable. */
export function isSelectedPath(currentPath: string, itemPath: string): boolean {
  // Guard against empty item path
  if (!itemPath) return false;

  // Special-case root: must match exactly '/'
  if (itemPath === '/') {
    return currentPath === '/';
  }

  // For non-root paths, accept exact match or "nested" prefix match
  if (currentPath === itemPath) return true;

  // Ensure we only match nested segments, not partial tokens
  // e.g., '/program' should NOT match '/programs'
  const base = itemPath.endsWith('/') ? itemPath : `${itemPath}/`;
  return currentPath.startsWith(base);
}