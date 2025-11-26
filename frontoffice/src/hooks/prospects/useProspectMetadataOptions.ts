// src/hooks/prospects/useProspectMetadataOptions.ts
import * as React from 'react';

import inversify from '@src/commons/inversify';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface ProspectMetadataOption {
  id: string;
  label: string;
  slug?: string | null;
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

const METADATA_QUERY = `
  query ProspectMetadata {
    prospectLevel_list(input: { page: 1, limit: 200 }) {
      items { id label slug }
    }
    prospectSource_list(input: { page: 1, limit: 200 }) {
      items { id label slug }
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

/** Load static dropdown options used across the prospect creation and edition flows. */
export function useProspectMetadataOptions() {
  const [state, setState] = React.useState<ProspectMetadataOptionsState>(DEFAULT_STATE);
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
          operationName: 'ProspectMetadata',
        });
        if (errors?.length) {
          throw new Error(errors[0].message);
        }
        if (!mounted) return;
        setState({
          levels: data?.prospectLevel_list.items ?? [],
          sources: data?.prospectSource_list.items ?? [],
          objectives: data?.prospectObjective_list.items ?? [],
          activityPreferences: data?.prospectActivityPreference_list.items ?? [],
        });
      } catch (error) {
        console.error('[useProspectMetadataOptions] Failed to load metadata', error);
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
