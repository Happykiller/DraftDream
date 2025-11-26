// src/commons/prospects/status.ts
// Comment in English: Prospect status constants and helpers for UI bindings.

export const ProspectStatusEnum = {
  LEAD: 'LEAD',
  CONTACTE: 'CONTACTE',
  RDV_PLANIFIE: 'RDV_PLANIFIE',
  PROPOSITION: 'PROPOSITION',
  NEGOCIATION: 'NEGOCIATION',
  GAGNE: 'GAGNE',
  PERDUS: 'PERDUS',
  A_FAIRE: 'A_FAIRE',
  CLIENT: 'CLIENT',
} as const;

export type ProspectStatusEnum = (typeof ProspectStatusEnum)[keyof typeof ProspectStatusEnum];

export const prospectStatusLabels: Record<ProspectStatusEnum, string> = {
  [ProspectStatusEnum.LEAD]: 'Lead',
  [ProspectStatusEnum.CONTACTE]: 'Contacté',
  [ProspectStatusEnum.RDV_PLANIFIE]: 'RDV planifié',
  [ProspectStatusEnum.PROPOSITION]: 'Proposition',
  [ProspectStatusEnum.NEGOCIATION]: 'Négociation',
  [ProspectStatusEnum.GAGNE]: 'Gagné',
  [ProspectStatusEnum.PERDUS]: 'Perdus',
  [ProspectStatusEnum.A_FAIRE]: 'À faire',
  [ProspectStatusEnum.CLIENT]: 'Client',
};

export interface ProspectStatusOption {
  value: ProspectStatusEnum;
  label: string;
}
