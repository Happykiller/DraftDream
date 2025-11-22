// src/hooks/useProspectMetadataOptions.ts
// Comment in English: Loads reference options for prospect creation/update forms.
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface ProspectMetadataOption {
  id: string;
  label: string;
}

export interface ProspectMetadataOptionsState {
  levels: ProspectMetadataOption[];
  sources: ProspectMetadataOption[];
  objectives: ProspectMetadataOption[];
  activityPreferences: ProspectMetadataOption[];
}

const DEFAULT_STATE: ProspectMetadataOptionsState = {
  levels: [],
  sources: [],
  objectives: [],
  activityPreferences: [],
};

const METADATA_Q = `
  query ProspectMetadata {
    prospectLevel_list(input: { page: 1, limit: 200 }) {
      items { id label }
    }
    prospectSource_list(input: { page: 1, limit: 200 }) {
      items { id label }
    }
    prospectObjective_list(input: { page: 1, limit: 400 }) {
      items { id label }
    }
    prospectActivityPreference_list(input: { page: 1, limit: 400 }) {
      items { id label }
    }
  }
`;

type MetadataPayload = {
  prospectLevel_list: { items: ProspectMetadataOption[] };
  prospectSource_list: { items: ProspectMetadataOption[] };
  prospectObjective_list: { items: ProspectMetadataOption[] };
  prospectActivityPreference_list: { items: ProspectMetadataOption[] };
};

export function useProspectMetadataOptions() {
  const [state, setState] = React.useState<ProspectMetadataOptionsState>(DEFAULT_STATE);
  const [loading, setLoading] = React.useState(false);
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((store) => store.error);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, errors } = await execute(() =>
        gql.send<MetadataPayload>({ query: METADATA_Q, operationName: 'ProspectMetadata' }),
      );
      if (errors?.length) throw new Error(errors[0].message);
      setState({
        levels: data?.prospectLevel_list.items ?? [],
        sources: data?.prospectSource_list.items ?? [],
        objectives: data?.prospectObjective_list.items ?? [],
        activityPreferences: data?.prospectActivityPreference_list.items ?? [],
      });
    } catch (error: any) {
      flashError(error?.message ?? 'Failed to load prospect metadata');
    } finally {
      setLoading(false);
    }
  }, [execute, flashError, gql]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return { ...state, loading, reload: load };
}
