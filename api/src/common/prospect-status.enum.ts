// src/common/prospect-status.enum.ts
// Centralized prospect status values to ensure consistent usage across layers.
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

export type ProspectStatusValue = `${ProspectStatus}`;
