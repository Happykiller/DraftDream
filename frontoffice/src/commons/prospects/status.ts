// src/commons/prospects/status.ts
// Prospect status enum and pipeline configuration.
// Use i18n for display labels in components (see prospects.workflow.stages in translation files).

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

export type ProspectStatus = (typeof ProspectStatus)[keyof typeof ProspectStatus];

/** Ordered list of statuses used to build the prospect pipeline. */
export const pipelineStatuses: ProspectStatus[] = [
  ProspectStatus.LEAD,
  ProspectStatus.CONTACTED,
  ProspectStatus.MEETING_SCHEDULED,
  ProspectStatus.OFFER,
  ProspectStatus.NEGOTIATION,
  ProspectStatus.WON,
  ProspectStatus.TODO,
  ProspectStatus.LOST,
];
