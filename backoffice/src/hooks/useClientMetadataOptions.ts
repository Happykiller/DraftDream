// src/hooks/useClientMetadataOptions.ts
// Comment in English: Loads reference options for client creation/update forms.
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface ClientMetadataOption {
  id: string;
  label: string;
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

const METADATA_Q = `
  query ClientMetadata {
    clientStatus_list(input: { page: 1, limit: 200 }) {
      items { id label }
    }
    clientLevel_list(input: { page: 1, limit: 200 }) {
      items { id label }
    }
    clientSource_list(input: { page: 1, limit: 200 }) {
      items { id label }
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

export function useClientMetadataOptions() {
  const [state, setState] = React.useState<ClientMetadataOptionsState>(DEFAULT_STATE);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((store) => store.error);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<MetadataPayload>({ query: METADATA_Q, operationName: 'ClientMetadata' }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setState({
        statuses: data?.clientStatus_list.items ?? [],
        levels: data?.clientLevel_list.items ?? [],
        sources: data?.clientSource_list.items ?? [],
        objectives: data?.clientObjective_list.items ?? [],
        activityPreferences: data?.clientActivityPreference_list.items ?? [],
      });
    } catch (error: any) {
      flashError(error?.message ?? 'Failed to load client metadata');
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return { ...state, loading, reload: load };
}
