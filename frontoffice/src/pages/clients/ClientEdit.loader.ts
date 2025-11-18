// src/pages/clients/ClientEdit.loader.ts
import type { LoaderFunctionArgs } from 'react-router-dom';

import { clientGet } from '@services/graphql/clients.service';
import type { Client } from '@app-types/clients';

export type ClientEditLoaderStatus = 'success' | 'not_found' | 'error';

export interface ClientEditLoaderData {
  client: Client | null;
  status: ClientEditLoaderStatus;
}

/** Loads the client being edited before rendering the form. */
export async function clientEditLoader({ params }: LoaderFunctionArgs): Promise<ClientEditLoaderData> {
  const clientId = params.clientId;

  if (!clientId) {
    return { client: null, status: 'not_found' } satisfies ClientEditLoaderData;
  }

  try {
    const client = await clientGet(clientId);
    if (!client) {
      return { client: null, status: 'not_found' } satisfies ClientEditLoaderData;
    }

    return { client, status: 'success' } satisfies ClientEditLoaderData;
  } catch (error) {
    console.error('[clientEditLoader] Failed to fetch client', error);
    return { client: null, status: 'error' } satisfies ClientEditLoaderData;
  }
}
