// src/commons/prospects/status.ts
// Comment in English: Prospect status constants and helpers for UI bindings.

export enum ProspectStatusEnum {
  LEAD = 'LEAD',
  CONTACTE = 'CONTACTE',
  RDV_PLANIFIE = 'RDV_PLANIFIE',
  PROPOSITION = 'PROPOSITION',
  NEGOCIATION = 'NEGOCIATION',
  GAGNE = 'GAGNE',
  PERDUS = 'PERDUS',
  A_FAIRE = 'A_FAIRE',
  CLIENT = 'CLIENT',
}

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

/** Ordered list of statuses used to build the prospect pipeline. */
export const pipelineStatuses: ProspectStatusEnum[] = [
  ProspectStatusEnum.LEAD,
  ProspectStatusEnum.CONTACTE,
  ProspectStatusEnum.RDV_PLANIFIE,
  ProspectStatusEnum.PROPOSITION,
  ProspectStatusEnum.NEGOCIATION,
  ProspectStatusEnum.GAGNE,
  ProspectStatusEnum.PERDUS,
];
