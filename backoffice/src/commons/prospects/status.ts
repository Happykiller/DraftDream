// src/commons/prospects/status.ts
// Prospect status constants - use i18n for display labels in components

export const ProspectStatus = {
  LEAD: 'LEAD',
  CONTACTED: 'CONTACTED',
  MEETING_SCHEDULED: 'MEETING_SCHEDULED',
  OFFER: 'OFFER',
  NEGOTIATION: 'NEGOTIATION',
  WON: 'WON',
  LOST: 'LOST',
  TODO: 'TODO',
  CLIENT: 'CLIENT',
} as const;

// eslint-disable-next-line no-redeclare
export type ProspectStatus = (typeof ProspectStatus)[keyof typeof ProspectStatus];
