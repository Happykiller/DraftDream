// src/commons/prospects/status.ts
// Comment in English: Prospect status constants and helpers for UI bindings.

export enum ProspectStatus {
  LEAD = 'lead',
  CONTACTED = 'contacted',
  MEETING_SCHEDULED = 'meeting_scheduled',
  OFFER = 'offer',
  NEGOTIATION = 'negotiation',
  WON = 'won',
  LOST = 'lost',
  TODO = 'todo',
  CLIENT = 'client',
}

// Keep it for backward compatibility if needed during strict transition,
// but ideally we replace usages of ProspectStatusEnum with ProspectStatus.
// For this task, we will rename it to ProspectStatus in consumers.

export const prospectStatusLabels: Record<ProspectStatus, string> = {
  [ProspectStatus.LEAD]: 'Lead',
  [ProspectStatus.CONTACTED]: 'Contacté',
  [ProspectStatus.MEETING_SCHEDULED]: 'RDV planifié',
  [ProspectStatus.OFFER]: 'Proposition',
  [ProspectStatus.NEGOTIATION]: 'Négociation',
  [ProspectStatus.WON]: 'Gagné',
  [ProspectStatus.LOST]: 'Perdus',
  [ProspectStatus.TODO]: 'À faire',
  [ProspectStatus.CLIENT]: 'Client',
};

export interface ProspectStatusOption {
  value: ProspectStatus;
  label: string;
}
