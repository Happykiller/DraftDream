// src/hooks/useUserProfileUpdate.ts
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { userUpdate, type UserUpdateInput } from '@services/graphql/user.service';

import { useAsyncTask } from '@hooks/useAsyncTask';
import { useFlashStore } from '@hooks/useFlashStore';

export interface UseUserProfileUpdateResult {
  update: (input: UserUpdateInput) => Promise<void>;
  loading: boolean;
}

/** Updates the authenticated user's profile information. */
export function useUserProfileUpdate(): UseUserProfileUpdateResult {
  const { t } = useTranslation();
  const { execute } = useAsyncTask();
  const flashError = useFlashStore((state) => state.error);
  const [loading, setLoading] = React.useState(false);

  const update = React.useCallback(
    async (input: UserUpdateInput) => {
      setLoading(true);
      try {
        const result = await execute(() => userUpdate(input));

        if (!result) {
          const message = t('athlete_information.notifications.update_failure');
          flashError(message);
          throw new Error(message);
        }
      } catch (caught: unknown) {
        const message =
          caught instanceof Error ? caught.message : t('athlete_information.notifications.update_failure');
        flashError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [execute, flashError, t],
  );

  return { update, loading };
}
