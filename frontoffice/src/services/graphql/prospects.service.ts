// src/services/graphql/prospects.service.ts
import inversify from '@src/commons/inversify';

import type { Prospect, ProspectListResult } from '@app-types/prospects';
import type { ProspectStatus } from '@src/commons/prospects/status';

import { GraphqlServiceFetch } from './graphql.service.fetch';

const PROSPECT_FRAGMENT = `
  id
  firstName
  lastName
  email
  phone
  status
  levelId
  sourceId
  objectiveIds
  activityPreferenceIds
  medicalConditions
  allergies
  notes
  budget
  dealDescription
  desiredStartDate
  workflowHistory { status date }
  createdBy
  createdAt
  updatedAt
  creator { id email first_name last_name }
  level { id label slug }
  source { id label slug }
  objectives { id label }
  activityPreferences { id label }
`;

const LIST_QUERY = `
  query ListProspects($input: ListProspectsInput) {
    prospect_list(input: $input) {
      items {
        ${PROSPECT_FRAGMENT}
      }
      total
      page
      limit
    }
  }
`;

const GET_QUERY = `
  query GetProspect($id: ID!) {
    prospect_get(id: $id) {
      ${PROSPECT_FRAGMENT}
    }
  }
`;

const CREATE_MUTATION = `
  mutation CreateProspect($input: CreateProspectInput!) {
    prospect_create(input: $input) {
      ${PROSPECT_FRAGMENT}
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateProspect($input: UpdateProspectInput!) {
    prospect_update(input: $input) {
      ${PROSPECT_FRAGMENT}
    }
  }
`;

const DELETE_MUTATION = `
  mutation DeleteProspect($id: ID!) {
    prospect_delete(id: $id)
  }
`;

type ProspectListPayload = { prospect_list: ProspectListResult };
type ProspectGetPayload = { prospect_get: Prospect | null };
type ProspectCreatePayload = { prospect_create: Prospect | null };
type ProspectUpdatePayload = { prospect_update: Prospect | null };
type ProspectDeletePayload = { prospect_delete: boolean };

export interface ProspectListInput {
  page: number;
  limit: number;
  q?: string;
  status?: ProspectStatus | null;
  levelId?: string | null;
  sourceId?: string | null;
}

export interface ProspectCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: ProspectStatus | null;
  levelId?: string | null;
  sourceId?: string | null;
  objectiveIds?: string[];
  activityPreferenceIds?: string[];
  medicalConditions?: string;
  allergies?: string;
  notes?: string;
  budget?: number;
  dealDescription?: string;
  desiredStartDate?: string;
}

export interface ProspectUpdateInput extends Partial<ProspectCreateInput> {
  id: string;
}

function sanitizeListInput(input: ProspectListInput): Record<string, unknown> {
  return {
    page: input.page,
    limit: input.limit,
    q: input.q?.trim() || undefined,
    status: input.status || undefined,
    levelId: input.levelId || undefined,
    sourceId: input.sourceId || undefined,
  };
}

export async function prospectList(input: ProspectListInput): Promise<ProspectListResult> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<ProspectListPayload>({
    query: LIST_QUERY,
    operationName: 'ListProspects',
    variables: { input: sanitizeListInput(input) },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.prospect_list ?? { items: [], total: 0, page: input.page, limit: input.limit };
}

export async function prospectGet(prospectId: string): Promise<Prospect | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<ProspectGetPayload>({
    query: GET_QUERY,
    operationName: 'GetProspect',
    variables: { id: prospectId },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.prospect_get ?? null;
}

export async function prospectCreate(input: ProspectCreateInput): Promise<Prospect | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<ProspectCreatePayload>({
    query: CREATE_MUTATION,
    operationName: 'CreateProspect',
    variables: { input },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.prospect_create ?? null;
}

export async function prospectUpdate(input: ProspectUpdateInput): Promise<Prospect | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<ProspectUpdatePayload>({
    query: UPDATE_MUTATION,
    operationName: 'UpdateProspect',
    variables: { input },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.prospect_update ?? null;
}

export async function prospectDelete(prospectId: string): Promise<boolean> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<ProspectDeletePayload>({
    query: DELETE_MUTATION,
    operationName: 'DeleteProspect',
    variables: { id: prospectId },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return Boolean(data?.prospect_delete);
}
