import { registerEnumType } from '@nestjs/graphql';

export enum ProspectStatusEnum {
  LEAD = 'lead',
  CONTACTE = 'contacté',
  RDV_PLANIFIE = 'rdv planifié',
  PROPOSITION = 'propositin',
  NEGOCIATION = 'négociation',
  GAGNE = 'gagné',
  PERDUS = 'perdus',
  A_FAIRE = 'à faire',
  CLIENT = 'client',
}

registerEnumType(ProspectStatusEnum, { name: 'ProspectStatusEnum' });
