// src/hooks/clients/useClientMetadataOptions.ts
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface ClientMetadataOption {
  id: string;
  label: string;
  slug?: string | null;
}

export interface ClientMetadataOptionsState {
  statuses: ClientMetadataOption[];
  levels: ClientMetadataOption[];
  sources: ClientMetadataOption[];
  objectives: ClientMetadataOption[];
  activityPreferences: ClientMetadataOption[];
}

const DEFAULT_STATE: ClientMetadataOptionsState = {
  statuses: [],
  levels: [],
  sources: [],
  objectives: [],
  activityPreferences: [],
};

const METADATA_QUERY = `
  query ClientMetadata {
    clientStatus_list(input: { page: 1, limit: 200 }) {
      items { id label slug }
    }
    clientLevel_list(input: { page: 1, limit: 200 }) {
      items { id label slug }
    }
    clientSource_list(input: { page: 1, limit: 200 }) {
      items { id label slug }
    }
    clientObjective_list(input: { page: 1, limit: 400 }) {
      items { id label }
    }
    clientActivityPreference_list(input: { page: 1, limit: 400 }) {
      items { id label }
    }
  }
`;

type MetadataPayload = {
  clientStatus_list: { items: ClientMetadataOption[] };
  clientLevel_list: { items: ClientMetadataOption[] };
  clientSource_list: { items: ClientMetadataOption[] };
  clientObjective_list: { items: ClientMetadataOption[] };
  clientActivityPreference_list: { items: ClientMetadataOption[] };
};

/** Load static dropdown options used across the client creation and edition flows. */
export function useClientMetadataOptions() {
  const [state, setState] = React.useState<ClientMetadataOptionsState>(DEFAULT_STATE);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();

  React.useEffect(() => {
    let mounted = true;

    const gql = new GraphqlServiceFetch(inversify);

    void execute(async () => {
      setLoading(true);
      try {
        const { data, errors } = await gql.send<MetadataPayload>({
          query: METADATA_QUERY,
          operationName: 'ClientMetadata',
        });
        if (errors?.length) {
          throw new Error(errors[0].message);
        }
        if (!mounted) return;
        setState({
          statuses: data?.clientStatus_list.items ?? [],
          levels: data?.clientLevel_list.items ?? [],
          sources: data?.clientSource_list.items ?? [],
          objectives: data?.clientObjective_list.items ?? [],
          activityPreferences: data?.clientActivityPreference_list.items ?? [],
        });
      } catch (error) {
        console.error('[useClientMetadataOptions] Failed to load metadata', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [execute]);

  return { ...state, loading };
}
