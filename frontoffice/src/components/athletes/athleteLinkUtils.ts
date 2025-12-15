// src/components/athletes/athleteLinkUtils.ts
import type { CoachAthleteLink } from '@app-types/coachAthletes';

/**
 * Build a display-ready athlete full name fallback chain for a coach-athlete link.
 */
export function getAthleteDisplayName(link: CoachAthleteLink): string {
  const first = link.athlete?.first_name ?? '';
  const last = link.athlete?.last_name ?? '';
  const fallback = link.athlete?.email || link.athleteId;
  const display = `${first} ${last}`.trim();

  return display || fallback;
}
