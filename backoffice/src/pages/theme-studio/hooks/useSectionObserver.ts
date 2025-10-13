// src/pages/theme-studio/hooks/useSectionObserver.ts
import * as React from 'react';

/** Track which section id is currently visible on screen using IntersectionObserver. */
export function useSectionObserver(ids: string[]): string | null {
  const [active, setActive] = React.useState<string | null>(ids[0] ?? null);

  React.useEffect(() => {
    if (ids.length === 0) return undefined;
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      {
        rootMargin: '-40% 0px -40% 0px',
        threshold: [0, 0.25, 0.5, 1],
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [ids]);

  return active;
}
