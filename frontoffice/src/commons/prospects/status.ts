// src/commons/prospects/status.ts
// Comment in English: Prospect status constants and helpers for UI bindings.

export const ProspectStatus = {
  LEAD: 'lead',
  CONTACTED: 'contacted',
  MEETING_SCHEDULED: 'meeting_scheduled',
  OFFER: 'offer',
  NEGOTIATION: 'negotiation',
  WON: 'won',
  LOST: 'lost',
  TODO: 'todo',
  CLIENT: 'client',
} as const;

export type ProspectStatus = (typeof ProspectStatus)[keyof typeof ProspectStatus];

export const prospectStatusLabels: Record<ProspectStatus, string> = {
  [ProspectStatus.LEAD]: 'Lead',
  [ProspectStatus.CONTACTED]: 'Contacté',
  [ProspectStatus.MEETING_SCHEDULED]: 'RDV planifié',
  [ProspectStatus.OFFER]: 'Proposition',
  [ProspectStatus.NEGOTIATION]: 'Négociation',
  [ProspectStatus.WON]: 'Gagné',
  [ProspectStatus.LOST]: 'Perdus',
  [ProspectStatus.TODO]: 'Création athlète',
  [ProspectStatus.CLIENT]: 'Client',
};

export interface ProspectStatusOption {
  value: ProspectStatus;
  label: string;
}

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
