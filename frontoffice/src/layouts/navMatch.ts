// src/layouts/navMatch.ts
/** Match '/route' and nested '/route/...'. Pure & testable. */
export function isSelectedPath(currentPath: string, itemPath: string): boolean {
  if (!itemPath) return false;
  if (currentPath === itemPath) return true;
  const base = itemPath.endsWith('/') ? itemPath : `${itemPath}/`;
  return currentPath.startsWith(base);
}
