// src/utils/slugify.ts
export function slugify(input: string, suffix?: string): string {
  const base = (input || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
  return (base || 'program') + (suffix ? `-${suffix}` : '');
}
