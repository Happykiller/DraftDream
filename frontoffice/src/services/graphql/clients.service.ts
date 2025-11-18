// src/services/graphql/clients.service.ts
import inversify from '@src/commons/inversify';

import type { Client, ClientListResult } from '@app-types/clients';

import { GraphqlServiceFetch } from './graphql.service.fetch';

const CLIENT_FRAGMENT = `
  id
  firstName
  lastName
  email
  phone
  statusId
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
  createdBy
  createdAt
  updatedAt
  creator { id email first_name last_name }
  status { id label slug }
  level { id label slug }
  source { id label slug }
  objectives { id label }
  activityPreferences { id label }
`;

const LIST_QUERY = `
  query ListClients($input: ListClientsInput) {
    client_list(input: $input) {
      items {
        ${CLIENT_FRAGMENT}
      }
      total
      page
      limit
    }
  }
`;

const GET_QUERY = `
  query GetClient($id: ID!) {
    client_get(id: $id) {
      ${CLIENT_FRAGMENT}
    }
  }
`;

const CREATE_MUTATION = `
  mutation CreateClient($input: CreateClientInput!) {
    client_create(input: $input) {
      ${CLIENT_FRAGMENT}
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateClient($input: UpdateClientInput!) {
    client_update(input: $input) {
      ${CLIENT_FRAGMENT}
    }
  }
`;

const DELETE_MUTATION = `
  mutation DeleteClient($id: ID!) {
    client_delete(id: $id)
  }
`;

type ClientListPayload = { client_list: ClientListResult };
type ClientGetPayload = { client_get: Client | null };
type ClientCreatePayload = { client_create: Client | null };
type ClientUpdatePayload = { client_update: Client | null };
type ClientDeletePayload = { client_delete: boolean };

export interface ClientListInput {
  page: number;
  limit: number;
  q?: string;
  statusId?: string | null;
  levelId?: string | null;
  sourceId?: string | null;
}

export interface ClientCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  statusId?: string | null;
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

export interface ClientUpdateInput extends Partial<ClientCreateInput> {
  id: string;
}

function sanitizeListInput(input: ClientListInput): Record<string, unknown> {
  return {
    page: input.page,
    limit: input.limit,
    q: input.q?.trim() || undefined,
    statusId: input.statusId || undefined,
    levelId: input.levelId || undefined,
    sourceId: input.sourceId || undefined,
  };
}

export async function clientList(input: ClientListInput): Promise<ClientListResult> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<ClientListPayload>({
    query: LIST_QUERY,
    operationName: 'ListClients',
    variables: { input: sanitizeListInput(input) },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.client_list ?? { items: [], total: 0, page: input.page, limit: input.limit };
}

export async function clientGet(clientId: string): Promise<Client | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<ClientGetPayload>({
    query: GET_QUERY,
    operationName: 'GetClient',
    variables: { id: clientId },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.client_get ?? null;
}

export async function clientCreate(input: ClientCreateInput): Promise<Client | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<ClientCreatePayload>({
    query: CREATE_MUTATION,
    operationName: 'CreateClient',
    variables: { input },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.client_create ?? null;
}

export async function clientUpdate(input: ClientUpdateInput): Promise<Client | null> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<ClientUpdatePayload>({
    query: UPDATE_MUTATION,
    operationName: 'UpdateClient',
    variables: { input },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return data?.client_update ?? null;
}

export async function clientDelete(clientId: string): Promise<boolean> {
  const graphql = new GraphqlServiceFetch(inversify);
  const { data, errors } = await graphql.send<ClientDeletePayload>({
    query: DELETE_MUTATION,
    operationName: 'DeleteClient',
    variables: { id: clientId },
  });

  if (errors?.length) {
    throw new Error(errors[0].message);
  }

  return Boolean(data?.client_delete);
}
