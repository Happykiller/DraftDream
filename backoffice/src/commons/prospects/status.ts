// src/commons/prospects/status.ts
// Comment in English: Prospect status constants and helpers for UI bindings.

export const ProspectStatusEnum = {
  LEAD: 'lead',
  CONTACTE: 'contacté',
  RDV_PLANIFIE: 'rdv planifié',
  PROPOSITION: 'propositin',
  NEGOCIATION: 'négociation',
  GAGNE: 'gagné',
  PERDUS: 'perdus',
  A_FAIRE: 'à faire',
  CLIENT: 'client',
} as const;

export type ProspectStatusEnum = (typeof ProspectStatusEnum)[keyof typeof ProspectStatusEnum];

export const prospectStatusTranslationKeys: Record<ProspectStatusEnum, string> = {
  [ProspectStatusEnum.LEAD]: 'prospects.statuses.values.lead',
  [ProspectStatusEnum.CONTACTE]: 'prospects.statuses.values.contacte',
  [ProspectStatusEnum.RDV_PLANIFIE]: 'prospects.statuses.values.rdv_planifie',
  [ProspectStatusEnum.PROPOSITION]: 'prospects.statuses.values.proposition',
  [ProspectStatusEnum.NEGOCIATION]: 'prospects.statuses.values.negociation',
  [ProspectStatusEnum.GAGNE]: 'prospects.statuses.values.gagne',
  [ProspectStatusEnum.PERDUS]: 'prospects.statuses.values.perdus',
  [ProspectStatusEnum.A_FAIRE]: 'prospects.statuses.values.a_faire',
  [ProspectStatusEnum.CLIENT]: 'prospects.statuses.values.client',
};

export interface ProspectStatusOption {
  value: ProspectStatusEnum;
  label: string;
}
