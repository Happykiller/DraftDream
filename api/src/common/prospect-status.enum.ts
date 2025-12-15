// src/common/prospect-status.enum.ts
// Centralized prospect status values to ensure consistent usage across layers.
export enum ProspectStatus {
  LEAD = 'LEAD',
  CONTACTED = 'CONTACTED',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  OFFER = 'OFFER',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
  TODO = 'TODO',
  CLIENT = 'CLIENT',
}

export type ProspectStatusValue = `${ProspectStatus}`;
