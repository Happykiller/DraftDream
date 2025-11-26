// src/common/prospect-status.enum.ts
// Centralized prospect status values to ensure consistent usage across layers.
export enum ProspectStatus {
  LEAD = 'lead',
  CONTACTE = 'contacté',
  RDV_PLANIFIE = 'rdv planifié',
  PROPOSITION = 'proposition',
  NEGOCIATION = 'négociation',
  GAGNE = 'gagné',
  PERDUS = 'perdus',
  A_FAIRE = 'à faire',
  CLIENT = 'client',
}

export type ProspectStatusValue = `${ProspectStatus}`;
