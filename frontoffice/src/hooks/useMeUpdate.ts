// src/hooks/useMeUpdate.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import inversify from '@src/commons/inversify';
import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';
import { GraphqlServiceFetch } from '@services/graphql/graphql.service.fetch';

export interface AddressInput {
    name: string;
    city: string;
    code: string;
    country: string;
}

export interface CompanyInput {
    name: string;
    address?: AddressInput | null;
}

export interface UpdateMeInput {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: AddressInput | null;
    company?: CompanyInput | null;
}

const ME_UPDATE_MUTATION = `
  mutation MeUpdate($input: UpdateMeInput!) {
    me_update(input: $input) {
      id
      first_name
      last_name
      email
      phone
      address {
        name
        city
        code
        country
      }
      company {
        name
        address {
          name
          city
          code
          country
        }
      }
    }
  }
`;

const ME_UPDATE_PASSWORD_MUTATION = `
  mutation MeUpdatePassword($password: String!) {
    me_update_password(password: $password)
  }
`;

export function useMeUpdate() {
    const { t } = useTranslation();
    const { execute } = useAsyncTask();
    const flashError = useFlashStore((state) => state.error);
    const flashSuccess = useFlashStore((state) => state.success);
    const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);
    const [loading, setLoading] = React.useState(false);

    const updateMe = React.useCallback(
        async (input: UpdateMeInput) => {
            setLoading(true);
            try {
                const { data, errors } = await execute(() =>
                    gql.send<{ me_update: any }>({
                        query: ME_UPDATE_MUTATION,
                        operationName: 'MeUpdate',
                        variables: { input },
                    }),
                );

                if (errors?.length) throw new Error(errors[0].message);
                flashSuccess(t('profile.notifications.update_success'));
                return data?.me_update;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Update failed';
                flashError(message);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [execute, flashError, flashSuccess, gql, t],
    );

    const updatePassword = React.useCallback(
        async (password: string) => {
            setLoading(true);
            try {
                const { data, errors } = await execute(() =>
                    gql.send<{ me_update_password: boolean }>({
                        query: ME_UPDATE_PASSWORD_MUTATION,
                        operationName: 'MeUpdatePassword',
                        variables: { password },
                    }),
                );

                if (errors?.length) throw new Error(errors[0].message);
                if (!data?.me_update_password) throw new Error('Password update failed');

                flashSuccess(t('profile.notifications.password_update_success'));
                return true;
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : 'Password update failed';
                flashError(message);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [execute, flashError, flashSuccess, gql, t],
    );

    return { updateMe, updatePassword, loading };
}
